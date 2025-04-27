# client/api/file_routes.py
from fastapi import APIRouter, HTTPException, UploadFile, File
from pathlib import Path
from peer.core.file_manager import (
    upload_file,
    download_file,
    list_shared_files,
    FILE_STORAGE_DIR,
    is_file_locked
)
from peer.core.tracker_manager import advertise_files, search_file
from peer.database.memory import id_peer
import logging
import shutil
from fastapi.responses import StreamingResponse

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("FileManager")

router = APIRouter()

@router.post("/upload_file")
async def upload_file_api(file: UploadFile = File(...)):
    try:
        logger.info(f"Uploading file: {file.filename}")
        
        # Create shared directory if it doesn't exist
        FILE_STORAGE_DIR.mkdir(parents=True, exist_ok=True)
        
        # Save the file temporarily
        temp_path = FILE_STORAGE_DIR / f"temp_{file.filename}"
        try:
            with open(temp_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # Upload the file using file_manager
            result = upload_file(str(temp_path))
            if not result["success"]:
                raise HTTPException(status_code=500, detail=result["error"])
            
            # Register the file with the tracker
            if id_peer.get(0):  # Check if peer is registered
                success = advertise_files(id_peer[0], [file.filename])
                if not success:
                    logger.error("Failed to advertise file to tracker")
                    raise HTTPException(status_code=500, detail="Failed to advertise file to tracker")
            
            logger.info(f"File '{file.filename}' uploaded and advertised successfully")
            return {"message": f"File '{file.filename}' uploaded successfully"}
        finally:
            # Clean up temp file
            if temp_path.exists():
                temp_path.unlink()
                
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@router.get("/download_file/{filename}")
async def download_file_api(filename: str):
    try:
        logger.info(f"Downloading file: {filename}")
        
        file_path = FILE_STORAGE_DIR / filename
        logger.debug(f"Looking for file at path: {file_path}")
        
        if not file_path.exists():
            logger.warning(f"File not found: {filename}")
            raise HTTPException(status_code=404, detail="File not found")
            
        # Check if file is locked
        logger.debug(f"Checking if file is locked: {file_path}")
        if is_file_locked(file_path):
            logger.warning(f"File is currently in use: {filename}")
            raise HTTPException(status_code=423, detail="File is currently in use")
            
        # Get file size
        file_size = file_path.stat().st_size
        logger.debug(f"File size: {file_size} bytes")
            
        # Create a streaming response
        def file_stream():
            try:
                with open(file_path, "rb") as f:
                    while True:
                        chunk = f.read(8192)  # Read in 8KB chunks
                        if not chunk:
                            break
                        yield chunk
            except Exception as e:
                logger.error(f"Error during file streaming: {str(e)}")
                raise
                    
        return StreamingResponse(
            file_stream(),
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(file_size)
            }
        )
    except Exception as e:
        logger.error(f"Error downloading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error downloading file: {str(e)}")

@router.get("/list_files")
async def list_files_api():
    try:
        logger.info("Listing available files")
        result = list_shared_files()
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        logger.error(f"Error listing files: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")
