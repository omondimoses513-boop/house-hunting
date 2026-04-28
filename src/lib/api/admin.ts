import { apiRequest } from "@/lib/api/client"

export type BackendAdminUser = {
  id: string
  email?: string
  username?: string
  full_name?: string
  phone_number?: string
  national_id?: string
  national_id_image?: string
  proof_of_ownership?: string
  kra_pin?: string
  profile_picture?: string
  role?: string
  status?: string
  verification_status?: string
  email_verified?: boolean
  created_at?: string
}

export type BackendAdminAnalytics = {
  total_tenants?: number
  total_landlords?: number
  pending_verifications?: number
  [k: string]: unknown
}

export function adminListUsers(params?: { role?: string; verification_status?: string }) {
  const qs = new URLSearchParams()
  if (params?.role) qs.set("role", params.role)
  if (params?.verification_status) qs.set("verification_status", params.verification_status)
  const suffix = qs.toString() ? `?${qs.toString()}` : ""
  return apiRequest<BackendAdminUser[]>({
    path: `/api/admin/users${suffix}`,
    method: "GET",
  })
}

export function adminListPendingUsers() {
  return apiRequest<BackendAdminUser[]>({
    path: "/api/admin/users/pending",
    method: "GET",
  })
}

export function adminVerifyUser(userId: string, payload: { verification_notes?: string } = {}) {
  return apiRequest<{ success?: string }>({
    path: `/api/admin/users/${encodeURIComponent(userId)}/verify`,
    method: "POST",
    body: payload,
  })
}

export function adminRejectUser(userId: string, payload: { verification_notes?: string } = {}) {
  return apiRequest<{ success?: string }>({
    path: `/api/admin/users/${encodeURIComponent(userId)}/reject`,
    method: "POST",
    body: payload,
  })
}

export function adminSuspendUser(userId: string) {
  return apiRequest<{ success?: string }>({
    path: `/api/admin/users/${encodeURIComponent(userId)}/suspend`,
    method: "POST",
  })
}

export function adminUnsuspendUser(userId: string) {
  return apiRequest<{ success?: string }>({
    path: `/api/admin/users/${encodeURIComponent(userId)}/unsuspend`,
    method: "POST",
  })
}

export function adminPromoteUser(userId: string) {
  return apiRequest<{ success?: string }>({
    path: `/api/admin/users/${encodeURIComponent(userId)}/promote`,
    method: "POST",
  })
}

export function adminDemoteUser(userId: string) {
  return apiRequest<{ success?: string }>({
    path: `/api/admin/users/${encodeURIComponent(userId)}/demote`,
    method: "POST",
  })
}

export function adminDashboardAnalytics() {
  return apiRequest<BackendAdminAnalytics>({
    path: "/api/admin/analytics",
    method: "GET",
  })
}

