"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AuthAlertBanner } from "@/components/auth/AuthAlertBanner"
import { backendPasswordResetRequest } from "@/lib/api/auth"

export default function PasswordResetRequestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultEmail = searchParams.get("email") ?? ""

  const [email, setEmail] = useState(defaultEmail)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      await backendPasswordResetRequest({ email: email.trim() })
      setSuccess("OTP sent. Check your email to continue.")
      setTimeout(() => {
        router.push(`/auth/password-reset/confirm?email=${encodeURIComponent(email.trim())}`)
      }, 900)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request password reset.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Reset password</h1>
            <p className="text-muted-foreground">We’ll email you an OTP to reset your password</p>
          </motion.div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6 md:p-8 space-y-5">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-semibold mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border rounded-lg pl-10"
                  />
                </div>
              </div>

              {error && <AuthAlertBanner tone="error" message={error} />}
              {success && <AuthAlertBanner tone="success" message={success} />}

              <Button onClick={handleSubmit} className="w-full" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>

              <p className="text-sm text-center">
                Remembered your password?{" "}
                <Link href="/auth/login" className="underline">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

