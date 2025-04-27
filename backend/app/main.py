from fastapi import FastAPI, HTTPException, Query, Request
from app.models.peer import PeerRegistration, FileAdvertisement
from pydantic import BaseModel, ValidationError
from app.database.memory import peers, save_peers
from typing import List, Optional, Dict
import uuid
import logging
import traceback
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('tracker.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("TrackerServer")

# Initialize FastAPI app
app = FastAPI()

# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    response = await call_next(request)
    duration = datetime.now() - start_time
    
    logger.info(
        f"Request: {request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Duration: {duration.total_seconds()}s"
    )
    return response

@app.get("/")
def read_root():
    logger.debug("Root endpoint accessed")
    return {"message": "Coordinator API is running"}

@app.post("/register_peer")
async def register_peer(peer: PeerRegistration):
    """Register a new peer"""
    try:
        logger.info(f"Attempting to register peer with IP: {peer.ip}, Port: {peer.port}")
        
        if not peer.ip or not peer.port:
            logger.error("Invalid peer registration data: missing IP or port")
            raise HTTPException(status_code=400, detail="Invalid peer data: IP and port are required")
        
        # Generate deterministic peer ID based on IP and port
        peer_key = f"{peer.ip}:{peer.port}"
        peer_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, peer_key))
        
        # Check if peer already exists
        if peer_id in peers:
            logger.info(f"Peer {peer_id} already registered, updating last seen")
            peers[peer_id]["last_seen"] = datetime.now().isoformat()
            peers[peer_id]["status"] = "active"
        else:
            # Register new peer
            peers[peer_id] = {
                "ip": peer.ip,
                "port": peer.port,
                "status": "active",
                "files": [],
                "last_seen": datetime.now().isoformat()
            }
            logger.info(f"New peer registered successfully: {peer_id}")
        
        save_peers()  # Save after registration/update
        return {"peer_id": peer_id, "message": "Peer registered successfully"}
    except ValidationError as e:
        logger.error(f"Validation error during peer registration: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during peer registration: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Internal server error during peer registration")

@app.post("/advertise_file")
async def advertise_file(file_ad: FileAdvertisement):
    """Advertise files for a peer"""
    try:
        logger.info(f"File advertisement request from peer {file_ad.peer_id}")
        
        if file_ad.peer_id not in peers:
            logger.error(f"Peer not found: {file_ad.peer_id}")
            raise HTTPException(status_code=404, detail="Peer not found")
        
        if not file_ad.files:
            logger.error("No files provided for advertisement")
            raise HTTPException(status_code=400, detail="No files provided")
        
        # Update peer's last seen timestamp
        peers[file_ad.peer_id]["last_seen"] = datetime.now().isoformat()
        
        # Add new files to peer's list
        current_files = set(peers[file_ad.peer_id]["files"])
        new_files = set(file_ad.files)
        added_files = new_files - current_files
        
        peers[file_ad.peer_id]["files"] = list(current_files | new_files)
        save_peers()  # Save after file advertisement
        
        logger.info(f"Files advertised by peer {file_ad.peer_id}: {file_ad.files}")
        logger.debug(f"New files added: {added_files}")
        
        return {"message": "Files updated successfully", "added_files": list(added_files)}
    except ValidationError as e:
        logger.error(f"Validation error during file advertisement: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during file advertisement: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Internal server error during file advertisement")

@app.post("/heartbeat")
async def update_peer_status(peer_id: str):
    """Update peer's last seen timestamp"""
    try:
        if peer_id not in peers:
            raise HTTPException(status_code=404, detail="Peer not found")
        peers[peer_id]["last_seen"] = datetime.now().isoformat()
        save_peers()  # Save after heartbeat
        logger.debug(f"Heartbeat received from peer {peer_id}")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error updating peer status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search_file")
def search_file(filename: str):
    try:
        logger.info(f"Searching for file: {filename}")
        
        if not filename:
            logger.error("Empty filename provided for search")
            raise HTTPException(status_code=400, detail="Filename is required")
        
        result = []
        for peer_id, info in peers.items():
            if info["status"] == "active" and filename in info["files"]:
                result.append({
                    "peer_id": peer_id,
                    "ip": info["ip"],
                    "port": info["port"],
                    "last_seen": info["last_seen"]
                })
        
        if not result:
            logger.warning(f"File not found in the network: {filename}")
            raise HTTPException(status_code=404, detail="File not found in the network")
        
        logger.info(f"File found on {len(result)} peers")
        return {"peers": result}
    except Exception as e:
        logger.error(f"Unexpected error during file search: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Internal server error during file search")

@app.get("/list_peers")
def list_peers():
    try:
        logger.info("Listing all peers")
        active_peers = {pid: info for pid, info in peers.items() if info["status"] == "active"}
        logger.info(f"Found {len(active_peers)} active peers")
        
        # Convert dictionary to array of peers with their IDs
        peers_list = [
            {
                "peer_id": pid,
                "ip": info["ip"],
                "port": info["port"],
                "status": info["status"],
                "last_seen": info["last_seen"],
                "files": info["files"]
            }
            for pid, info in active_peers.items()
        ]
        
        return {"peers": peers_list}
    except Exception as e:
        logger.error(f"Unexpected error listing peers: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Internal server error while listing peers")

@app.post("/deregister_peer")
def deregister_peer(peer_id: str):
    try:
        logger.info(f"Attempting to deregister peer: {peer_id}")
        
        if peer_id not in peers:
            logger.error(f"Peer not found for deregistration: {peer_id}")
            raise HTTPException(status_code=404, detail="Peer not found")
        
        del peers[peer_id]
        logger.info(f"Peer deregistered successfully: {peer_id}")
        return {"message": "Peer deregistered successfully"}
    except Exception as e:
        logger.error(f"Unexpected error during peer deregistration: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Internal server error during peer deregistration")

@app.post("/update_peer_status")
def update_peer_status(peer_id: str, status: str = Query(..., regex="^(active|offline)$")):
    try:
        logger.info(f"Updating status for peer {peer_id} to {status}")
        
        if peer_id not in peers:
            logger.error(f"Peer {peer_id} not found")
            raise HTTPException(status_code=404, detail="Peer not found")
        
        peers[peer_id]["status"] = status
        peers[peer_id]["last_seen"] = datetime.now().isoformat()
        
        logger.info(f"Successfully updated peer {peer_id} status to {status}")
        return {"message": f"Peer status updated to {status}"}
    except Exception as e:
        logger.error(f"Error updating peer status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating peer status: {str(e)}")

@app.post("/remove_file")
def remove_file(peer_id: str, filename: str):
    try:
        logger.info(f"Removing file {filename} from peer {peer_id}")
        
        if peer_id not in peers:
            logger.error(f"Peer not found for file removal: {peer_id}")
            raise HTTPException(status_code=404, detail="Peer not found")
        
        if filename not in peers[peer_id]["files"]:
            logger.warning(f"File not found for removal: {filename}")
            raise HTTPException(status_code=404, detail="File not found for this peer")
        
        peers[peer_id]["files"].remove(filename)
        logger.info(f"File {filename} removed from peer {peer_id}")
        return {"message": f"File {filename} removed successfully"}
    except Exception as e:
        logger.error(f"Unexpected error during file removal: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Internal server error during file removal")

@app.get("/peer_info")
def peer_info(peer_id: str):
    try:
        logger.info(f"Retrieving info for peer: {peer_id}")
        
        if peer_id not in peers:
            logger.error(f"Peer not found for info retrieval: {peer_id}")
            raise HTTPException(status_code=404, detail="Peer not found")
        
        logger.debug(f"Peer info retrieved successfully: {peer_id}")
        return peers[peer_id]
    except Exception as e:
        logger.error(f"Unexpected error retrieving peer info: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Internal server error while retrieving peer info")