// app/booking/pending/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { backendTenantBookings } from "@/lib/api/bookings"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageRoutes } from "@/constants/page-routes"

export default function BookingPendingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const unitId = searchParams.get("unit")
  const [status, setStatus] = useState<"waiting" | "success" | "failed">("waiting")
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const MAX_ATTEMPTS = 20 // 20 × 3s = 60 seconds

  useEffect(() => {
    if (!unitId) return

    const poll = async () => {
      try {
        const bookings = await backendTenantBookings()
        const match = bookings.find(
          (b) => String(b.unit) === unitId && b.payment_status === "COMPLETED"
        )
        if (match) {
          setBookingId(String(match.id))
          setStatus("success")
          return
        }
      } catch {
        // keep polling
      }

      setAttempts((prev) => {
        if (prev + 1 >= MAX_ATTEMPTS) {
          setStatus("failed")
        }
        return prev + 1
      })
    }

    if (status === "waiting") {
      const interval = setInterval(poll, 3000)
      return () => clearInterval(interval)
    }
  }, [unitId, status])

  useEffect(() => {
    if (status === "success" && bookingId) {
      router.push(
        `${PageRoutes.BOOKING_CONFIRMATION}?booking=${encodeURIComponent(bookingId)}`
      )
    }
  }, [status, bookingId, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8 text-center">
          {status === "waiting" && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold font-montserrat mb-2">Waiting for Payment</h2>
              <p className="text-muted-foreground font-nunito">
                Complete the M-Pesa prompt on your phone. This page will update automatically.
              </p>
              <p className="text-sm text-muted-foreground mt-4 font-nunito">
                Checking... ({attempts}/{MAX_ATTEMPTS})
              </p>
            </>
          )}
          {status === "failed" && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold font-montserrat mb-2">Payment Not Confirmed</h2>
              <p className="text-muted-foreground font-nunito mb-6">
                We didn't receive payment confirmation. If you completed the payment, please contact support.
              </p>
              <Button onClick={() => router.back()} className="w-full">
                Try Again
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}