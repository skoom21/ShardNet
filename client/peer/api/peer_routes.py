# client/api/peer_routes.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from peer.models.peer_models import (
    PeerRegistrationRequest,
    FileAdvertisement,
    FileSearchRequest,
    PeerStatusUpdate,
    FileRemovalRequest
)
from peer.core.tracker_manager import (
    register_peer,
    search_file,
    advertise_files,
    update_peer_status,
    remove_file,
    get_peer_info,
    list_peers
)
from peer.database.memory import id_peer
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("PeerClient")

router = APIRouter()

@router.post("/register_peer", summary="Register a peer in the network")
async def register_peer_api(request: PeerRegistrationRequest):
    try:
        logger.info(f"Registering peer with IP: {request.ip}, Port: {request.port}")
        peer_id = register_peer(request.ip, request.port)
        if peer_id:
            id_peer[0] = peer_id
            logger.info(f"Peer registered successfully with ID: {peer_id}")
            return {"message": "Peer registered successfully", "peer_id": peer_id}
        logger.error("Peer registration failed")
        raise HTTPException(status_code=400, detail="Peer registration failed")
    except Exception as e:
        logger.error(f"Error during peer registration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/advertise_files", summary="Advertise files to the network")
async def advertise_files_api(request: FileAdvertisement):
    try:
        logger.info(f"Advertising files for peer {request.peer_id}: {request.files}")
        result = advertise_files(request.peer_id, request.files)
        if result:
            return {"message": "Files advertised successfully"}
        raise HTTPException(status_code=400, detail="File advertisement failed")
    except Exception as e:
        logger.error(f"Error during file advertisement: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/search_file", summary="Search for a file in the network")
async def search_file_api(request: FileSearchRequest):
    try:
        logger.info(f"Searching for file: {request.filename}")
        results = search_file(request.filename)
        if results:
            logger.info(f"File found on peers: {results}")
            return {"peers": results}
        logger.warning(f"File not found: {request.filename}")
        raise HTTPException(status_code=404, detail="File not found in the network")
    except Exception as e:
        logger.error(f"Error during file search: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/update_status", summary="Update peer status")
async def update_status_api(request: PeerStatusUpdate):
    try:
        logger.info(f"Updating status for peer {request.peer_id} to {request.status}")
        result = update_peer_status(request.peer_id, request.status)
        if result:
            return {"message": f"Peer status updated to {request.status}"}
        raise HTTPException(status_code=400, detail="Status update failed")
    except Exception as e:
        logger.error(f"Error during status update: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/remove_file", summary="Remove a file from peer's shared files")
async def remove_file_api(request: FileRemovalRequest):
    try:
        logger.info(f"Removing file {request.filename} from peer {request.peer_id}")
        result = remove_file(request.peer_id, request.filename)
        if result:
            return {"message": f"File {request.filename} removed successfully"}
        raise HTTPException(status_code=400, detail="File removal failed")
    except Exception as e:
        logger.error(f"Error during file removal: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/peer_info/{peer_id}", summary="Get peer information")
async def peer_info_api(peer_id: str):
    try:
        logger.info(f"Retrieving info for peer: {peer_id}")
        info = get_peer_info(peer_id)
        if info:
            return info
        raise HTTPException(status_code=404, detail="Peer not found")
    except Exception as e:
        logger.error(f"Error retrieving peer info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/list_peers", summary="List all active peers in the network")
async def list_peers_api():
    try:
        logger.info("Listing all peers in the network")
        peers_data = list_peers()
        if peers_data is None:
            logger.error("Failed to get peers from tracker")
            raise HTTPException(status_code=500, detail="Failed to list peers")
        
        # Ensure we have a peers array in the response
        if not isinstance(peers_data, dict) or "peers" not in peers_data:
            logger.warning("Unexpected response format from tracker, converting to expected format")
            peers_data = {"peers": []}
        
        logger.info(f"Returning {len(peers_data['peers'])} peers")
        return peers_data
    except Exception as e:
        logger.error(f"Error listing peers: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
