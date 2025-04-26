# client/models/peer_models.py
from pydantic import BaseModel

class PeerRegistrationRequest(BaseModel):
    ip: str
    port: int
