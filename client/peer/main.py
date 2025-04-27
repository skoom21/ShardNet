# client/peer/main.py
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from peer.api import peer_routes, file_routes

# Initialize the FastAPI app
app = FastAPI(title="ShardNet Peer Client")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include the peer and file-related routes
app.include_router(peer_routes.router, prefix="/api")
app.include_router(file_routes.router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=9000)
