"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Save, CheckCircle2 } from "lucide-react"
import { ClientStatus } from "@/components/client-status"

export default function SettingsPage() {
  const [clientConnected, setClientConnected] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [settings, setSettings] = useState({
    downloadPath: "C:/Users/username/Downloads/ShardNet",
    maxUploadSpeed: 1024,
    maxDownloadSpeed: 2048,
    maxConnections: 50,
    autoStart: true,
    darkMode: true,
    notifications: true,
    autoUpdate: true,
  })

  const handleConnectClient = async () => {
    try {
      // In a real app, this would call your client API to register the peer
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setClientConnected(true)
    } catch (err) {
      console.error("Failed to connect to client:", err)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)

    try {
      // Simulate saving settings
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err) {
      console.error("Failed to save settings:", err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your ShardNet client</p>
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
          <AlertDescription>Connect to the ShardNet network to modify settings.</AlertDescription>
        </Alert>
      )}

      {showSuccess && (
        <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Settings saved</AlertTitle>
          <AlertDescription>Your settings have been saved successfully.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure basic client settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="downloadPath">Download Path</Label>
              <Input
                id="downloadPath"
                value={settings.downloadPath}
                onChange={(e) => setSettings({ ...settings, downloadPath: e.target.value })}
                disabled={!clientConnected}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoStart">Auto-start with system</Label>
                <Switch
                  id="autoStart"
                  checked={settings.autoStart}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoStart: checked })}
                  disabled={!clientConnected}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Enable notifications</Label>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
                  disabled={!clientConnected}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoUpdate">Auto-update client</Label>
                <Switch
                  id="autoUpdate"
                  checked={settings.autoUpdate}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoUpdate: checked })}
                  disabled={!clientConnected}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Settings</CardTitle>
            <CardDescription>Configure bandwidth and connection settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxUploadSpeed">Max Upload Speed (KB/s): {settings.maxUploadSpeed}</Label>
              </div>
              <Slider
                id="maxUploadSpeed"
                min={128}
                max={10240}
                step={128}
                value={[settings.maxUploadSpeed]}
                onValueChange={(value) => setSettings({ ...settings, maxUploadSpeed: value[0] })}
                disabled={!clientConnected}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxDownloadSpeed">Max Download Speed (KB/s): {settings.maxDownloadSpeed}</Label>
              </div>
              <Slider
                id="maxDownloadSpeed"
                min={128}
                max={10240}
                step={128}
                value={[settings.maxDownloadSpeed]}
                onValueChange={(value) => setSettings({ ...settings, maxDownloadSpeed: value[0] })}
                disabled={!clientConnected}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxConnections">Max Connections: {settings.maxConnections}</Label>
              </div>
              <Slider
                id="maxConnections"
                min={10}
                max={200}
                step={5}
                value={[settings.maxConnections]}
                onValueChange={(value) => setSettings({ ...settings, maxConnections: value[0] })}
                disabled={!clientConnected}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={!clientConnected || isSaving}>
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
