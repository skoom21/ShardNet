"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Upload, Download, Search, Users, HardDrive, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { ClientStatus } from "@/components/client-status"
import { WalkthroughModal } from "@/components/walkthrough-modal"
import { useClient } from "@/contexts/client-context"

export default function DashboardPage() {
  const router = useRouter()
  const [isNewUser, setIsNewUser] = useState(false)
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const { isConnected, connect, stats } = useClient()

  useEffect(() => {
    // Check if user is new
    const user = localStorage.getItem("shardnet-user")
    if (user) {
      const userData = JSON.parse(user)
      if (userData.isNewUser) {
        setIsNewUser(true)
        setShowWalkthrough(true)
        // Remove the new user flag
        localStorage.setItem(
          "shardnet-user",
          JSON.stringify({
            ...userData,
            isNewUser: false,
          }),
        )
      }
    }
  }, [])

  return (
    <>
      {isNewUser && showWalkthrough && (
        <WalkthroughModal isOpen={showWalkthrough} onClose={() => setShowWalkthrough(false)} />
      )}

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to ShardNet, your decentralized file sharing portal</p>
          </div>

          <ClientStatus connected={isConnected} onConnect={connect} />
        </div>

        {!isConnected && (
          <Alert
            variant="warning"
            className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Client not connected</AlertTitle>
            <AlertDescription>Connect to the ShardNet network to start sharing and downloading files.</AlertDescription>
          </Alert>
        )}

        {isConnected && (
          <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Connected to ShardNet</AlertTitle>
            <AlertDescription>You are now connected to the ShardNet P2P network.</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected Peers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isConnected ? stats.peerCount : 0}</div>
                <p className="text-xs text-muted-foreground">Active users in the network</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Files</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isConnected ? stats.totalFiles : 0}</div>
                <p className="text-xs text-muted-foreground">Files available in the network</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Shared Files</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isConnected ? stats.sharedFiles : 0}</div>
                <p className="text-xs text-muted-foreground">Files you've shared with the network</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Downloaded Files</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isConnected ? stats.downloadedFiles : 0}</div>
                <p className="text-xs text-muted-foreground">Files you've downloaded</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="col-span-1"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks you can perform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full justify-start"
                  onClick={() => router.push("/app/upload")}
                  disabled={!isConnected}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>
                <Button
                  className="w-full justify-start"
                  onClick={() => router.push("/app/search")}
                  disabled={!isConnected}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search Files
                </Button>
                <Button
                  className="w-full justify-start"
                  onClick={() => router.push("/app/downloads")}
                  disabled={!isConnected}
                >
                  <Download className="mr-2 h-4 w-4" />
                  View Downloads
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="col-span-2"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Network Activity</CardTitle>
                <CardDescription>Recent activity in the ShardNet network</CardDescription>
              </CardHeader>
              <CardContent>
                {isConnected ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center">
                        <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                        <span>New file shared: project-report.pdf</span>
                      </div>
                      <span className="text-xs text-muted-foreground">2 mins ago</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center">
                        <div className="mr-2 h-2 w-2 rounded-full bg-blue-500"></div>
                        <span>5 new peers joined the network</span>
                      </div>
                      <span className="text-xs text-muted-foreground">15 mins ago</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center">
                        <div className="mr-2 h-2 w-2 rounded-full bg-yellow-500"></div>
                        <span>Popular download: vacation-photos.zip</span>
                      </div>
                      <span className="text-xs text-muted-foreground">1 hour ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-2 h-2 w-2 rounded-full bg-purple-500"></div>
                        <span>Network update: v1.2.3 available</span>
                      </div>
                      <span className="text-xs text-muted-foreground">3 hours ago</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                    <p>Connect to the network to see activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  )
}
