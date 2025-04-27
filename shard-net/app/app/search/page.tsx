"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Search, Download, AlertCircle, Loader2, FileText, FileImage, FileAudio, FileVideo, File } from "lucide-react"
import { ClientStatus } from "@/components/client-status"
import { useClient } from "@/contexts/client-context"

export default function SearchPage() {
  const { isConnected, connect, searchFiles, downloadFile } = useClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<{ peer_id: string; filename: string }[]>([])
  const [downloading, setDownloading] = useState<string[]>([])

  const handleSearch = async () => {
    if (!isConnected || !searchQuery.trim()) return

    setIsSearching(true)
    setSearchResults([])

    try {
      const result = await searchFiles(searchQuery)
      console.log("Search result:", result)
      // Ensure the result is properly formatted
      const formattedResults = Array.isArray(result.peers) && result.peers.length > 0
        ? result.peers.map((peer: { peer_id: string; ip?: string; port?: number; last_seen?: string }) => ({
            peer_id: peer.peer_id,
            filename: searchQuery, // Use searchQuery as filename since it's not in the response
          }))
        : []
      console.log("Search results:", formattedResults)
      setSearchResults(formattedResults)
    } catch (err) {
      console.error("Search error:", err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleDownload = async (filename: string) => {
    if (!isConnected) return

    setDownloading((prev) => [...prev, filename])

    try {
      await downloadFile(filename)
    } catch (err) {
      console.error("Download error:", err)
    } finally {
      setDownloading((prev: string[]) => prev.filter((name: string) => name !== filename))
    }
  }

  const getFileIcon = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase() || ""

    const imageTypes = ["jpg", "jpeg", "png", "gif", "webp"]
    const audioTypes = ["mp3", "wav", "ogg", "flac"]
    const videoTypes = ["mp4", "webm", "avi", "mov"]
    const documentTypes = ["pdf", "doc", "docx", "txt", "csv", "ppt", "pptx"]

    if (imageTypes.includes(extension)) return <FileImage className="h-5 w-5" />
    if (audioTypes.includes(extension)) return <FileAudio className="h-5 w-5" />
    if (videoTypes.includes(extension)) return <FileVideo className="h-5 w-5" />
    if (documentTypes.includes(extension)) return <FileText className="h-5 w-5" />

    return <File className="h-5 w-5" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Search Files</h1>
          <p className="text-muted-foreground">Find files shared in the ShardNet network</p>
        </div>

        <ClientStatus connected={isConnected} onConnect={connect} />
      </div>

      {!isConnected && (
        <Alert
          variant="warning"
          variant="destructive"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Client not connected</AlertTitle>
          <AlertDescription>Connect to the ShardNet network to search for files.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Search Files</CardTitle>
          <CardDescription>Enter keywords or file names to search the network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search for files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={!isConnected || isSearching}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={!isConnected || isSearching || !searchQuery.trim()}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">{isSearching ? "Searching..." : "Search"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {isSearching && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isSearching && searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              Found {searchResults.length} files matching &quot;{searchQuery}&quot;
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.filename)}
                    <div>
                      <p className="font-medium">{file.filename}</p>
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span>Peer: {file.peer_id}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleDownload(file.filename)}
                    disabled={downloading.includes(file.filename) || !isConnected}
                  >
                    {downloading.includes(file.filename) ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-3 w-3" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isSearching && searchQuery && searchResults.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No results found</h3>
          <p className="text-gray-500">Try different keywords or check your connection</p>
        </div>
      )}
    </div>
  )
}
