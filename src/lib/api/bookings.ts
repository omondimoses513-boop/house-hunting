import { apiRequest } from "@/lib/api/client"
import { ApiError } from "@/lib/api/client"

export type BackendBooking = {
  id: string
  unit: string
  tenant?: string
  landlord?: string
  booking_status?: "PENDING" | "CONFIRMED" | "PAID" | "COMPLETED" | "CANCELLED"
  reservation_date?: string
  move_in_date: string
  booking_amount: string | number
  payment_status?: "UNPAID" | "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
  booking_confirmation_code?: string
  lease_agreement_acknowledged?: boolean
  lease_agreement?: string | null
  created_at?: string
  updated_at?: string
}

export function backendCreateBooking(payload: {
  unit: string
  move_in_date: string
  booking_amount: string | number
  lease_agreement_acknowledged?: boolean
}) {
  return apiRequest<BackendBooking>({
    path: "/api/bookings/",
    method: "POST",
    body: payload,
  })
}

export function backendTenantBookings() {
  return apiRequest<BackendBooking[]>({
    path: "/api/bookings/tenants/",
    method: "GET",
  })
}

export function backendLandlordBookings() {
  return apiRequest<BackendBooking[]>({
    path: "/api/bookings/landlords/",
    method: "GET",
  })
}

export function backendAdminAllBookings() {
  return apiRequest<BackendBooking[]>({
    path: "/api/bookings/admin/all/",
    method: "GET",
  })
}

export function backendGetBooking(bookingId: string) {
  return apiRequest<BackendBooking>({
    path: `/api/bookings/${encodeURIComponent(bookingId)}/`,
    method: "GET",
  })
}

export function backendCancelBooking(bookingId: string) {
  return apiRequest<{ message?: string; error?: string }>({
    path: `/api/bookings/${encodeURIComponent(bookingId)}/cancel/`,
    method: "PATCH",
  })
}

export async function backendApproveBooking(bookingId: string) {
  const paths = [
    `/api/bookings/${encodeURIComponent(bookingId)}/approve/`,
    `/api/bookings/${encodeURIComponent(bookingId)}/confirm/`,
  ]
  let lastErr: unknown = null
  for (const path of paths) {
    try {
      return await apiRequest<{ message?: string; success?: string; error?: string }>({
        path,
        method: "POST",
      })
    } catch (err) {
      lastErr = err
      if (err instanceof ApiError && err.status === 404) continue
      throw err
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Booking approve endpoint not found.")
}

export type BookingStats = {
  totalBookings: number
  pendingBookings: number
  paidBookings: number
  totalAmountPaid: number
}

export async function adminBookingStats() {
  try {
    // Fetch all bookings from the admin endpoint
    const allBookings = await backendAdminAllBookings()

    const stats: BookingStats = {
      totalBookings: allBookings.length,
      pendingBookings: allBookings.filter((b) => b.booking_status === "PENDING").length,
      paidBookings: allBookings.filter(
        (b) => b.booking_status === "CONFIRMED" || b.booking_status === "PAID" || b.payment_status === "COMPLETED"
      ).length,
      totalAmountPaid: allBookings.reduce((sum, b) => {
        const amount = typeof b.booking_amount === "string" ? parseFloat(b.booking_amount) : b.booking_amount
        return sum + (Number.isFinite(amount) ? amount : 0)
      }, 0),
    }

    return stats
  } catch (error) {
    console.error("[v0] Error fetching booking stats:", error)
    return {
      totalBookings: 0,
      pendingBookings: 0,
      paidBookings: 0,
      totalAmountPaid: 0,
    }
  }
}

export async function backendConfirmBooking(bookingId: string) {
  return apiRequest<{ message?: string; success?: string; error?: string }>({
    path: `/api/bookings/${encodeURIComponent(bookingId)}/confirm/`,
    method: "PATCH",
  })
}
