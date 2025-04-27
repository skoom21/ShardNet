"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, File, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { ClientStatus } from "@/components/client-status"
import { useClient } from "@/contexts/client-context"
import { formatFileSize } from "@/lib/client-api"

interface FileUpload {
  id: string
  name: string
  size: number
  file: File // Add the missing file property
  progress: number
  status: "pending" | "uploading" | "completed" | "error"
  error?: string
}

export default function UploadPage() {
  const { isConnected, connect, uploadFile } = useClient()
  const [files, setFiles] = useState<FileUpload[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        file: file, // Ensure the file property is included
        progress: 0,
        status: "pending" as const,
      }))

      setFiles((prev) => [...prev, ...newFiles])

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)

    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files).map((file) => ({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        file: file, // Include the actual File object
        progress: 0,
        status: "pending" as const,
      }))

      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const handleUploadFiles = async () => {
    if (!isConnected || files.length === 0) {
      console.log("Upload aborted: Not connected or no files to upload.");
      return;
    }

    console.log("Starting upload process for files:", files);

    // Update all pending files to uploading
    const updatedFiles = files.map((file) => {
      if (file.status === "pending") {
        console.log(`File ${file.name} status updated to uploading.`);
        return { ...file, status: "uploading" };
      }
      return file;
    });
    setFiles(updatedFiles as FileUpload[]);

    // Process each file
    for (const file of updatedFiles.filter((f) => f.status === "uploading")) {
      console.log(`Processing file: ${file.name}`);
        console.log(`Uploading file: ${file.name}`);
        // Upload the file with progress tracking
        await uploadFile(file.file, (progress) => {
          console.log(`Progress for file ${file.name}: ${progress}%`);
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
          );
        });

        // Mark as completed
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "completed" } : f))
        );
        console.log(`File uploaded successfully: ${file.name}`);
      try {
        // Upload the file with progress tracking
        await uploadFile(file.file, (progress) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
          );
        });

        // Mark as completed
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "completed" } : f))
        );
      } catch (err) {
        // Mark as error
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, status: "error", error: "Failed to upload file" }
              : f
          )
        );
        console.error(`Error uploading file: ${file.name}`, err);
      }
    }

    console.log("Upload process completed.");
  }

  const pendingFiles = files.filter((f: FileUpload) => f.status === "pending").length;
  const uploadingFiles = files.filter((f: FileUpload) => f.status === "uploading").length;
  const completedFiles = files.filter((f: FileUpload) => f.status === "completed").length;
  const errorFiles = files.filter((f: FileUpload) => f.status === "error").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Files</h1>
          <p className="text-muted-foreground">Share files with the ShardNet network</p>
        </div>

        <ClientStatus connected={isConnected} onConnect={connect} />
      </div>

      {!isConnected && (
        <Alert
          variant="default"
          className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Client not connected</AlertTitle>
          <AlertDescription>Connect to the ShardNet network to upload files.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>Select files to share with the network</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-700"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              disabled={!isConnected}
            />

            <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Drag and drop files here</h3>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <Button onClick={() => fileInputRef.current?.click()} disabled={!isConnected}>
              Browse Files
            </Button>
          </div>

          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Selected Files</h3>
                <div className="flex gap-2">
                  {pendingFiles > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900"
                    >
                      {pendingFiles} pending
                    </Badge>
                  )}
                  {uploadingFiles > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900"
                    >
                      {uploadingFiles} uploading
                    </Badge>
                  )}
                  {completedFiles > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900"
                    >
                      {completedFiles} completed
                    </Badge>
                  )}
                  {errorFiles > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900"
                    >
                      {errorFiles} failed
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      <File className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {file.status === "uploading" && (
                        <div className="w-32">
                          <Progress value={file.progress} className="h-2" />
                        </div>
                      )}

                      {file.status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-500" />}

                      {file.status === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}

                      {file.status === "pending" && (
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(file.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setFiles([])}
                  disabled={uploadingFiles > 0 || files.length === 0}
                >
                  Clear All
                </Button>
                <Button onClick={handleUploadFiles} disabled={!isConnected || pendingFiles === 0 || uploadingFiles > 0}>
                  {uploadingFiles > 0 ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload {pendingFiles > 0 ? `(${pendingFiles})` : ""}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
