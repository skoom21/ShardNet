# client/models/peer_models.py
from pydantic import BaseModel
from typing import List, Optional

class PeerRegistrationRequest(BaseModel):
    ip: str
    port: int
    status: Optional[str] = "active"

class FileAdvertisement(BaseModel):
    peer_id: str
    files: List[str]

class FileSearchRequest(BaseModel):
    filename: str

class PeerStatusUpdate(BaseModel):
    peer_id: str
    status: str

class FileRemovalRequest(BaseModel):
    peer_id: str
    filename: str
