import json
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("TrackerDatabase")

# Path to store peer data
PEERS_FILE = Path.home() / ".shardnet" / "tracker" / "peers.json"

# Initialize peers dictionary
peers = {}

def load_peers():
    """Load peers from file if it exists"""
    try:
        if PEERS_FILE.exists():
            with open(PEERS_FILE, 'r') as f:
                global peers
                peers = json.load(f)
                logger.info(f"Loaded {len(peers)} peers from storage")
    except Exception as e:
        logger.error(f"Error loading peers: {str(e)}")

def save_peers():
    """Save peers to file"""
    try:
        PEERS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(PEERS_FILE, 'w') as f:
            json.dump(peers, f)
        logger.info(f"Saved {len(peers)} peers to storage")
    except Exception as e:
        logger.error(f"Error saving peers: {str(e)}")

# Load peers on module import
load_peers()