"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageRoutes } from "@/constants/page-routes"

// Redirect user based on role
function redirectForRole(role: string) {
  if (role === "ADMIN") return PageRoutes.ADMIN_DASHBOARD
  if (role === "LANDLORD") return PageRoutes.LANDLORD_DASHBOARD
  return PageRoutes.TENANT_DASHBOARD
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [csrfToken, setCsrfToken] = useState("")

  // ✅ Fetch CSRF token on load
  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/csrf/", {
          credentials: "include",
        })
        const data = await res.json()
        setCsrfToken(data.csrfToken)
      } catch (err) {
        console.error("Failed to fetch CSRF token", err)
      }
    }
    fetchCsrf()
  }, [])

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken, // required for Django session POST
        },
        credentials: "include", // ensures session cookie is sent
        body: JSON.stringify({
          username: email,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Invalid credentials")
      }

      // Redirect based on role
      const role = data.user?.role || data.role
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
              {error && (
                <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">{error}</div>
              )}

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
                Don’t have an account?{" "}
                <Link href="/auth/register" className="underline">Create one</Link>
              </p>

            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}