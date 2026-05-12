import { getSession, type UserRole } from "@/lib/auth"
import { PageRoutes } from "@/constants/page-routes"

export function dashboardRouteForRole(role: UserRole) {
  if (role === "admin") return PageRoutes.ADMIN_DASHBOARD
  if (role === "landlord") return PageRoutes.LANDLORD_DASHBOARD
  return PageRoutes.TENANT_DASHBOARD
}

export function requireAuth(options?: { role?: UserRole }) {
  // This function MUST only be called on the client side (inside useEffect)
  // Server-side calls will return not authorized
  if (typeof window === "undefined") {
    return { ok: false as const, redirectTo: "/auth/login" }
  }
  
  const session = getSession()
  if (!session || !session.token) {
    return { ok: false as const, redirectTo: "/auth/login" }
  }
  
  if (options?.role && session.user.role !== options.role) {
    return { ok: false as const, redirectTo: dashboardRouteForRole(session.user.role) }
  }
  
  return { ok: true as const, session }
}

