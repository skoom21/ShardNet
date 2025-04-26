# client/models/file_models.py
from pydantic import BaseModel

class FileUploadRequest(BaseModel):
    filename: str
    file_data: bytes
