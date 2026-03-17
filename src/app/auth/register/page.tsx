"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageRoutes } from "@/constants/page-routes"
import { getSession, registerUser, type UserRole } from "@/lib/auth"

function redirectForRole(role: UserRole) {
  if (role === "admin") return PageRoutes.ADMIN_DASHBOARD
  if (role === "landlord") return PageRoutes.LANDLORD_DASHBOARD
  return PageRoutes.TENANT_DASHBOARD
}

export default function RegisterPage() {
  const router = useRouter()
  const existingSession = useMemo(() => getSession(), [])

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<UserRole>("tenant")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (existingSession) {
    router.replace(redirectForRole(existingSession.user.role))
    return null
  }

  const handleSubmit = () => {
    setError(null)
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const session = registerUser({ fullName, email, password, role })
      router.push(redirectForRole(session.user.role))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-montserrat">Create account</h1>
            <p className="text-muted-foreground font-nunito">Choose a role to continue</p>
          </motion.div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6 md:p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Wanjiru"
                  className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                />
              </div>

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
                <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                >
                  <option value="tenant">Tenant</option>
                  <option value="landlord">Landlord</option>
                </select>
                <p className="text-xs text-muted-foreground font-nunito mt-2">
                  Looking for admin access? Use the invite-only admin signup link.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-4">
                  <p className="text-sm text-red-700 dark:text-red-200 font-nunito">{error}</p>
                </div>
              )}

              <Button onClick={handleSubmit} className="w-full tyrent-gradient text-white font-nunito" disabled={loading}>
                {loading ? "Creating..." : "Create account"}
              </Button>

              <p className="text-sm text-muted-foreground font-nunito text-center">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  Sign in
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

