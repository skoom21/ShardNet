from flask import Flask, request, send_from_directory
import os

app = Flask(__name__)
SHARED_FOLDER = "./shared_files"

@app.route("/files/<filename>", methods=["GET"])
def get_file(filename):
    return send_from_directory(SHARED_FOLDER, filename)

if __name__ == "__main__":
    os.makedirs(SHARED_FOLDER, exist_ok=True)
    app.run(host="0.0.0.0", port=5001)
