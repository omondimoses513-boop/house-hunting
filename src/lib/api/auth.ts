import { apiRequest } from "@/lib/api/client"

export type BackendLoginResponse = {
  token: string
  user_id?: string
  username?: string
  email?: string
  role?: string
  status?: string
  verification_status?: string
  user?: {
    id?: string | number
    email?: string
    full_name?: string
    role?: string
    created_at?: string
  }
}

export function backendRegister(formData: FormData) {
  return apiRequest<unknown>({
    path: "/api/auth/register",
    method: "POST",
    formData,
  })
}

export function backendLogin(payload: { email?: string; username?: string; password: string }) {
  return apiRequest<BackendLoginResponse>({
    path: "/api/auth/login",
    method: "POST",
    body: payload,
  })
}

export function backendVerifyEmail(payload: { email: string; otp: string }) {
  return apiRequest<{ message?: string; token?: string }>({
    path: "/api/auth/verify-email/",
    method: "POST",
    body: payload,
  })
}

export function backendResendOtp(payload: { email: string }) {
  return apiRequest<{ success?: string; message?: string }>({
    path: "/api/auth/resend-otp/",
    method: "POST",
    body: payload,
  })
}

export function backendPasswordResetRequest(payload: { email: string }) {
  return apiRequest<{ success?: string; message?: string }>({
    path: "/api/auth/password-reset/request",
    method: "POST",
    body: payload,
  })
}

export function backendPasswordResetConfirm(payload: { email: string; otp: string; new_password: string }) {
  return apiRequest<{ success?: string; message?: string }>({
    path: "/api/auth/password-reset/confirm",
    method: "POST",
    body: payload,
  })
}

