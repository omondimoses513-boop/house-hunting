"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AuthAlertBanner } from "@/components/auth/AuthAlertBanner"
import { backendPasswordResetConfirm } from "@/lib/api/auth"

export default function PasswordResetConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultEmail = searchParams.get("email") ?? ""

  const [email, setEmail] = useState(defaultEmail)
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      await backendPasswordResetConfirm({
        email: email.trim(),
        otp: otp.trim(),
        new_password: newPassword,
      })
      setSuccess("Password reset successful. Redirecting to sign in...")
      setTimeout(() => {
        router.push(`/auth/login?email=${encodeURIComponent(email.trim())}`)
      }, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.")
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
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Confirm reset</h1>
            <p className="text-muted-foreground">Enter the OTP and set a new password</p>
          </motion.div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6 md:p-8 space-y-5">
              <div>
                <label htmlFor="reset-confirm-email" className="block text-sm font-semibold mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="reset-confirm-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border rounded-lg pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reset-otp" className="block text-sm font-semibold mb-2">
                  OTP
                </label>
                <input
                  id="reset-otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              <div>
                <label htmlFor="reset-new-password" className="block text-sm font-semibold mb-2">
                  New password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="reset-new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border rounded-lg pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <AuthAlertBanner tone="error" message={error} />}
              {success && <AuthAlertBanner tone="success" message={success} />}

              <Button onClick={handleSubmit} className="w-full" disabled={loading}>
                {loading ? "Resetting..." : "Reset password"}
              </Button>

              <p className="text-sm text-center">
                Need a new OTP?{" "}
                <Link href={`/auth/password-reset?email=${encodeURIComponent(email.trim())}`} className="underline">
                  Request again
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

