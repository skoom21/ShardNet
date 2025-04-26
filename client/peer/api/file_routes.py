# client/api/file_routes.py
from fastapi import APIRouter, HTTPException
from peer.models.file_models import FileUploadRequest
from peer.core.file_manager import upload_file, download_file
from shared.config import id_peer

router = APIRouter()

@router.post("/upload_file")
async def upload_file_api(file: FileUploadRequest):
    try:
        upload_file(file.filename, file.file_data, id_peer)
        return {"message": f"File '{file.filename}' uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@router.get("/download_file/{filename}")
async def download_file_api(filename: str):
    try:
        file_data = download_file(filename)
        return {"file_data": file_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading file: {str(e)}")
