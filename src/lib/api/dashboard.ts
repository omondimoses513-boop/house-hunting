import { apiRequest } from "@/lib/api/client"

export type BackendLandlordDashboard = {
  message?: string
  profile?: {
    full_name?: string
    email?: string
    phone_number?: string
  }
  stats?: {
    total_apartments?: number
    total_units?: number
    occupied_units?: number
    vacant_units?: number
    occupancy_rate?: number
    pending_bookings?: number
    wallet_balance?: string
  }
}

export type BackendTenantDashboard = {
  message?: string
  user?: {
    id?: string
    email?: string
    full_name?: string
    phone_number?: string
    role?: string
    verification_status?: string
  }
  stats?: {
    active_bookings?: number
    pending_bookings?: number
    past_bookings?: number
    wallet_balance?: string
  }
}

export function backendLandlordDashboard() {
  return apiRequest<BackendLandlordDashboard>({
    path: "/api/landlord/dashboard",
    method: "GET",
  })
}

export function backendTenantDashboard() {
  return apiRequest<BackendTenantDashboard>({
    path: "/api/tenant/dashboard",
    method: "GET",
  })
}

