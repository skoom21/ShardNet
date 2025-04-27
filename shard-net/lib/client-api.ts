const API_BASE_URL = "http://127.0.0.1:3600"

export interface Peer {
  peer_id: string
  ip: string
  port: number
  status: string
}

export interface FileInfo {
  name: string
  size: number
  modified: string
  peer_id?: string
  filename?: string
}

export interface SearchResult {
  peers: {
    peer_id: string
    filename: string
  }[]
}

export interface ClientStats {
  peerCount: number
  totalFiles: number
  sharedFiles: number
  downloadedFiles: number
}

// Connect to the P2P network
export async function connectToNetwork(): Promise<string> {
  const systemIp = window.location.hostname
  const systemPort = window.location.port || 3500

  const response = await fetch(`${API_BASE_URL}/api/register_peer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ip: systemIp,
      port: Number(systemPort),
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to connect to network")
  }

  const data = await response.json()
  return data.peer_id
}

// Disconnect from the P2P network
export async function disconnectFromNetwork(peerId: string): Promise<void> {
  if (!peerId) return

  await fetch(`${API_BASE_URL}/api/update_status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      peer_id: peerId,
      status: "offline",
    }),
  })
}

// Get list of peers
export async function listPeers(): Promise<Peer[]> {
  const response = await fetch(`${API_BASE_URL}/api/list_peers`)

  if (!response.ok) {
    throw new Error("Failed to get peers")
  }

  const data = await response.json()
  return data.peers || []
}

// Get list of files
export async function listFiles(): Promise<FileInfo[]> {
  const response = await fetch(`${API_BASE_URL}/api/list_files`)

  if (!response.ok) {
    throw new Error("Failed to get files")
  }

  const data = await response.json()
  return data.files || []
}

// Upload a file
export async function uploadFile(file: File, onProgress?: (progress: number) => void): Promise<{ success: boolean; message: string }> {
  const formData = new FormData()
  formData.append("file", file)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${API_BASE_URL}/api/upload_file`)

    console.log("Preparing to upload file:", file.name)

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100
        console.log(`Upload progress: ${progress.toFixed(2)}%`)
        onProgress(progress)
      } else {
        console.log("Unable to compute upload progress")
      }
    }

    xhr.onload = () => {
      console.log("Upload completed with status:", xhr.status)
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          console.log("Server response:", response)
          resolve(response)
        } catch (error) {
          console.error("Failed to parse server response:", error)
          reject(new Error("Invalid server response"))
        }
      } else {
        console.error(`Failed to upload file. Status: ${xhr.status}, Response: ${xhr.responseText}`)
        reject(new Error(`Failed to upload ${file.name}. Server responded with status ${xhr.status}`))
      }
    }

    xhr.onerror = () => {
      console.error("Network error occurred during file upload")
      reject(new Error(`Network error occurred while uploading ${file.name}`))
    }

    xhr.ontimeout = () => {
      console.error("File upload timed out")
      reject(new Error(`File upload timed out for ${file.name}`))
    }

    xhr.onabort = () => {
      console.warn("File upload was aborted")
      reject(new Error(`File upload aborted for ${file.name}`))
    }

    try {
      console.log("Sending file to server...")
      xhr.send(formData)
    } catch (error) {
      console.error("Error occurred while sending file:", error)
      reject(new Error(`Failed to send file ${file.name} due to an unexpected error`))
    }
  })
}

// Search for files
export async function searchFiles(filename: string): Promise<SearchResult> {
  const response = await fetch(`${API_BASE_URL}/api/search_file`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename,
    }),
  })

  if (!response.ok) {
    throw new Error("Search failed")
  }

  return response.json()
}

// Download a file
export async function downloadFile(filename: string, onProgress?: (progress: number) => void): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/download_file/${encodeURIComponent(filename)}`)

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status} ${response.statusText}`)
  }

  // Get the total size from Content-Length header
  const contentLength = response.headers.get("Content-Length")
  const totalSize = contentLength ? Number.parseInt(contentLength) : 0
  let downloadedSize = 0

  // Create a reader for the response body
  const reader = response.body!.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    chunks.push(value)
    downloadedSize += value.length

    // Update progress if we know the total size
    if (totalSize > 0 && onProgress) {
      const progress = (downloadedSize / totalSize) * 100
      onProgress(progress)
    }
  }

  // Combine chunks into a single blob
  return new Blob(chunks)
}

// Remove a file
export async function removeFile(peerId: string, filename: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/remove_file`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      peer_id: peerId,
      filename,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to remove file")
  }
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
