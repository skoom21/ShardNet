"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import * as clientApi from "@/lib/client-api"

interface ClientContextType {
  peerId: string | null
  isConnected: boolean
  isConnecting: boolean
  sharedFiles: Set<string>
  downloadedFiles: Set<string>
  stats: {
    peerCount: number
    totalFiles: number
    sharedFiles: number
    downloadedFiles: number
  }
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  uploadFile: (file: File, onProgress?: (progress: number) => void) => Promise<void>
  searchFiles: (query: string) => Promise<clientApi.SearchResult>
  downloadFile: (filename: string, onProgress?: (progress: number) => void) => Promise<void>
  removeFile: (filename: string) => Promise<void>
  refreshFiles: () => Promise<void>
  refreshStats: () => Promise<void>
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

export function ClientProvider({ children }: { children: ReactNode }) {
  const [peerId, setPeerId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [sharedFiles, setSharedFiles] = useState<Set<string>>(new Set())
  const [downloadedFiles, setDownloadedFiles] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState({
    peerCount: 0,
    totalFiles: 0,
    sharedFiles: 0,
    downloadedFiles: 0,
  })
  const { toast } = useToast()

  // Load state from localStorage on mount
  useEffect(() => {
    const storedPeerId = localStorage.getItem("shardnet-peer-id")
    const storedSharedFiles = localStorage.getItem("shardnet-shared-files")
    const storedDownloadedFiles = localStorage.getItem("shardnet-downloaded-files")

    if (storedPeerId) {
      setPeerId(storedPeerId)
      setIsConnected(true)
    }

    if (storedSharedFiles) {
      setSharedFiles(new Set(JSON.parse(storedSharedFiles)))
    }

    if (storedDownloadedFiles) {
      setDownloadedFiles(new Set(JSON.parse(storedDownloadedFiles)))
    }
  }, [])

  // Update stats whenever shared/downloaded files change
  useEffect(() => {
    if (isConnected) {
      refreshStats()
    }
  }, [isConnected, sharedFiles, downloadedFiles])

  // Start polling when connected
  useEffect(() => {
    let filePolling: NodeJS.Timeout
    let statsPolling: NodeJS.Timeout

    if (isConnected) {
      refreshFiles()
      refreshStats()

      filePolling = setInterval(refreshFiles, 5000)
      statsPolling = setInterval(refreshStats, 5000)
    }

    return () => {
      clearInterval(filePolling)
      clearInterval(statsPolling)
    }
  }, [isConnected])

  const connect = async () => {
    if (isConnected) return

    setIsConnecting(true)
    try {
      const newPeerId = await clientApi.connectToNetwork()
      setPeerId(newPeerId)
      setIsConnected(true)
      localStorage.setItem("shardnet-peer-id", newPeerId)

      toast({
        title: "Connected",
        description: "Successfully connected to the ShardNet P2P network",
      })
    } catch (error) {
      console.error("Connection error:", error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect to the P2P network. Is the client running?",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    if (!isConnected || !peerId) return

    try {
      await clientApi.disconnectFromNetwork(peerId)
      setPeerId(null)
      setIsConnected(false)
      localStorage.removeItem("shardnet-peer-id")

      toast({
        title: "Disconnected",
        description: "Successfully disconnected from the ShardNet P2P network",
      })
    } catch (error) {
      console.error("Disconnection error:", error)
      toast({
        title: "Disconnection Failed",
        description: "There was an error disconnecting from the network",
        variant: "destructive",
      })
    }
  }

  const uploadFile = async (file: File, onProgress?: (progress: number) => void) => {
    if (!isConnected || !peerId) {
      console.warn("Upload attempt failed: Not connected to the network.");
      toast({
        title: "Not Connected",
        description: "You must be connected to the network to upload files",
        variant: "destructive",
      })
      return
    }

    console.log(`Starting upload for file: ${file.name}`);
    try {
      const uploadResult = await clientApi.uploadFile(file, onProgress)
      if (!uploadResult) {
        console.error("Upload failed: Unexpected issue during upload.");
        throw new Error("Upload failed due to an unexpected issue.")
      }

      console.log(`File uploaded successfully: ${file.name}`);
      // Add to shared files
      setSharedFiles((prev) => {
        const newSet = new Set(prev)
        newSet.add(file.name)
        localStorage.setItem("shardnet-shared-files", JSON.stringify([...newSet]))
        console.log(`File added to shared files: ${file.name}`);
        return newSet
      })

      toast({
        title: "Upload Successful",
        description: `${file.name} has been shared to the network`,
      })
    } catch (error) {
      console.error(`Upload error for file ${file.name}:`, error);
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${file.name}`,
        variant: "destructive",
      })
    } finally {
      console.log(`Upload process completed for file: ${file.name}`);
    }
  }

  const searchFiles = async (query: string) => {
    if (!isConnected || !peerId) {
      toast({
        title: "Not Connected",
        description: "You must be connected to the network to search files",
        variant: "destructive",
      })
      throw new Error("Not connected to network")
    }

    try {
      return await clientApi.searchFiles(query)
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search Failed",
        description: "Failed to search for files",
        variant: "destructive",
      })
      throw error
    }
  }

  const downloadFile = async (filename: string, onProgress?: (progress: number) => void) => {
    if (!isConnected || !peerId) {
      toast({
        title: "Not Connected",
        description: "You must be connected to the network to download files",
        variant: "destructive",
      })
      return
    }

    try {
      const blob = await clientApi.downloadFile(filename, onProgress)

      // Create and trigger download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Add to downloaded files
      setDownloadedFiles((prev) => {
        const newSet = new Set(prev)
        newSet.add(filename)
        localStorage.setItem("shardnet-downloaded-files", JSON.stringify([...newSet]))
        return newSet
      })

      toast({
        title: "Download Successful",
        description: `${filename} has been downloaded successfully`,
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download Failed",
        description: `Failed to download ${filename}`,
        variant: "destructive",
      })
    }
  }

  const removeFile = async (filename: string) => {
    if (!isConnected || !peerId) {
      toast({
        title: "Not Connected",
        description: "You must be connected to the network to remove files",
        variant: "destructive",
      })
      return
    }

    try {
      await clientApi.removeFile(peerId, filename)

      // Remove from shared files
      setSharedFiles((prev) => {
        const newSet = new Set(prev)
        newSet.delete(filename)
        localStorage.setItem("shardnet-shared-files", JSON.stringify([...newSet]))
        return newSet
      })

      toast({
        title: "File Removed",
        description: `${filename} has been removed from the network`,
      })
    } catch (error) {
      console.error("Remove error:", error)
      toast({
        title: "Remove Failed",
        description: `Failed to remove ${filename}`,
        variant: "destructive",
      })
    }
  }

  const refreshFiles = async () => {
    if (!isConnected) return

    try {
      await clientApi.listFiles()
      // We don't need to update state here as we're just refreshing the server's knowledge
    } catch (error) {
      console.error("Error refreshing files:", error)
    }
  }

  const refreshStats = async () => {
    if (!isConnected) return

    try {
      const peers = await clientApi.listPeers()
      const files = await clientApi.listFiles()

      setStats({
        peerCount: peers.length,
        totalFiles: files.length,
        sharedFiles: sharedFiles.size,
        downloadedFiles: downloadedFiles.size,
      })
    } catch (error) {
      console.error("Error refreshing stats:", error)
    }
  }

  return (
    <ClientContext.Provider
      value={{
        peerId,
        isConnected,
        isConnecting,
        sharedFiles,
        downloadedFiles,
        stats,
        connect,
        disconnect,
        uploadFile,
        searchFiles,
        downloadFile,
        removeFile,
        refreshFiles,
        refreshStats,
      }}
    >
      {children}
    </ClientContext.Provider>
  )
}

export function useClient() {
  const context = useContext(ClientContext)
  if (context === undefined) {
    throw new Error("useClient must be used within a ClientProvider")
  }
  return context
}
