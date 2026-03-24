"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { AuthAlertBanner } from "@/components/auth/AuthAlertBanner"

function getErrorMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") return fallback
  const obj = data as Record<string, unknown>
  if (typeof obj.error === "string") return obj.error
  if (typeof obj.detail === "string") return obj.detail
  const first = Object.values(obj).find((v) => typeof v === "string" || (Array.isArray(v) && typeof v[0] === "string"))
  if (typeof first === "string") return first
  if (Array.isArray(first) && typeof first[0] === "string") return first[0]
  return fallback
}

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultEmail = searchParams.get("email") ?? ""

  const [email, setEmail] = useState(defaultEmail)
  const [otp, setOTP] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(
    defaultEmail ? `Enter the OTP sent to ${defaultEmail}.` : null,
  )
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  // VERIFY OTP
  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/verify-email/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(getErrorMessage(data, "Verification failed"))
      }

      setSuccess("Email verified successfully. Redirecting to sign in...")

      if (data?.token) {
        localStorage.setItem("token", data.token)
      }

      setTimeout(() => router.push(`/auth/login?email=${encodeURIComponent(email.trim())}`), 1600)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error occurred")
    } finally {
      setLoading(false)
    }
  }

  // RESEND OTP
  const handleResend = async () => {
    setError(null)
    setSuccess(null)
    setResending(true)

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/resend-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(getErrorMessage(data, "Failed to resend OTP"))
      }

      setInfo("A fresh OTP has been sent. Check your inbox and spam folder.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold">Verify Email</h1>
          <p className="text-muted-foreground">
            Enter OTP sent to your email
          </p>
        </motion.div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
            />

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
            />

            {info && <AuthAlertBanner tone="info" message={info} />}

            {error && <AuthAlertBanner tone="error" message={error} />}
            {success && <AuthAlertBanner tone="success" message={success} />}

            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>

            <Button
              onClick={handleResend}
              disabled={resending}
              variant="outline"
              className="w-full"
            >
              {resending ? "Resending..." : "Resend OTP"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}