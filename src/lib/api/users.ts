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
  // Backend routes (users.urls_users):
  //   path('me', user_profile),
  return tryRequest(() =>
    apiRequest<BackendUserProfile>({
      path: "/api/users/me",
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
  // Current backend exposes /api/users/me (and not /profile or /{id}).
  // Keep the helper in case we later want to add id-based lookups.
  void userId
  return backendGetMyProfile()
}

export async function backendUpdateMyProfile(patch: Partial<BackendUserProfile>) {
  // Backend routes (users.urls_users):
  //   path('me/update', update_user_profile),
  return apiRequest<BackendUserProfile>({
    path: "/api/users/me/update",
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

export async function backendUpdateMyProfileForm(formData: FormData) {
  return apiRequest<BackendUserProfile>({
    path: "/api/users/me/update",
    method: "PATCH",
    formData,
  })
}

