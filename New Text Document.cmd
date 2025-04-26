@echo off
setlocal

echo ==== Setting up P2P File Sharing System ====

:: --- Setup Backend ---
echo ==== Setting up Backend ====
mkdir backend
cd backend

python -m venv venv
call venv\Scripts\activate

pip install fastapi uvicorn
pip freeze > requirements.txt

mkdir app
cd app

(
echo from fastapi import FastAPI
echo.
echo app = FastAPI()
echo.
echo @app.get("/")
echo def read_root():
echo     return {"message": "Coordinator API is running."}
) > main.py

cd ../..

:: --- Setup Client ---
echo ==== Setting up Client ====
mkdir client
cd client

python -m venv venv
call venv\Scripts\activate

pip install flask requests
pip freeze > requirements.txt

mkdir peer
cd peer

(
echo from flask import Flask, request, send_from_directory
echo import os
echo.
echo app = Flask(__name__)
echo SHARED_FOLDER = "./shared_files"
echo.
echo @app.route("/files/<filename>", methods=["GET"])
echo def get_file(filename):
echo     return send_from_directory(SHARED_FOLDER, filename)
echo.
echo if __name__ == "__main__":
echo     os.makedirs(SHARED_FOLDER, exist_ok=True)
echo     app.run(host="0.0.0.0", port=5001)
) > peer_node.py

cd ../..

:: --- Setup Frontend ---


echo ==== Setup Complete! ====

:: End
endlocal
pause
