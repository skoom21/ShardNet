# client/core/file_manager.py
import os
import requests
import logging
import traceback
import hashlib
import time
import shutil
from typing import Optional, Dict
from datetime import datetime
from pathlib import Path
from peer.core.tracker_manager import search_file

# Configure logging
log_dir = Path.home() / ".shardnet" / "logs"
log_dir.mkdir(parents=True, exist_ok=True)
log_file = log_dir / "file_manager.log"

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("FileManager")

# Constants
FILE_STORAGE_DIR = Path.home() / ".shardnet" / "shared_files"
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
DOWNLOAD_RETRIES = 3
DOWNLOAD_TIMEOUT = 30  # seconds
CHUNK_SIZE = 8192  # bytes
LOCK_FILE_EXTENSION = ".lock"

# Ensure directory exists
FILE_STORAGE_DIR.mkdir(parents=True, exist_ok=True)

def is_file_locked(file_path: Path) -> bool:
    """Check if a file is locked (being downloaded/uploaded)"""
    return (file_path.parent / f"{file_path.name}{LOCK_FILE_EXTENSION}").exists()

def create_lock_file(file_path: Path) -> None:
    """Create a lock file for a file operation"""
    lock_file = file_path.parent / f"{file_path.name}{LOCK_FILE_EXTENSION}"
    lock_file.touch()

def remove_lock_file(file_path: Path) -> None:
    """Remove a lock file"""
    lock_file = file_path.parent / f"{file_path.name}{LOCK_FILE_EXTENSION}"
    if lock_file.exists():
        lock_file.unlink()

def calculate_file_hash(file_path: Path) -> str:
    """Calculate SHA-256 hash of a file"""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(CHUNK_SIZE), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def upload_file(file_path: str) -> Dict[str, any]:
    """
    Upload a file to the shared directory
    Returns dict with success status and file info
    """
    try:
        source_path = Path(file_path)
        if not source_path.exists():
            logger.error(f"Source file not found: {file_path}")
            return {"success": False, "error": "Source file not found"}

        if not source_path.is_file():
            logger.error(f"Source path is not a file: {file_path}")
            return {"success": False, "error": "Source path is not a file"}

        file_size = source_path.stat().st_size
        if file_size > MAX_FILE_SIZE:
            logger.error(f"File too large: {file_size} bytes")
            return {"success": False, "error": "File too large"}

        file_name = source_path.name
        if file_name.startswith("temp_"):
            file_name = file_name[5:]  # Remove 'temp_' prefix
        
        dest_path = FILE_STORAGE_DIR / file_name
        
        # Check for existing file and remove it if it exists
        if dest_path.exists():
            logger.warning(f"File already exists, overwriting: {file_name}")
            dest_path.unlink()
        
        # Create lock file
        create_lock_file(dest_path)
        
        try:
            # Calculate file hash from source file
            file_hash = calculate_file_hash(source_path)
            
            # Copy file with progress tracking
            with open(source_path, 'rb') as src, open(dest_path, 'wb') as dst:
                total_size = file_size
                copied = 0
                while True:
                    chunk = src.read(CHUNK_SIZE)
                    if not chunk:
                        break
                    dst.write(chunk)
                    copied += len(chunk)
                    progress = (copied / total_size) * 100
                    logger.debug(f"Upload progress: {progress:.1f}%")
            
            # Verify file integrity
            if calculate_file_hash(dest_path) != file_hash:
                raise ValueError("File integrity check failed")
            
            return {
                "success": True,
                "file_info": {
                    "name": file_name,
                    "size": file_size,
                    "hash": file_hash,
                    "modified": datetime.now().isoformat()
                }
            }
        finally:
            remove_lock_file(dest_path)
            
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}\n{traceback.format_exc()}")
        if dest_path.exists():
            dest_path.unlink()
        return {"success": False, "error": str(e)}

def download_file(filename: str, peer_info: Optional[Dict] = None) -> Dict[str, any]:
    """
    Download a file from the network
    Returns dict with success status and file info
    """
    try:
        file_path = FILE_STORAGE_DIR / filename
        
        # Check if file is already being downloaded
        if is_file_locked(file_path):
            logger.warning(f"File is currently being downloaded: {filename}")
            return {"success": False, "error": "File is currently being downloaded"}
        
        # First, search for the file in the network
        peers = search_file(filename)
        if not peers:
            logger.warning(f"File not found in network: {filename}")
            return {"success": False, "error": "File not found in network"}
        
        # Create lock file
        create_lock_file(file_path)
        
        try:
            # Try each peer until successful
            for peer in peers:
                for attempt in range(DOWNLOAD_RETRIES):
                    try:
                        # Properly encode the filename for the URL
                        encoded_filename = requests.utils.quote(filename)
                        url = f"http://{peer['ip']}:{peer['port']}/api/download_file/{encoded_filename}"
                        
                        # Set a longer timeout for the initial connection
                        response = requests.get(
                            url, 
                            stream=True,
                            timeout=(10, DOWNLOAD_TIMEOUT)  # (connect timeout, read timeout)
                        )
                        
                        if response.status_code != 200:
                            logger.warning(f"Failed to download from peer {peer['ip']}:{peer['port']}")
                            continue
                        
                        # Get total size from headers
                        total_size = int(response.headers.get('content-length', 0))
                        downloaded = 0
                        
                        # Save file with progress tracking
                        with open(file_path, 'wb') as f:
                            for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
                                if chunk:
                                    f.write(chunk)
                                    downloaded += len(chunk)
                                    progress = (downloaded / total_size) * 100 if total_size > 0 else 0
                                    logger.debug(f"Download progress: {progress:.1f}%")
                        
                        # Verify file integrity if hash is provided
                        if 'hash' in peer:
                            file_hash = calculate_file_hash(file_path)
                            if file_hash != peer['hash']:
                                raise ValueError("File integrity check failed")
                        
                        logger.info(f"File '{filename}' downloaded successfully from {peer['ip']}")
                        return {
                            "success": True,
                            "file_info": {
                                "name": filename,
                                "size": downloaded,
                                "source_peer": peer['ip'],
                                "downloaded_at": datetime.now().isoformat()
                            }
                        }
                        
                    except requests.exceptions.RequestException as e:
                        logger.warning(f"Download attempt {attempt + 1} failed: {str(e)}")
                        if attempt == DOWNLOAD_RETRIES - 1:
                            continue
                        time.sleep(1)  # Wait before retry
                    except Exception as e:
                        logger.error(f"Unexpected error during download: {str(e)}")
                        raise
            
            return {"success": False, "error": "All download attempts failed"}
            
        finally:
            remove_lock_file(file_path)
            if not file_path.exists():
                logger.warning(f"Download failed, removing partial file: {filename}")
                file_path.unlink()
            
    except Exception as e:
        logger.error(f"Error downloading file: {str(e)}\n{traceback.format_exc()}")
        if file_path.exists():
            file_path.unlink()
        return {"success": False, "error": str(e)}

def list_shared_files(
    page: int = 1, 
    page_size: int = 50,
    sort_by: str = "modified",
    sort_desc: bool = True,
    filter_pattern: Optional[str] = None
) -> Dict[str, any]:
    """
    List files in the shared directory with pagination and filtering
    """
    try:
        logger.info("Listing shared files")
        
        if not FILE_STORAGE_DIR.exists():
            logger.info("Shared directory does not exist")
            return {"success": True, "files": [], "total": 0, "page": page, "page_size": page_size}
        
        all_files = []
        for f in FILE_STORAGE_DIR.iterdir():
            if f.is_file() and not f.name.endswith(LOCK_FILE_EXTENSION):
                if filter_pattern and filter_pattern not in f.name:
                    continue
                    
                try:
                    file_info = {
                        "name": f.name,
                        "size": f.stat().st_size,
                        "modified": datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
                        "hash": calculate_file_hash(f),
                    }
                    all_files.append(file_info)
                except Exception as e:
                    logger.error(f"Error getting file info for {f.name}: {str(e)}")
                    continue
        
        # Sort files
        all_files.sort(
            key=lambda x: x[sort_by],
            reverse=sort_desc
        )
        
        # Apply pagination
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_files = all_files[start_idx:end_idx]
        
        logger.info(f"Found {len(all_files)} shared files")
        return {
            "success": True,
            "files": paginated_files,
            "total": len(all_files),
            "page": page,
            "page_size": page_size
        }
    except Exception as e:
        logger.error(f"Error listing files: {str(e)}\n{traceback.format_exc()}")
        return {"success": False, "error": str(e)}

def remove_shared_file(filename: str) -> Dict[str, any]:
    """
    Remove a file from the shared directory
    """
    try:
        logger.info(f"Attempting to remove file: {filename}")
        
        if not filename:
            logger.error("Invalid filename provided")
            return {"success": False, "error": "Invalid filename"}
            
        file_path = FILE_STORAGE_DIR / filename
        
        if not file_path.exists():
            logger.warning(f"File not found: {filename}")
            return {"success": False, "error": "File not found"}
        
        if is_file_locked(file_path):
            logger.warning(f"File is currently in use: {filename}")
            return {"success": False, "error": "File is currently in use"}
        
        try:
            # Get file info before deletion
            file_info = {
                "name": filename,
                "size": file_path.stat().st_size,
                "modified": datetime.fromtimestamp(file_path.stat().st_mtime).isoformat()
            }
            
            file_path.unlink()
            logger.info(f"File '{filename}' removed successfully")
            return {"success": True, "file_info": file_info}
            
        except PermissionError:
            logger.error(f"Permission denied while removing file: {filename}")
            return {"success": False, "error": "Permission denied"}
        except OSError as e:
            logger.error(f"OS error while removing file: {str(e)}")
            return {"success": False, "error": str(e)}
            
    except Exception as e:
        logger.error(f"Error removing file: {str(e)}\n{traceback.format_exc()}")
        return {"success": False, "error": str(e)}
