# client/core/tracker_manager.py
import requests

COORDINATOR_URL = "http://127.0.0.1:8000"  # Coordinator API

def register_peer(ip: str, port: int) -> str:
    response = requests.post(f"{COORDINATOR_URL}/register_peer", json={"ip": ip, "port": port})
    if response.status_code == 200:
        
        return response.json()["peer_id"]
    return None

def search_file(filename: str):
    response = requests.get(f"{COORDINATOR_URL}/search_file?filename={filename}")
    if response.status_code == 200:
        return response.json()["peers"]
    return None
