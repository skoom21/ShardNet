"use client"

import { useState, useEffect } from "react"

type ToastType = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastType[]>([])

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    toasts.forEach((toast) => {
      if (toast.duration) {
        const timer = setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id))
        }, toast.duration)
        timers.push(timer)
      }
    })

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [toasts])

  const toast = ({ title, description, variant = "default", duration = 5000 }: Omit<ToastType, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, title, description, variant, duration }])
    return id
  }

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return {
    toast,
    dismiss,
    toasts,
  }
}
