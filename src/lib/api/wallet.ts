import { ApiError, apiRequest } from "@/lib/api/client"

export type BackendInitiatePaymentResponse = {
  message?: string
  checkout_request_id?: string
  merchant_request_id?: string
  amount?: string
  phone?: string
  error?: string
  details?: unknown
}

const INITIATE_PATHS = ["/api/wallet/pay/", "/api/wallet/initiate-payment/", "/api/wallet/payments/initiate/", "/api/wallet/initiate/"]

export async function backendInitiateMpesaPayment(payload: { phone: string; amount: string | number; booking_id: string }) {
  let lastError: unknown = null
  for (const path of INITIATE_PATHS) {
    try {
      return await apiRequest<BackendInitiatePaymentResponse>({
        path,
        method: "POST",
        body: payload,
      })
    } catch (err) {
      lastError = err
      if (err instanceof ApiError && err.status === 404) continue
      throw err
    }
  }
  throw lastError instanceof Error ? lastError : new Error("M-Pesa initiate endpoint not found.")
}

export async function backendInitiateSubscriptionPayment(payload: {
  phone: string
  apartment_id?: string
}) {
  return apiRequest<BackendInitiatePaymentResponse>({
    path: "/api/wallet/subscription/",
    method: "POST",
    body: payload,
  })
}