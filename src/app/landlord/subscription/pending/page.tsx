"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { backendCheckSubscription } from "@/lib/api/wallet"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageRoutes } from "@/constants/page-routes"

export default function SubscriptionPendingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  // apartment_id is now optional — we don't need it to poll
  const checkoutRequestId = searchParams.get("checkout_request_id")
  const [status, setStatus] = useState<"waiting" | "success" | "failed">("waiting")
  const [attempts, setAttempts] = useState(0)
  const MAX_ATTEMPTS = 20 // 20 × 3s = 60 seconds

  useEffect(() => {
    if (status !== "waiting") return

    const poll = async () => {
      try {
        const result = await backendCheckSubscription()
        if (result.has_active) {
          setStatus("success")
          return
        }
      } catch {
        // keep polling
      }

      setAttempts((prev) => {
        const next = prev + 1
        if (next >= MAX_ATTEMPTS) setStatus("failed")
        return next
      })
    }

    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [status]) // removed apartmentId dependency — always poll

  useEffect(() => {
    if (status === "success") {
      // Redirect to the listing form, not confirmation
      setTimeout(() => {
        router.push(PageRoutes.LANDLORD_CREATE_PROPERTY)
      }, 2000)
    }
  }, [status, router])

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

          {status === "success" && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold font-montserrat mb-2">Payment Confirmed!</h2>
              <p className="text-muted-foreground font-nunito">
                Subscription active. Taking you to list your property...
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
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => { setStatus("waiting"); setAttempts(0) }}
                  className="w-full tyrent-gradient text-white font-nunito"
                >
                  Check Again
                </Button>
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="w-full font-nunito bg-transparent"
                >
                  Go Back
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}