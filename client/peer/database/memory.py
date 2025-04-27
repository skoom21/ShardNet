from typing import Dict
import json
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("PeerDatabase")

# Initialize peer ID storage
# Using dict with 0 as key to maintain compatibility with existing code
id_peer: Dict[int, str] = {0: None}  # None indicates no peer ID set yet

# Path to store peer ID
PEER_ID_FILE = Path.home() / ".shardnet" / "peer_id.json"

def load_peer_id():
    """Load peer ID from file if it exists"""
    try:
        if PEER_ID_FILE.exists():
            with open(PEER_ID_FILE, 'r') as f:
                data = json.load(f)
                id_peer[0] = data.get('peer_id')
                logger.info(f"Loaded peer ID: {id_peer[0]}")
    except Exception as e:
        logger.error(f"Error loading peer ID: {str(e)}")

def save_peer_id(peer_id: str):
    """Save peer ID to file"""
    try:
        PEER_ID_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(PEER_ID_FILE, 'w') as f:
            json.dump({'peer_id': peer_id}, f)
        id_peer[0] = peer_id
        logger.info(f"Saved peer ID: {peer_id}")
    except Exception as e:
        logger.error(f"Error saving peer ID: {str(e)}")

# Don't load peer ID on startup anymore
# load_peer_id()