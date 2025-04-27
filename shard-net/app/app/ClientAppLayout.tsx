"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { ClientProvider } from "@/contexts/client-context"

export default function ClientAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("shardnet-user")

    if (!user) {
      router.push("/auth")
      return
    }

    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <ClientProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-neutral-900">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </ClientProvider>
  )
}
