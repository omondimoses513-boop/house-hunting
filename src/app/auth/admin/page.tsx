"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageRoutes } from "@/constants/page-routes"
import { getSession, registerUser } from "@/lib/auth"

// Must match ADMIN_INVITE_CODE in @/lib/auth — both read from the same env var
const VALID_INVITE_CODE =
  process.env.NEXT_PUBLIC_ADMIN_INVITE_CODE || "TYRENT-ADMIN-INVITE"

export default function AdminInvitePage() {
  const router = useRouter()
  const existingSession = useMemo(() => getSession(), [])

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [inviteCodeInput, setInviteCodeInput] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (existingSession?.user.role === "admin") {
    router.replace(PageRoutes.ADMIN_DASHBOARD)
    return null
  }

  const handleSubmit = () => {
    setError(null)

    if (!fullName || !email || !password || !confirmPassword || !inviteCodeInput) {
      setError("Please fill in all fields.")
      return
    }

    if (inviteCodeInput !== VALID_INVITE_CODE) {
      setError("Invalid invite code.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setLoading(true)
    try {
      registerUser({ fullName, email, password, role: "admin", adminInviteCode: inviteCodeInput })
      router.push(PageRoutes.ADMIN_DASHBOARD)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Admin signup failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-montserrat">Admin access</h1>
            <p className="text-muted-foreground font-nunito">Invite-only admin signup</p>
          </motion.div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6 md:p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">Invite code</label>
                <input
                  type="text"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                  placeholder="Enter invite code"
                  className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                />
                <p className="text-xs text-muted-foreground font-nunito mt-2">
                  For now this is frontend-only. We'll enforce invite-only on the backend next week.
                </p>
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

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-4">
                  <p className="text-sm text-red-700 dark:text-red-200 font-nunito">{error}</p>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                className="w-full tyrent-gradient text-white font-nunito"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create admin account"}
              </Button>

              <p className="text-sm text-muted-foreground font-nunito text-center">
                Need a normal account?{" "}
                <Link href="/auth/register" className="text-primary hover:underline">
                  Tenant/Landlord signup
                </Link>
              </p>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground font-nunito">
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}