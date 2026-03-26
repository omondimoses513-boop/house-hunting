"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuthAlertBanner } from "@/components/auth/AuthAlertBanner"
import { requireAuth } from "@/lib/route-guards"
import { getSession, saveSession } from "@/lib/auth"
import { backendGetProfileSmart, backendUpdateMyProfile, type BackendUserProfile } from "@/lib/api/users"
import { PageRoutes } from "@/constants/page-routes"
import { Mail, Phone, User } from "lucide-react"

function displayRole(role?: string) {
  const r = (role || "").toUpperCase()
  if (!r) return "—"
  if (r === "LANDLORD") return "Landlord"
  if (r === "TENANT") return "Tenant"
  if (r === "ADMIN" || r === "SUPER_ADMIN") return "Admin"
  return r
}

export default function ProfilePage() {
  const router = useRouter()
  const session = useMemo(() => getSession(), [])

  const [profile, setProfile] = useState<BackendUserProfile | null>(null)
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const auth = requireAuth()
    if (!auth.ok) {
      router.replace(auth.redirectTo)
      return
    }

    const userId = auth.session.user.id
    setLoading(true)
    setError(null)

    backendGetProfileSmart(userId)
      .then((data) => {
        setProfile(data)
        setFullName(String(data.full_name ?? auth.session.user.fullName ?? ""))
        setPhone(String(data.phone_number ?? data.phone ?? ""))
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load profile."))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      const next = await backendUpdateMyProfile({
        full_name: fullName.trim(),
        phone_number: phone.trim(),
      })
      setProfile(next)
      setSuccess("Profile updated.")

      // Keep navbar/dashboard name in sync.
      const current = getSession()
      if (current) {
        saveSession({
          ...current,
          user: { ...current.user, fullName: String(next.full_name ?? current.user.fullName) },
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.")
    } finally {
      setSaving(false)
    }
  }

  const role = profile?.role || session?.user.role
  const status = profile?.status
  const verificationStatus = profile?.verification_status
  const emailVerified = profile?.email_verified

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 font-montserrat">Profile</h1>
            <p className="text-muted-foreground font-nunito">Manage your account details</p>
          </motion.div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-6 md:p-8 space-y-6">
              {loading ? (
                <p className="text-sm text-muted-foreground font-nunito">Loading profile...</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-nunito">
                      Role: {displayRole(String(role ?? ""))}
                    </Badge>
                    {typeof emailVerified === "boolean" && (
                      <Badge
                        variant="outline"
                        className={emailVerified ? "text-green-600 border-green-600 font-nunito" : "text-orange-600 border-orange-600 font-nunito"}
                      >
                        {emailVerified ? "Email verified" : "Email not verified"}
                      </Badge>
                    )}
                    {status && (
                      <Badge
                        variant="outline"
                        className={status === "active" ? "text-green-600 border-green-600 font-nunito" : "text-red-600 border-red-600 font-nunito"}
                      >
                        Status: {status}
                      </Badge>
                    )}
                    {verificationStatus && (
                      <Badge variant="outline" className="font-nunito">
                        Verification: {verificationStatus}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2 font-montserrat">Full name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          placeholder="Your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 font-montserrat">Phone number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          placeholder="+254 700 000 000"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2 font-montserrat">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                          value={String(profile?.email ?? session?.user.email ?? "")}
                          disabled
                          className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-muted/20 text-muted-foreground font-nunito"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 font-nunito">
                        Email changes are disabled for now.
                      </p>
                    </div>
                  </div>

                  {error && <AuthAlertBanner tone="error" message={error} />}
                  {success && <AuthAlertBanner tone="success" message={success} />}

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
                    <Button onClick={handleSave} disabled={saving} className="tyrent-gradient text-white font-nunito">
                      {saving ? "Saving..." : "Save changes"}
                    </Button>

                    <div className="text-sm font-nunito">
                      <Link href={PageRoutes.HOME} className="underline">
                        Back to home
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

