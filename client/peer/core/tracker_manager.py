# client/core/tracker_manager.py
import requests
import logging
import traceback
from typing import List, Dict, Optional
from datetime import datetime
from peer.models.peer_models import (
    PeerRegistrationRequest,
    FileAdvertisement,
    PeerStatusUpdate,
    FileRemovalRequest
)
from peer.database.memory import id_peer, save_peer_id

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('client.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("TrackerManager")

# Tracker server configuration
TRACKER_URL = "http://localhost:8000"  # Update this with your tracker's URL

def register_peer(ip: str, port: int) -> Optional[str]:
    """
    Register a peer with the tracker server
    """
    try:
        logger.info(f"Attempting to register peer with IP: {ip}, Port: {port}")
        
        # First check if we have a stored peer ID
        if id_peer.get(0):
            logger.info(f"Found existing peer ID: {id_peer[0]}")
            # Verify the peer ID is still valid
            try:
                response = requests.get(
                    f"{TRACKER_URL}/peer_info",
                    params={"peer_id": id_peer[0]},
                    timeout=5
                )
                if response.status_code == 200:
                    peer_info = response.json()
                    if peer_info.get("ip") == ip and peer_info.get("port") == port:
                        logger.info(f"Using existing peer ID: {id_peer[0]}")
                        return id_peer[0]
            except Exception:
                logger.warning("Failed to verify existing peer ID, will register as new peer")
        
        # Register as new peer or re-register
        response = requests.post(
            f"{TRACKER_URL}/register_peer",
            json={"ip": ip, "port": port},
            timeout=5
        )
        response.raise_for_status()
        
        peer_id = response.json().get("peer_id")
        if not peer_id:
            logger.error("No peer_id received from tracker")
            return None

        # Save the peer ID
        save_peer_id(peer_id)
        logger.info(f"Successfully registered peer with ID: {peer_id}")
        return peer_id
    except requests.exceptions.Timeout:
        logger.error("Timeout while registering peer with tracker")
        return None
    except requests.exceptions.ConnectionError:
        logger.error("Could not connect to tracker server")
        return None
    except requests.exceptions.RequestException as e:
        logger.error(f"Error registering peer: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error during peer registration: {str(e)}\n{traceback.format_exc()}")
        return None

def advertise_files(peer_id: str, files: List[str]) -> bool:
    """
    Advertise files to the tracker server
    """
    try:
        logger.info(f"Advertising {len(files)} files for peer {peer_id}")
        
        if not files:
            logger.warning("No files provided for advertisement")
            return False
            
        response = requests.post(
            f"{TRACKER_URL}/advertise_file",
            json={"peer_id": peer_id, "files": files},
            timeout=5
        )
        response.raise_for_status()
        
        logger.info(f"Successfully advertised files: {files}")
        return True
    except requests.exceptions.Timeout:
        logger.error("Timeout while advertising files to tracker")
        return False
    except requests.exceptions.ConnectionError:
        logger.error("Could not connect to tracker server")
        return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Error advertising files: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error during file advertisement: {str(e)}\n{traceback.format_exc()}")
        return False

def search_file(filename: str) -> List[Dict]:
    """
    Search for a file in the network
    """
    try:
        logger.info(f"Searching for file: {filename}")
        
        if not filename:
            logger.warning("Empty filename provided for search")
            return []
            
        response = requests.get(
            f"{TRACKER_URL}/search_file",
            params={"filename": filename},
            timeout=5
        )
        response.raise_for_status()
        
        peers = response.json().get("peers", [])
        logger.info(f"Found {len(peers)} peers with the file")
        return peers
    except requests.exceptions.Timeout:
        logger.error("Timeout while searching for file")
        return []
    except requests.exceptions.ConnectionError:
        logger.error("Could not connect to tracker server")
        return []
    except requests.exceptions.RequestException as e:
        logger.error(f"Error searching for file: {str(e)}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error during file search: {str(e)}\n{traceback.format_exc()}")
        return []

def update_peer_status(peer_id: str, status: str) -> bool:
    """
    Update peer status on the tracker server
    """
    try:
        logger.info(f"Updating status for peer {peer_id} to {status}")
        
        response = requests.post(
            f"{TRACKER_URL}/update_peer_status",
            params={"peer_id": peer_id, "status": status},
            timeout=5
        )
        response.raise_for_status()
        
        logger.info(f"Successfully updated peer status to {status}")
        return True
    except requests.exceptions.Timeout:
        logger.error("Timeout while updating peer status")
        return False
    except requests.exceptions.ConnectionError:
        logger.error("Could not connect to tracker server")
        return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Error updating peer status: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error during status update: {str(e)}\n{traceback.format_exc()}")
        return False

def remove_file(peer_id: str, filename: str) -> bool:
    """
    Remove a file from peer's shared files
    """
    try:
        logger.info(f"Removing file {filename} from peer {peer_id}")
        
        response = requests.post(
            f"{TRACKER_URL}/remove_file",
            params={"peer_id": peer_id, "filename": filename},
            timeout=5
        )
        response.raise_for_status()
        
        logger.info(f"Successfully removed file {filename}")
        return True
    except requests.exceptions.Timeout:
        logger.error("Timeout while removing file")
        return False
    except requests.exceptions.ConnectionError:
        logger.error("Could not connect to tracker server")
        return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Error removing file: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error during file removal: {str(e)}\n{traceback.format_exc()}")
        return False

def get_peer_info(peer_id: str) -> Optional[Dict]:
    """
    Get information about a peer
    """
    try:
        logger.info(f"Retrieving info for peer: {peer_id}")
        
        response = requests.get(
            f"{TRACKER_URL}/peer_info",
            params={"peer_id": peer_id},
            timeout=5
        )
        response.raise_for_status()
        
        info = response.json()
        logger.info(f"Successfully retrieved info for peer {peer_id}")
        return info
    except requests.exceptions.Timeout:
        logger.error("Timeout while getting peer info")
        return None
    except requests.exceptions.ConnectionError:
        logger.error("Could not connect to tracker server")
        return None
    except requests.exceptions.RequestException as e:
        logger.error(f"Error getting peer info: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error retrieving peer info: {str(e)}\n{traceback.format_exc()}")
        return None

def list_peers() -> Optional[Dict]:
    """
    Get list of all active peers from the tracker
    """
    try:
        logger.info("Retrieving list of all peers")
        
        response = requests.get(
            f"{TRACKER_URL}/list_peers",
            timeout=5
        )
        response.raise_for_status()
        
        peers = response.json()
        logger.info(f"Successfully retrieved {len(peers)} peers")
        return peers
    except requests.exceptions.Timeout:
        logger.error("Timeout while listing peers")
        return None
    except requests.exceptions.ConnectionError:
        logger.error("Could not connect to tracker server")
        return None
    except requests.exceptions.RequestException as e:
        logger.error(f"Error listing peers: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error listing peers: {str(e)}\n{traceback.format_exc()}")
        return None 