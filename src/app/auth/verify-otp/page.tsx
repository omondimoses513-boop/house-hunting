"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function VerifyOTPPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [otp, setOTP] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  // VERIFY OTP
  const handleSubmit = async () => {
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("http://localhost:8000/api/auth/verify-email/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      })

      const data = await res.json()
      console.log("VERIFY RESPONSE:", data)

      if (!res.ok) {
        throw new Error(data?.error || "Verification failed")
      }

      setSuccess(true)

      if (data?.token) {
        localStorage.setItem("token", data.token)
      }

      setTimeout(() => router.push("/auth/login"), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error occurred")
    } finally {
      setLoading(false)
    }
  }

  // RESEND OTP
  const handleResend = async () => {
    setError(null)
    setResending(true)

    try {
      const res = await fetch("http://localhost:8000/api/auth/resend-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()
      console.log("RESEND RESPONSE:", data)

      if (!res.ok) {
        throw new Error(data?.error || "Failed to resend OTP")
      }

      alert("OTP sent again to your email")
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

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {success && (
              <p className="text-green-500 text-sm">
                Verified! Redirecting...
              </p>
            )}

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