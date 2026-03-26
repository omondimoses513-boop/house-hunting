import { apiRequest, ApiError } from "@/lib/api/client"

export type BackendUserProfile = {
  id?: string | number
  email?: string
  phone_number?: string
  phone?: string
  full_name?: string
  username?: string
  role?: string
  status?: string
  verification_status?: string
  email_verified?: boolean
  verified?: boolean
  created_at?: string
  createdAt?: string
}

async function tryRequest<T>(fn: () => Promise<T>) {
  try {
    return await fn()
  } catch (err) {
    throw err
  }
}

export async function backendGetMyProfile() {
  // Prefer request.user based endpoints if present
  return tryRequest(() =>
    apiRequest<BackendUserProfile>({
      path: "/api/users/profile",
      method: "GET",
    }),
  )
}

export async function backendGetUserById(userId: string) {
  return apiRequest<BackendUserProfile>({
    path: `/api/users/${encodeURIComponent(userId)}`,
    method: "GET",
  })
}

export async function backendGetProfileSmart(userId?: string | null) {
  // Try /api/users/profile first, then fallback to /api/users/{id} if needed.
  try {
    return await backendGetMyProfile()
  } catch (err) {
    const isNotFound = err instanceof ApiError && err.status === 404
    if (isNotFound && userId) return await backendGetUserById(userId)
    throw err
  }
}

export async function backendUpdateMyProfile(patch: Partial<BackendUserProfile>) {
  // Prefer request.user based endpoint
  return apiRequest<BackendUserProfile>({
    path: "/api/users/profile",
    method: "PATCH",
    body: patch,
  })
}

export async function backendUpdateUserById(userId: string, payload: Record<string, unknown>) {
  return apiRequest<BackendUserProfile>({
    path: `/api/users/${encodeURIComponent(userId)}`,
    method: "PUT",
    body: payload,
  })
}

