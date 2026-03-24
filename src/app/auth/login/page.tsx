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
      let res = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      let data = await res.json()

      // Backward-compatibility fallback if backend serializer expects username.
      if (!res.ok && typeof data === "object" && data) {
        const usernameError = (data as Record<string, unknown>).username
        const requiresUsername =
          (Array.isArray(usernameError) && typeof usernameError[0] === "string" && usernameError[0].toLowerCase().includes("required")) ||
          (typeof usernameError === "string" && usernameError.toLowerCase().includes("required"))

        if (requiresUsername) {
          res = await fetch("http://127.0.0.1:8000/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: email.trim(),
              password,
            }),
          })
          data = await res.json()
        }
      }

      if (!res.ok) {
        const message = getErrorMessage(data)
        const lower = message.toLowerCase()
        const needsOtp =
          lower.includes("verify") || lower.includes("otp") || lower.includes("not verified")
        if (needsOtp) {
          router.push(`/auth/verify-otp?email=${encodeURIComponent(email.trim())}&from=login`)
          return
        }
        throw new Error(message)
      }

      // Store token for future authenticated requests
      if (data.token) {
        localStorage.setItem("token", data.token)
      }

      const role = (data.user?.role || data.role || "TENANT") as string
      const sessionEmail = data.user?.email || email.trim()
      const sessionName = data.user?.full_name || data.user?.fullName || data.username || sessionEmail.split("@")[0] || "User"

      saveSession({
        token: data.token || "",
        createdAt: new Date().toISOString(),
        user: {
          id: String(data.user?.id ?? data.user_id ?? sessionEmail),
          fullName: String(sessionName),
          email: String(sessionEmail),
          role: mapRoleForSession(role),
          createdAt: String(data.user?.created_at ?? data.user?.createdAt ?? new Date().toISOString()),
        },
      })

      // Redirect based on role
      router.push(next || redirectForRole(role))
    } catch (err) {
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
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border rounded-lg"
                />
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

            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}