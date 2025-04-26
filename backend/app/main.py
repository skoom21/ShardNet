from fastapi import FastAPI, HTTPException, Query
from app.models.peer import PeerRegistration, FileAdvertisement
from pydantic import BaseModel
from app.database.memory import peers
from typing import List, Optional
import uuid
import logging

# Initialize FastAPI app
app = FastAPI()


# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("TrackerServer")

@app.get("/")
def read_root():
    logger.debug("Root endpoint accessed.")
    return {"message": "Coordinator API is running."}

@app.post("/register_peer")
def register_peer(peer: PeerRegistration):
    peer_id = str(uuid.uuid4())
    if not peer.ip or not peer.port:
        logger.error("Invalid peer registration data.")
        raise HTTPException(status_code=400, detail="Invalid peer data.")
    
    peers[peer_id] = {
        "ip": peer.ip,
        "port": peer.port,
        "status": "active",
        "files": []
    }
    logger.info(f"Peer registered successfully: {peer_id}")
    return {"peer_id": peer_id, "message": "Peer registered successfully."}

@app.post("/advertise_file")
def advertise_file(file_ad: FileAdvertisement):
    if file_ad.peer_id not in peers:
        logger.error(f"Peer not found: {file_ad.peer_id}")
        raise HTTPException(status_code=404, detail="Peer not found")
    
    if not file_ad.files:
        logger.error("No files provided for advertisement.")
        raise HTTPException(status_code=400, detail="No files provided.")
    
    peers[file_ad.peer_id]["files"] = list(set(peers[file_ad.peer_id]["files"] + file_ad.files))
    logger.info(f"Files advertised by peer {file_ad.peer_id}: {file_ad.files}")
    return {"message": "Files updated successfully."}

@app.get("/search_file")
def search_file(filename: str):
    logger.debug(f"Searching for file: {filename}")
    result = []

    for peer_id, info in peers.items():
        if filename in info["files"]:
            result.append({
                "peer_id": peer_id,
                "ip": info["ip"],
                "port": info["port"]
            })

    if not result:
        logger.warning(f"File not found in the network: {filename}")
        raise HTTPException(status_code=404, detail="File not found in the network.")

    logger.info(f"File found on peers: {result}")
    return {"peers": result}

@app.get("/list_peers")
def list_peers():
    logger.debug("Listing all peers.")
    return peers

@app.post("/deregister_peer")
def deregister_peer(peer_id: str):
    if peer_id not in peers:
        logger.error(f"Peer not found for deregistration: {peer_id}")
        raise HTTPException(status_code=404, detail="Peer not found")
    
    del peers[peer_id]
    logger.info(f"Peer deregistered successfully: {peer_id}")
    return {"message": "Peer deregistered successfully."}

@app.post("/update_peer_status")
def update_peer_status(peer_id: str, status: str = Query(..., regex="^(active|inactive)$")):
    if peer_id not in peers:
        logger.error(f"Peer not found for status update: {peer_id}")
        raise HTTPException(status_code=404, detail="Peer not found")
    
    peers[peer_id]["status"] = status
    logger.info(f"Peer {peer_id} status updated to {status}.")
    return {"message": f"Peer status updated to {status}."}

@app.post("/remove_file")
def remove_file(peer_id: str, filename: str):
    if peer_id not in peers:
        logger.error(f"Peer not found for file removal: {peer_id}")
        raise HTTPException(status_code=404, detail="Peer not found")
    
    if filename not in peers[peer_id]["files"]:
        logger.warning(f"File not found for removal: {filename}")
        raise HTTPException(status_code=404, detail="File not found for this peer.")
    
    peers[peer_id]["files"].remove(filename)
    logger.info(f"File {filename} removed from peer {peer_id}.")
    return {"message": f"File {filename} removed successfully."}

@app.get("/peer_info")
def peer_info(peer_id: str):
    if peer_id not in peers:
        logger.error(f"Peer not found for info retrieval: {peer_id}")
        raise HTTPException(status_code=404, detail="Peer not found")
    
    logger.debug(f"Retrieving info for peer: {peer_id}")
    return peers[peer_id]