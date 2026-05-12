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
    console.log("[v0] ProtectedPage: Checking auth - session role:", session.user.role, "required:", requiredRole, "match:", session.user.role === requiredRole)
    return session.user.role === requiredRole
  }, [session, requiredRole])

  // Handle redirects
  useEffect(() => {
    // Still loading or checking - don't redirect yet
    if (isLoading || isChecking) {
      console.log("[v0] ProtectedPage: Still loading/checking, delaying redirect", { isLoading, isChecking })
      return
    }

    console.log("[v0] ProtectedPage: Done loading, checking auth", { hasSession: !!session, isAuthorized })

    if (!session) {
      // Delay to ensure localStorage is properly read before redirect
      const timer = setTimeout(() => {
        console.log("[v0] ProtectedPage: No session, redirecting to login")
        router.replace("/auth/login")
      }, 100)
      return () => clearTimeout(timer)
    }

    if (!isAuthorized) {
      const timer = setTimeout(() => {
        console.log("[v0] ProtectedPage: Unauthorized role, redirecting to dashboard")
        router.replace(dashboardRouteForRole(session.user.role))
      }, 100)
      return () => clearTimeout(timer)
    }
    
    console.log("[v0] ProtectedPage: Access granted for role:", session.user.role)
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
