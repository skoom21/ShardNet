# ShardNet

<div align="center">
  
<img src="shard-net/public/images/shardnet-logo.png" alt="ShardNet Logo" width="150">
  
  **A Decentralized P2P File-Sharing Platform**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Next.js](https://img.shields.io/badge/frontend-Next.js-black)](https://nextjs.org/)
  [![Python](https://img.shields.io/badge/backend-Python-yellow)](https://www.python.org/)
  [![FastAPI](https://img.shields.io/badge/API-FastAPI-teal)](https://fastapi.tiangolo.com/)
  
</div>

## 📋 Overview

ShardNet is a modern decentralized file-sharing platform that utilizes peer-to-peer (P2P) networking with file chunking technology. This approach allows for efficient and scalable file distribution without relying on centralized servers.

Unlike traditional cloud storage, ShardNet distributes files across multiple peers, creating a resilient network where files remain accessible even if some peers disconnect. The platform offers a user-friendly web interface while the underlying P2P operations are handled by a local client running on each user's machine.

### 🌟 Key Components:

- **Web Frontend**: Built with Next.js, providing an intuitive user interface
- **Local Client**: Developed in Python with FastAPI, managing all P2P operations
- **P2P Network**: Handles file chunking, distribution, and peer communication

---

## ✨ Features

### Core Functionality

- **📤 Decentralized Uploads**: Files are automatically chunked and distributed across the peer network
- **📥 P2P Downloads**: Retrieve files from multiple peers simultaneously
- **🔍 Advanced Search**: Find files across the network using filenames or metadata
- **📊 Real-time Progress**: Track upload and download progress in the web interface

### Network Management

- **👥 Automatic Peer Registration**: Client registers with the network tracker on launch
- **📡 Peer Discovery**: Find and connect to other users sharing desired files
- **🔄 Chunk Management**: Smart handling of file fragments across the network

### User Experience

- **🖥️ Clean Interface**: Modern web UI for file management
- **📱 Responsive Design**: Works across desktop and mobile devices
- **📂 File Organization**: Easily track and manage your shared files

---

## 🛠️ Tech Stack

### Frontend
- **Next.js**: React framework for the web interface
- **Tailwind CSS**: Utility-first CSS framework for styling

### Backend (Client)
- **Python**: Core programming language
- **FastAPI**: High-performance API framework
- **P2P Protocol**: Custom implementation of peer-to-peer networking
- **File Chunking System**: Proprietary algorithm for efficient file distribution

### Storage & Data
- **SQLite**: Lightweight database for file metadata (for future scalability)

---

## 📋 Getting Started

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- Git

### Frontend Setup

1. **Clone the repository**

```bash
git clone https://github.com/your-username/shardnet.git
cd shardnet
```

2. **Install frontend dependencies**

```bash
cd frontend
npm install
```

3. **Run the development server**

```bash
npm run dev
```

Your frontend will be available at `http://localhost:3000`

### Client Setup

1. **Set up Python environment**

```bash
# Create virtual environment
python -m venv venv

# Activate environment (Windows)
.\venv\Scripts\activate

# Activate environment (macOS/Linux)
source venv/bin/activate
```

2. **Install client dependencies**

```bash
cd client
pip install -r requirements.txt
```

3. **Run the local client**

```bash
python peer/main.py
```

The client will start, register with the tracker, and expose a local API for the frontend to communicate with.

---

## 🎮 Usage Guide

### Getting Started

1. **Launch Both Components**:
   - Start the local client (Python application)
   - Open the web interface (Next.js application)

2. **Initial Configuration**:
   - The client automatically registers with the network
   - The web interface connects to your local client

### File Operations

#### Uploading Files

1. Navigate to the "Upload" section in the web interface
2. Select a file from your local system
3. Click "Upload to Network"
4. Monitor the chunking and distribution progress

#### Finding Files

1. Use the search bar in the web interface
2. Enter keywords related to the file you're looking for
3. Review the search results showing available files

#### Downloading Files

1. Click on a file in the search results
2. Select "Download"
3. Monitor the download progress as chunks are retrieved from peers
4. Access your downloaded file when complete

### Managing Your Files

- View your uploaded and downloaded files
- See which of your files are being shared with peers
- Monitor network statistics and connectivity

---

## 📚 API Documentation

The local client exposes several endpoints through FastAPI:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/register` | POST | Registers the peer with the network tracker |
| `/upload` | POST | Uploads a file to the P2P network |
| `/download` | GET | Initiates file download from the network |
| `/search` | GET | Searches for files across connected peers |
| `/status` | GET | Returns client operation status and statistics |

For detailed API documentation, run the client and visit `http://localhost:8000/docs`

---

## 🔍 Technical Details

### File Chunking Process

Files are broken down into manageable chunks before distribution:

1. File is divided into equal-sized chunks (typically 1-4MB)
2. Each chunk receives a unique identifier
3. Chunk metadata is recorded for reassembly
4. Chunks are distributed to different peers

### Peer Discovery Mechanism

ShardNet uses a hybrid approach to find peers:

1. Centralized tracker for initial peer discovery
2. Distributed hash table (DHT) for resilience
3. Peer exchange (PEX) to discover new connections

### Security Considerations

- File integrity is verified using checksums
- Transport encryption protects data in transit
- Optional content verification (planned feature)

---

## 🤝 Contributing

We welcome contributions to ShardNet! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows our style guidelines and includes appropriate tests.

---

## 📄 License

ShardNet is released under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- Thanks to all contributors who have helped shape ShardNet
- Inspired by modern P2P protocols and distributed systems
- Built with open-source technologies that make decentralized networking possible

---

<div align="center">
  <b>ShardNet: Share Freely, Securely, Together</b>
</div>
