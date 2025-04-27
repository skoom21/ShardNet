"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertCircle,
  Download,
  Pause,
  Play,
  X,
  CheckCircle2,
  FileText,
  FileImage,
  FileAudio,
  FileVideo,
  File,
} from "lucide-react"
import { ClientStatus } from "@/components/client-status"

interface DownloadItem {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: "downloading" | "paused" | "completed" | "error"
  speed?: number
  timeRemaining?: number
  error?: string
}

export default function DownloadsPage() {
  const [clientConnected, setClientConnected] = useState(false)
  const [downloads, setDownloads] = useState<DownloadItem[]>([])

  useEffect(() => {
    if (clientConnected) {
      // Simulate fetching downloads
      const mockDownloads: DownloadItem[] = [
        {
          id: "dl1",
          name: "project-report.pdf",
          size: 15000000,
          type: "pdf",
          progress: 75,
          status: "downloading",
          speed: 1500000,
          timeRemaining: 10,
        },
        {
          id: "dl2",
          name: "vacation-photos.zip",
          size: 250000000,
          type: "zip",
          progress: 45,
          status: "downloading",
          speed: 2200000,
          timeRemaining: 120,
        },
        {
          id: "dl3",
          name: "presentation.pptx",
          size: 8500000,
          type: "pptx",
          progress: 100,
          status: "completed",
        },
        {
          id: "dl4",
          name: "sample-video.mp4",
          size: 350000000,
          type: "mp4",
          progress: 30,
          status: "paused",
        },
      ]

      setDownloads(mockDownloads)

      // Simulate download progress
      const interval = setInterval(() => {
        setDownloads((prev) =>
          prev.map((download) => {
            if (download.status === "downloading" && download.progress < 100) {
              const newProgress = Math.min(download.progress + 5, 100)
              const newStatus = newProgress === 100 ? ("completed" as const) : download.status

              return {
                ...download,
                progress: newProgress,
                status: newStatus,
                timeRemaining: download.timeRemaining ? Math.max(0, download.timeRemaining - 2) : 0,
              }
            }
            return download
          }),
        )
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [clientConnected])

  const handleConnectClient = async () => {
    try {
      // In a real app, this would call your client API to register the peer
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setClientConnected(true)
    } catch (err) {
      console.error("Failed to connect to client:", err)
    }
  }

  const handlePauseResume = (id: string) => {
    setDownloads((prev) =>
      prev.map((download) => {
        if (download.id === id) {
          return {
            ...download,
            status: download.status === "downloading" ? "paused" : "downloading",
          }
        }
        return download
      }),
    )
  }

  const handleCancel = (id: string) => {
    setDownloads((prev) => prev.filter((download) => download.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatSpeed = (bytesPerSecond: number) => {
    return `${formatFileSize(bytesPerSecond)}/s`
  }

  const formatTimeRemaining = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  const getFileIcon = (type: string) => {
    const imageTypes = ["jpg", "jpeg", "png", "gif", "webp"]
    const audioTypes = ["mp3", "wav", "ogg", "flac"]
    const videoTypes = ["mp4", "webm", "avi", "mov"]
    const documentTypes = ["pdf", "doc", "docx", "txt", "csv", "ppt", "pptx"]

    if (imageTypes.includes(type)) return <FileImage className="h-5 w-5" />
    if (audioTypes.includes(type)) return <FileAudio className="h-5 w-5" />
    if (videoTypes.includes(type)) return <FileVideo className="h-5 w-5" />
    if (documentTypes.includes(type)) return <FileText className="h-5 w-5" />

    return <File className="h-5 w-5" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Downloads</h1>
          <p className="text-muted-foreground">Manage your file downloads</p>
        </div>

        <ClientStatus connected={clientConnected} onConnect={handleConnectClient} />
      </div>

      {!clientConnected && (
        <Alert
          variant="warning"
          className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Client not connected</AlertTitle>
          <AlertDescription>Connect to the ShardNet network to view your downloads.</AlertDescription>
        </Alert>
      )}

      {clientConnected && downloads.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Download className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No downloads</h3>
            <p className="text-gray-500 mb-4">You haven't downloaded any files yet</p>
            <Button onClick={() => (window.location.href = "/app/search")}>Search for Files</Button>
          </CardContent>
        </Card>
      )}

      {clientConnected && downloads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Downloads</CardTitle>
            <CardDescription>Files you are currently downloading from the network</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {downloads.map((download) => (
              <div key={download.id} className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(download.type)}
                    <div>
                      <p className="font-medium">{download.name}</p>
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span>{formatFileSize(download.size)}</span>
                        {download.status === "downloading" && download.speed && (
                          <>
                            <span>•</span>
                            <span>{formatSpeed(download.speed)}</span>
                          </>
                        )}
                        {download.status === "downloading" && download.timeRemaining && (
                          <>
                            <span>•</span>
                            <span>{formatTimeRemaining(download.timeRemaining)} remaining</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {download.status === "downloading" && (
                      <Button variant="ghost" size="icon" onClick={() => handlePauseResume(download.id)}>
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}

                    {download.status === "paused" && (
                      <Button variant="ghost" size="icon" onClick={() => handlePauseResume(download.id)}>
                        <Play className="h-4 w-4" />
                      </Button>
                    )}

                    {download.status !== "completed" && (
                      <Button variant="ghost" size="icon" onClick={() => handleCancel(download.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}

                    {download.status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-500" />}

                    {download.status === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
                  </div>
                </div>

                <Progress
                  value={download.progress}
                  className={`h-2 ${download.status === "error" ? "bg-red-100 dark:bg-red-900/20" : ""}`}
                />

                {download.status === "error" && download.error && (
                  <p className="text-xs text-red-500 mt-1">{download.error}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
