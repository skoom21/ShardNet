# client/main.py
import uvicorn
from peer.api import peer_routes, file_routes
from fastapi import FastAPI

# Initialize the FastAPI app
app = FastAPI()

# Include the peer and file-related routes
app.include_router(peer_routes.router)
app.include_router(file_routes.router)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000)
