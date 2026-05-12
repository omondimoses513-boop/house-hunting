"use client"

import { useEffect, useState } from "react"
import { getSession, AUTH_CHANGED_EVENT, type AuthSession } from "@/lib/auth"

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check auth immediately on mount
    const checkAuth = () => {
      try {
        console.log("[v0] useAuth: Checking session on mount")
        const currentSession = getSession()
        console.log("[v0] useAuth: Session result:", {
          hasSession: !!currentSession,
          role: currentSession?.user?.role,
        })
        setSession(currentSession)
      } finally {
        setIsChecking(false)
      }
    }

    // Initial check - ensure DOM is ready
    if (typeof window !== "undefined") {
      checkAuth()
    }
    setIsLoading(false)

    // Listen for storage changes (other tabs)
    const handleStorageChange = () => {
      checkAuth()
    }

    // Listen for custom auth event
    const handleAuthChanged = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged)
    }
  }, [])

  return {
    session,
    isLoading,
    isChecking,
    isAuthenticated: !!session,
    user: session?.user || null,
    token: session?.token || null,
  }
}
