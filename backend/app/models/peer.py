# backend/app/models/peer.py

from pydantic import BaseModel
from typing import List

class PeerRegistration(BaseModel):
    ip: str
    port: int

class FileAdvertisement(BaseModel):
    peer_id: str
    files: List[str]
