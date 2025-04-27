"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Upload, Search, Download, Settings, LogOut, Menu, X, HelpCircle } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [username, setUsername] = useState("")

  useEffect(() => {
    const user = localStorage.getItem("shardnet-user")
    if (user) {
      const userData = JSON.parse(user)
      setUsername(userData.username || "User")
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("shardnet-user")
    router.push("/auth")
  }

  const navItems = [
    { name: "Dashboard", href: "/app/dashboard", icon: <Home className="mr-2 h-4 w-4" /> },
    { name: "Upload", href: "/app/upload", icon: <Upload className="mr-2 h-4 w-4" /> },
    { name: "Search", href: "/app/search", icon: <Search className="mr-2 h-4 w-4" /> },
    { name: "Downloads", href: "/app/downloads", icon: <Download className="mr-2 h-4 w-4" /> },
    { name: "Settings", href: "/app/settings", icon: <Settings className="mr-2 h-4 w-4" /> },
    { name: "Help", href: "/app/help", icon: <HelpCircle className="mr-2 h-4 w-4" /> },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Button variant="outline" size="icon" onClick={() => setIsMobileOpen(!isMobileOpen)} className="rounded-full">
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white dark:bg-neutral-950 shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center p-6 border-b border-gray-200 dark:border-neutral-800">
            <img src="/images/shardnet-logo.png" alt="ShardNet Logo" className="h-8 w-8 mr-2" />
            <span className="text-xl font-bold">ShardNet</span>
          </div>

          <div className="p-4 border-b border-gray-200 dark:border-neutral-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Logged in as</p>
            <p className="font-medium truncate">{username}</p>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                  pathname === item.href
                    ? "bg-gray-100 dark:bg-neutral-800 text-primary"
                    : "hover:bg-gray-100 dark:hover:bg-neutral-800"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
            <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}
    </>
  )
}
