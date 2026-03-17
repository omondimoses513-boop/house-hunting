"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageRoutes } from "@/constants/page-routes"
import { getSession, loginUser } from "@/lib/auth"

function redirectForRole(role: string) {
  if (role === "admin") return PageRoutes.ADMIN_DASHBOARD
  if (role === "landlord") return PageRoutes.LANDLORD_DASHBOARD
  return PageRoutes.TENANT_DASHBOARD
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next")

  const existingSession = useMemo(() => getSession(), [])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (existingSession) {
    // If already logged in, send to dashboard.
    const target = next || redirectForRole(existingSession.user.role)
    router.replace(target)
    return null
  }

  const handleSubmit = () => {
    setError(null)
    setLoading(true)
    try {
      const session = loginUser({ email, password })
      const target = next || redirectForRole(session.user.role)
      router.push(target)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-montserrat">Sign in</h1>
            <p className="text-muted-foreground font-nunito">Access your tenant, landlord, or admin dashboard</p>
          </motion.div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6 md:p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-4">
                  <p className="text-sm text-red-700 dark:text-red-200 font-nunito">{error}</p>
                </div>
              )}

              <Button onClick={handleSubmit} className="w-full tyrent-gradient text-white font-nunito" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              <p className="text-sm text-muted-foreground font-nunito text-center">
                Don’t have an account?{" "}
                <Link href="/auth/register" className="text-primary hover:underline">
                  Create one
                </Link>
              </p>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Link href={PageRoutes.PROPERTIES} className="text-sm text-muted-foreground hover:text-foreground font-nunito">
              Continue browsing properties
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

