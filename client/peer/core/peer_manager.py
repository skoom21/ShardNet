# client/core/peer_manager.py
class Peer:
    def __init__(self, peer_id, ip, port, files=None):
        self.peer_id = peer_id
        self.ip = ip
        self.port = port
        self.files = files if files else []

    def add_file(self, filename):
        self.files.append(filename)
