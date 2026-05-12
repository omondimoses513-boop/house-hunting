"use client"

import { ReactNode, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import { dashboardRouteForRole } from "@/lib/route-guards"
import type { UserRole } from "@/lib/auth"

interface ProtectedPageProps {
  children: ReactNode
  requiredRole?: UserRole
  fallback?: ReactNode
}

export function ProtectedPage({
  children,
  requiredRole,
  fallback,
}: ProtectedPageProps) {
  const router = useRouter()
  const { session, isLoading, isChecking } = useAuth()

  // Check authorization
  const isAuthorized = useMemo(() => {
    if (!session) return false
    if (!requiredRole) return true
    return session.user.role === requiredRole
  }, [session, requiredRole])

  // Handle redirects
  useEffect(() => {
    // Still loading or checking - don't redirect yet
    if (isLoading || isChecking) {
      return
    }

    if (!session) {
      // Delay to ensure localStorage is properly read before redirect
      const timer = setTimeout(() => {
        router.replace("/auth/login")
      }, 100)
      return () => clearTimeout(timer)
    }

    if (!isAuthorized) {
      const timer = setTimeout(() => {
        router.replace(dashboardRouteForRole(session.user.role))
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [session, isAuthorized, isLoading, isChecking, router])

  // Show fallback or loading state while checking
  if (isLoading || isChecking) {
    return fallback || <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // If not authorized, don't render children (redirect is in progress)
  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
