"use client"

import { useEffect, useState } from "react"
import { getSession, AUTH_CHANGED_EVENT, type AuthSession } from "@/lib/auth"

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check auth on mount with a small delay to ensure localStorage is synced
    const checkAuth = () => {
      try {
        const currentSession = getSession()
        setSession(currentSession)
      } finally {
        setIsChecking(false)
        setIsLoading(false)
      }
    }

    // Listen for storage changes (other tabs)
    const handleStorageChange = () => {
      checkAuth()
    }

    // Listen for custom auth event
    const handleAuthChanged = () => {
      checkAuth()
    }

    // Initial check - ensure DOM is ready and localStorage is accessible
    if (typeof window !== "undefined") {
      // Small delay to ensure localStorage is synced from previous navigation
      const timer = setTimeout(() => {
        checkAuth()
      }, 10)

      window.addEventListener("storage", handleStorageChange)
      window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged)

      return () => {
        clearTimeout(timer)
        window.removeEventListener("storage", handleStorageChange)
        window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged)
      }
    } else {
      // Server-side, just mark as done
      setIsLoading(false)
      setIsChecking(false)
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
