# client/core/file_manager.py
import os
import requests

FILE_STORAGE_DIR = "../shared_files"
COORDINATOR_URL = "http://127.0.0.1:8000"  # Coordinator API

os.makedirs(FILE_STORAGE_DIR, exist_ok=True)

def upload_file(filename: str, file_data: bytes, peer_id: str):
    """Uploads the file to the local storage and notifies the coordinator."""
    file_path = os.path.join(FILE_STORAGE_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(file_data)
    print(f"File '{filename}' uploaded successfully.")

    # Notify the coordinator about the uploaded file
    response = requests.post(f"{COORDINATOR_URL}/advertise_file", json={"peer_id": peer_id, "filename": filename, "file_data": file_data.decode('utf-8') if isinstance(file_data, bytes) else file_data})
    if response.status_code == 200:
        print(f"Coordinator notified about file '{filename}'.")
    else:
        print(f"Failed to notify coordinator about file '{filename}'. Status code: {response.status_code}")

def download_file(filename: str) -> bytes:
    """Downloads the file from the local storage."""
    file_path = os.path.join(FILE_STORAGE_DIR, filename)
    if os.path.exists(file_path):
        with open(file_path, "rb") as f:
            return f.read()
    else:
        raise FileNotFoundError(f"File '{filename}' not found.")
