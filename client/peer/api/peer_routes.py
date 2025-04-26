# client/api/peer_routes.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from peer.models.peer_models import PeerRegistrationRequest
from peer.core.tracker_manager import register_peer, search_file
from peer.database.memory import id_peer

router = APIRouter()

class FileSearchRequest(BaseModel):
    filename: str

@router.post("/register_peer", summary="Register a peer in the network")
async def register_peer_api(request: PeerRegistrationRequest):
    try:
        peer_id = register_peer(request.ip, request.port)
        if peer_id:
            id_peer[0] = peer_id
            return {"message": "Peer registered successfully", "peer_id": peer_id}
        raise HTTPException(status_code=400, detail="Peer registration failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/search_file", summary="Search for a file in the network")
async def search_file_api(request: FileSearchRequest):
    try:
        results = search_file(request.filename)
        if results:
            return {"peers": results}
        raise HTTPException(status_code=404, detail="File not found in the network")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
