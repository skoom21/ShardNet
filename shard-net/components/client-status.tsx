"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wifi, WifiOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ClientStatusProps {
  connected: boolean
  onConnect: () => Promise<void>
}

export function ClientStatus({ connected, onConnect }: ClientStatusProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await onConnect()
    } catch (error) {
      console.error("Failed to connect to client:", error)
      toast({
        title: "Connection Error",
        description: "Failed to connect to the P2P network. Is the client running?",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {connected ? (
        <>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900"
          >
            <Wifi className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        </>
      ) : (
        <>
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900"
          >
            <WifiOff className="h-3 w-3 mr-1" />
            Disconnected
          </Badge>
          <Button size="sm" onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </>
      )}
    </div>
  )
}
