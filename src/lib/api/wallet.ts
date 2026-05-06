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

// Booking payment — sends unit_id, booking created only after payment succeeds
export async function backendInitiateMpesaPayment(payload: { 
  phone: string
  unit_id: string  // changed from booking_id
}) {
  return apiRequest<BackendInitiatePaymentResponse>({
    path: "/api/wallet/pay/",
    method: "POST",
    body: payload,
  })
}

// Subscription payment — unchanged
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

export function backendCheckSubscription() {
  return apiRequest<{ has_active: boolean }>({
    path: "/api/wallet/subscription/status/",
    method: "GET",
  })
}