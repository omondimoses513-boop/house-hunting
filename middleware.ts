import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  const role = req.cookies.get("role")?.value
  const { pathname } = req.nextUrl

  // Define protected routes
  const isAdminPage = pathname.startsWith("/admin")
  const isTenantPage = pathname.startsWith("/tenant")
  const isLandlordPage = pathname.startsWith("/landlord")

  // 🚫 Block access if NOT logged in
  if (!token && (isAdminPage || isTenantPage || isLandlordPage)) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  // 🚫 Prevent logged-in users from seeing login page
  if (token && pathname === "/auth/login") {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }

    if (role === "LANDLORD") {
      return NextResponse.redirect(new URL("/landlord/dashboard", req.url))
    }

    // Default → TENANT
    return NextResponse.redirect(new URL("/tenant/dashboard", req.url))
  }

  return NextResponse.next()
}