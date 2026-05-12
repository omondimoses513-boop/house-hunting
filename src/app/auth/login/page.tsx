"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageRoutes } from "@/constants/page-routes"
import { saveSession } from "@/lib/auth"
import { AuthAlertBanner } from "@/components/auth/AuthAlertBanner"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { ApiError } from "@/lib/api/client"
import { backendLogin } from "@/lib/api/auth"

// Redirect user based on role
function redirectForRole(role: string) {
  const normalizedRole = role.trim().toUpperCase()
  if (normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN") return PageRoutes.ADMIN_DASHBOARD
  if (normalizedRole === "LANDLORD") return PageRoutes.LANDLORD_DASHBOARD
  return PageRoutes.TENANT_DASHBOARD
}

function mapRoleForSession(role: string): "tenant" | "landlord" | "admin" {
  const normalizedRole = role.trim().toUpperCase()
  if (normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN") return "admin"
  if (normalizedRole === "LANDLORD") return "landlord"
  return "tenant"
}

function getErrorMessage(data: unknown) {
  if (!data || typeof data !== "object") return "Invalid credentials"
  const obj = data as Record<string, unknown>
  if (typeof obj.error === "string") return obj.error
  if (typeof obj.detail === "string") return obj.detail
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value) && typeof value[0] === "string") return `${key}: ${value[0]}`
    if (typeof value === "string") return `${key}: ${value}`
  }
  const first = Object.values(obj).find((v) => typeof v === "string" || (Array.isArray(v) && typeof v[0] === "string"))
  if (typeof first === "string") return first
  if (Array.isArray(first) && typeof first[0] === "string") return first[0]
  return "Invalid credentials"
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next")
  const defaultEmail = searchParams.get("email") ?? ""

  const [email, setEmail] = useState(defaultEmail)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(
    defaultEmail ? "Email verified. You can now sign in." : null,
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const trimmedEmail = email.trim()
      let data
      try {
        data = await backendLogin({ email: trimmedEmail, password })
      } catch (err) {
        // Backward-compatibility fallback if backend serializer expects username instead of email.
        const message = err instanceof Error ? err.message : "Login failed."
        const lower = message.toLowerCase()
        const requiresUsername = lower.includes("username") && lower.includes("required")
        if (requiresUsername) {
          data = await backendLogin({ username: trimmedEmail, password })
        } else {
          throw err
        }
      }

      const lower = String((data as any)?.error ?? "").toLowerCase()
      const needsOtp =
        lower.includes("verify") || lower.includes("otp") || lower.includes("not verified")
      if (needsOtp) {
        router.push(`/auth/verify-otp?email=${encodeURIComponent(trimmedEmail)}&from=login`)
        return
      }

      // Store token for future authenticated requests
      if (data.token) {
        localStorage.setItem("token", data.token)
      }

      const role = (data.user?.role || data.role || "TENANT") as string
      const sessionEmail = data.user?.email || email.trim()
      const sessionName = data.user?.full_name || data.username || sessionEmail.split("@")[0] || "User"

      const sessionData = {
        token: data.token || "",
        createdAt: new Date().toISOString(),
        user: {
          id: String(data.user?.id ?? data.user_id ?? sessionEmail),
          fullName: String(sessionName),
          email: String(sessionEmail),
          role: mapRoleForSession(role),
          createdAt: String(data.user?.created_at ?? new Date().toISOString()),
        },
      }
      
      saveSession(sessionData)
      
      // Also set cookies for middleware authentication (critical for production)
      // Middleware checks cookies, not localStorage, to protect routes
      document.cookie = `token=${sessionData.token}; path=/; max-age=2592000; SameSite=Lax`
      document.cookie = `role=${sessionData.user.role}; path=/; max-age=2592000; SameSite=Lax`
      
      setSuccess("Login successful! Redirecting...")

      // Use a delay to ensure localStorage AND cookies are persisted before navigation
      // This is critical for production where localStorage sync is slower
      // The dashboard will then have a 10ms delay in useAuth to ensure it can read the session
      setTimeout(() => {
        router.push(next || redirectForRole(role))
      }, 500)
    } catch (err) {
      if (err instanceof ApiError) {
        const lower = err.message.toLowerCase()
        const needsOtp =
          lower.includes("verify") || lower.includes("otp") || lower.includes("not verified")
        if (needsOtp) {
          router.push(`/auth/verify-otp?email=${encodeURIComponent(email.trim())}&from=login`)
          setLoading(false)
          return
        }
      }
      setError(err instanceof Error ? err.message : "Login failed.")
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
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Sign in</h1>
            <p className="text-muted-foreground">Access your dashboard</p>
          </motion.div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6 md:p-8 space-y-5">

              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-semibold mb-2">Email</label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border rounded-lg pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-sm font-semibold mb-2">Password</label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Error */}
              {success && <AuthAlertBanner tone="success" message={success} />}
              {error && <AuthAlertBanner tone="error" message={error} />}

              {/* Sign in button */}
              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              {/* Register link */}
              <p className="text-sm text-center">
                Don't have an account?{" "}
                <Link href="/auth/register" className="underline">Create one</Link>
              </p>

              <p className="text-sm text-center">
                Forgot your password?{" "}
                <Link href={`/auth/password-reset?email=${encodeURIComponent(email.trim())}`} className="underline">
                  Reset it
                </Link>
              </p>

            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
