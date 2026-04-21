"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Ban,
  Shield,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import {
  seedAdminDemoDataIfEmpty,
  updateAdminDispute,
  getAdminDisputes,
  type AdminDispute,
  type AdminStats,
  type AdminUser,
  type AdminVerification,
} from "@/lib/admin-storage"
import { requireAuth } from "@/lib/route-guards"
import {
  adminDashboardAnalytics,
  adminListPendingUsers,
  adminListUsers,
  adminRejectUser,
  adminSuspendUser,
  adminVerifyUser,
} from "@/lib/api/admin"
import { backendListApartments, backendListUnits } from "@/lib/api/properties"
import { adminBookingStats, type BookingStats } from "@/lib/api/bookings"

function getDefaultApiBase() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/+$/, "")
}

function absolutizeApiUrl(url: string, apiBase: string) {
  if (!url || typeof url !== "string") return url
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`
}

type VerificationMetaEntry = {
  nationalId?: string
  phone?: string
  documents: Array<{ label: string; url: string }>
}

/** Maps Django user JSON (e.g. list + pending) to modal fields; absolutizes /media/... paths. */
function buildVerificationMetaFromUser(u: Record<string, unknown>, apiBase: string): VerificationMetaEntry {
  const abs = (url: string) => absolutizeApiUrl(url, apiBase)
  const docs: Array<{ label: string; url: string }> = []
  const pushIf = (key: string, label: string) => {
    const v = u[key]
    if (typeof v === "string" && v.trim()) docs.push({ label, url: abs(v) })
  }
  pushIf("national_id_image", "National ID Image")
  pushIf("proof_of_ownership", "Proof of Ownership")
  pushIf("kra_pin", "KRA PIN")
  pushIf("profile_picture", "Profile Picture")

  const nid = u.national_id
  const phone = u.phone_number
  return {
    nationalId:
      typeof nid === "string" && nid
        ? nid
        : typeof nid === "number"
          ? String(nid)
          : undefined,
    phone: typeof phone === "string" && phone ? phone : undefined,
    documents: docs,
  }
}

function mergeVerificationMeta(
  users: unknown[],
  pending: unknown[],
  apiBase: string,
): Record<string, VerificationMetaEntry> {
  const out: Record<string, VerificationMetaEntry> = {}
  for (const raw of users ?? []) {
    if (raw && typeof raw === "object" && "id" in raw) {
      out[String((raw as { id: unknown }).id)] = buildVerificationMetaFromUser(
        raw as Record<string, unknown>,
        apiBase,
      )
    }
  }
  for (const raw of pending ?? []) {
    if (raw && typeof raw === "object" && "id" in raw) {
      out[String((raw as { id: unknown }).id)] = buildVerificationMetaFromUser(
        raw as Record<string, unknown>,
        apiBase,
      )
    }
  }
  return out
}

export default function AdminDashboard() {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [banner, setBanner] = useState<{ title: string; message: string } | null>(null)

  const API_BASE = getDefaultApiBase()
  const absolutizeUrl = (url: string) => absolutizeApiUrl(url, API_BASE)
  const isLikelyImageUrl = (url: string) => /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url)

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([])
  const [pendingVerifications, setPendingVerifications] = useState<AdminVerification[]>([])
  const [disputes, setDisputes] = useState<AdminDispute[]>([])
  const [bookingStats, setBookingStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    paidBookings: 0,
    totalAmountPaid: 0,
  })

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [selectedVerification, setSelectedVerification] = useState<AdminVerification | null>(null)
  const [selectedDispute, setSelectedDispute] = useState<AdminDispute | null>(null)
  const [verificationMeta, setVerificationMeta] = useState<Record<string, VerificationMetaEntry>>({})

  const [verifyNotes, setVerifyNotes] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [resolutionText, setResolutionText] = useState("")

  useEffect(() => {
    const auth = requireAuth({ role: "admin" })
    if (!auth.ok) {
      router.replace(auth.redirectTo)
      return
    }
    seedAdminDemoDataIfEmpty()

    const load = async () => {
      try {
        const [analytics, users, pending, apartments, units, bookingStats] = await Promise.all([
          adminDashboardAnalytics(),
          adminListUsers(),
          adminListPendingUsers(),
          backendListApartments().catch(() => []),
          backendListUnits().catch(() => []),
          adminBookingStats(),
        ])

        // Map backend analytics to existing dashboard shape.
        const totalTenants = (analytics as any)?.total_tenants ?? 0
        const totalLandlords = (analytics as any)?.total_landlords ?? 0
        const pendingVerificationsCount = (analytics as any)?.pending_verifications ?? 0
        const totalUsers = totalTenants + totalLandlords
        const totalProperties = Array.isArray(apartments) ? apartments.length : 0
        const allUnits = Array.isArray(units) ? units : []
        const totalUnits = allUnits.length
        const occupiedUnits = allUnits.filter((u: any) => String(u?.status ?? "").toUpperCase() === "OCCUPIED").length
        const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 1000) / 10 : 0
        const totalRevenue = allUnits.reduce((sum: number, u: any) => {
          const isOccupied = String(u?.status ?? "").toUpperCase() === "OCCUPIED"
          const price = Number(u?.price_per_month ?? 0)
          return sum + (isOccupied && Number.isFinite(price) ? price : 0)
        }, 0)

        setStats({
          totalUsers,
          totalLandlords,
          totalTenants,
          totalProperties,
          totalUnits,
          occupancyRate,
          totalRevenue,
          revenueGrowth: 0,
          // keep pending count indirectly via pendingVerifications array
        })

        setBookingStats(bookingStats)

        const mapRole = (role?: string): AdminUser["type"] => {
          const r = (role ?? "").toLowerCase()
          if (r.includes("landlord")) return "landlord"
          return "tenant"
        }

        const toAdminUser = (u: any): AdminUser => {
          const verificationStatus = (u.verification_status ?? "").toString().toLowerCase()
          const status = (u.status ?? "").toString().toLowerCase()
          const created = (u.created_at ?? u.createdAt ?? new Date().toISOString()).toString()
          const verified =
            verificationStatus === "verified" || verificationStatus === "approved" || Boolean(u.verified)

          let mappedStatus: AdminUser["status"] = "active"
          if (status === "suspended") mappedStatus = "suspended"
          else if (verificationStatus === "pending" || verificationStatus === "under-review") mappedStatus = "pending"
          else if (status === "pending") mappedStatus = "pending"

          return {
            id: String(u.id),
            name: (u.full_name ?? u.fullName ?? u.username ?? u.email ?? "User").toString(),
            email: (u.email ?? "").toString(),
            type: mapRole(u.role),
            status: mappedStatus,
            joinedDate: created,
            verified,
          }
        }

        setVerificationMeta(mergeVerificationMeta(users ?? [], pending ?? [], API_BASE))

        const mappedUsers = (users ?? []).map(toAdminUser)
        setRecentUsers(mappedUsers)

        const toAdminVerification = (u: any): AdminVerification => {
          const verificationStatus = (u.verification_status ?? "").toString().toLowerCase()
          const created = (u.created_at ?? u.createdAt ?? new Date().toISOString()).toString()

          let mappedStatus: AdminVerification["status"] = "pending"
          if (verificationStatus.includes("under")) mappedStatus = "under-review"
          else if (verificationStatus === "verified" || verificationStatus === "approved") mappedStatus = "approved"
          else if (verificationStatus === "rejected") mappedStatus = "rejected"

          const docs = Array.isArray(u.documents) ? u.documents.map(String) : []

          return {
            id: String(u.id),
            landlord: (u.full_name ?? u.fullName ?? u.username ?? u.email ?? "Landlord").toString(),
            property: "N/A",
            submittedDate: created,
            documents: docs,
            status: mappedStatus,
            notes: (u.verification_notes ?? u.notes ?? "").toString() || undefined,
          }
        }

        const mappedPending = (pending ?? []).map(toAdminVerification)
        setPendingVerifications(mappedPending)

        // Keep disputes demo data until backend dispute endpoints are connected.
        setDisputes(getAdminDisputes())
        // eslint-disable-next-line no-unused-vars
        const _ignore = pendingVerificationsCount
      } catch (err) {
        setBanner({
          title: "Failed to load admin data",
          message: err instanceof Error ? err.message : "Unknown error",
        })
      }
    }

    load()
  }, [])

  const derived = useMemo(() => {
    const pendingCount = pendingVerifications.filter((v) => v.status === "pending" || v.status === "under-review").length
    const activeDisputes = disputes.filter((d) => d.status !== "resolved").length
    return { pendingCount, activeDisputes }
  }, [pendingVerifications, disputes])

  const platformMetrics = useMemo(() => {
    const avgBookingValue =
      bookingStats.totalBookings > 0
        ? Math.round(bookingStats.totalAmountPaid / bookingStats.totalBookings)
        : 0
    const totalPaid = bookingStats.totalAmountPaid
    return [
      {
        label: "Total Bookings",
        value: bookingStats.totalBookings.toLocaleString(),
        change: "+12.5%",
        trend: "up" as const,
      },
      {
        label: "Pending Bookings",
        value: bookingStats.pendingBookings.toLocaleString(),
        change: `${bookingStats.pendingBookings > 0 ? "-" : "+"}5%`,
        trend: bookingStats.pendingBookings > 0 ? ("down" as const) : ("up" as const),
      },
      {
        label: "Paid Bookings",
        value: bookingStats.paidBookings.toLocaleString(),
        change: "+8.2%",
        trend: "up" as const,
      },
      {
        label: "Total Amount Paid",
        value: `KES ${(totalPaid / 1000000).toFixed(1)}M`,
        change: "+15.3%",
        trend: "up" as const,
      },
    ]
  }, [bookingStats])

  const refreshLists = async () => {
    const [users, pending] = await Promise.all([adminListUsers(), adminListPendingUsers()])

    const mapRole = (role?: string): AdminUser["type"] => {
      const r = (role ?? "").toLowerCase()
      if (r.includes("landlord")) return "landlord"
      return "tenant"
    }

    const toAdminUser = (u: any): AdminUser => {
      const verificationStatus = (u.verification_status ?? "").toString().toLowerCase()
      const status = (u.status ?? "").toString().toLowerCase()
      const created = (u.created_at ?? u.createdAt ?? new Date().toISOString()).toString()
      const verified =
        verificationStatus === "verified" || verificationStatus === "approved" || Boolean(u.verified)

      let mappedStatus: AdminUser["status"] = "active"
      if (status === "suspended") mappedStatus = "suspended"
      else if (verificationStatus === "pending" || verificationStatus === "under-review") mappedStatus = "pending"
      else if (status === "pending") mappedStatus = "pending"

      return {
        id: String(u.id),
        name: (u.full_name ?? u.fullName ?? u.username ?? u.email ?? "User").toString(),
        email: (u.email ?? "").toString(),
        type: mapRole(u.role),
        status: mappedStatus,
        joinedDate: created,
        verified,
      }
    }

    const toAdminVerification = (u: any): AdminVerification => {
      const verificationStatus = (u.verification_status ?? "").toString().toLowerCase()
      const created = (u.created_at ?? u.createdAt ?? new Date().toISOString()).toString()

      let mappedStatus: AdminVerification["status"] = "pending"
      if (verificationStatus.includes("under")) mappedStatus = "under-review"
      else if (verificationStatus === "verified" || verificationStatus === "approved") mappedStatus = "approved"
      else if (verificationStatus === "rejected") mappedStatus = "rejected"

      const docs = Array.isArray(u.documents) ? u.documents.map(String) : []

      return {
        id: String(u.id),
        landlord: (u.full_name ?? u.fullName ?? u.username ?? u.email ?? "Landlord").toString(),
        property: "N/A",
        submittedDate: created,
        documents: docs,
        status: mappedStatus,
        notes: (u.verification_notes ?? u.notes ?? "").toString() || undefined,
      }
    }

    setVerificationMeta(mergeVerificationMeta(users ?? [], pending ?? [], API_BASE))
    setRecentUsers((users ?? []).map(toAdminUser))
    setPendingVerifications((pending ?? []).map(toAdminVerification))
  }

  const approveUser = async (userId: string) => {
    await adminVerifyUser(userId)
    setBanner({ title: "User approved", message: "Verification approved successfully." })
    await refreshLists()
  }

  const suspendUser = async (userId: string) => {
    await adminSuspendUser(userId)
    setBanner({ title: "User suspended", message: "User suspended successfully." })
    await refreshLists()
  }

  const markVerificationReview = (id: string) => {
    // Backend currently only exposes verify/reject/suspend operations in the snippet.
    setBanner({ title: "Not supported", message: "Marking under-review isn't wired to backend yet." })
    void id
  }

  const approveVerification = async (id: string) => {
    await adminVerifyUser(id, { verification_notes: verifyNotes.trim() || undefined })
    setVerifyNotes("")
    setSelectedVerification(null)
    setBanner({ title: "Verification approved", message: "Landlord verification has been approved." })
    await refreshLists()
  }

  const rejectVerification = async (id: string) => {
    await adminRejectUser(id, { verification_notes: rejectReason.trim() || undefined })
    setRejectReason("")
    setSelectedVerification(null)
    setBanner({ title: "Verification rejected", message: "Landlord verification has been rejected." })
    await refreshLists()
  }

  const investigateDispute = (id: string) => {
    setDisputes(updateAdminDispute(id, { status: "investigating" }))
    setBanner({ title: "Dispute investigating", message: "Marked dispute as investigating." })
  }

  const resolveDispute = (id: string) => {
    setDisputes(updateAdminDispute(id, { status: "resolved", resolution: resolutionText.trim() || undefined }))
    setResolutionText("")
    setSelectedDispute(null)
    setBanner({ title: "Dispute resolved", message: "Marked dispute as resolved." })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 font-montserrat">Admin Dashboard</h1>
              <p className="text-muted-foreground font-nunito">Platform overview and management</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-input rounded-lg bg-background text-sm font-nunito"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          {banner && (
            <div className="mb-8 rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground font-montserrat">{banner.title}</p>
                  <p className="text-sm text-muted-foreground font-nunito">{banner.message}</p>
                </div>
                <Button variant="ghost" size="sm" className="font-nunito" onClick={() => setBanner(null)}>
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="tyrent-card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg tyrent-gradient flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="text-sm font-semibold font-nunito">12%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1 font-nunito">Total Users</p>
                  <p className="text-3xl font-bold text-foreground font-montserrat">
                    {(stats?.totalUsers ?? 0).toLocaleString()}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground font-nunito">
                    <span>{stats?.totalLandlords ?? 0} Landlords</span>
                    <span>{stats?.totalTenants ?? 0} Tenants</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="tyrent-card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="text-sm font-semibold font-nunito">8%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1 font-nunito">Total Properties</p>
                  <p className="text-3xl font-bold text-foreground font-montserrat">
                    {(stats?.totalProperties ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 font-nunito">
                    {(stats?.totalUnits ?? 0).toLocaleString()} units
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="tyrent-card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="text-sm font-semibold font-nunito">{stats?.revenueGrowth ?? 0}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1 font-nunito">Platform Revenue</p>
                  <p className="text-3xl font-bold text-foreground font-montserrat">
                    {(((stats?.totalRevenue ?? 0) as number) / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 font-nunito">KES this month</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="tyrent-card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    {derived.pendingCount > 0 && (
                      <Badge className="bg-orange-500 text-white border-0">{derived.pendingCount}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1 font-nunito">Pending Actions</p>
                  <p className="text-3xl font-bold text-foreground font-montserrat">{derived.pendingCount}</p>
                  <p className="text-xs text-muted-foreground mt-2 font-nunito">
                    {derived.activeDisputes} active disputes
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Platform Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {platformMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground font-nunito">{metric.label}</p>
                      <div
                        className={`flex items-center gap-1 ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}
                      >
                        {metric.trend === "up" ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        <span className="text-xs font-semibold font-nunito">{metric.change}</span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground font-montserrat">{metric.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="users" className="font-nunito">
                Users
              </TabsTrigger>
              <TabsTrigger value="verifications" className="font-nunito">
                Verifications
              </TabsTrigger>
              <TabsTrigger value="disputes" className="font-nunito">
                Disputes
              </TabsTrigger>
              <TabsTrigger value="analytics" className="font-nunito">
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-foreground font-montserrat">Recent Users</h3>
                    <Button variant="outline" size="sm" className="font-nunito bg-transparent">
                      View All
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {recentUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                          <div className="w-12 h-12 rounded-full tyrent-gradient flex items-center justify-center text-white font-bold font-montserrat">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-foreground font-montserrat">{user.name}</p>
                              {user.verified && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              <Badge variant="outline">{user.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground font-nunito mb-1">{user.email}</p>
                            <p className="text-xs text-muted-foreground font-nunito">Joined: {user.joinedDate}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-nunito bg-transparent"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {user.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 font-nunito bg-transparent"
                              onClick={() => approveUser(user.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 font-nunito bg-transparent"
                            onClick={() => suspendUser(user.id)}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Verifications Tab */}
            <TabsContent value="verifications" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-foreground font-montserrat">Pending Verifications</h3>
                    <Badge className="bg-orange-500 text-white border-0">{pendingVerifications.length} Pending</Badge>
                  </div>

                  <div className="space-y-4">
                    {pendingVerifications.map((verification) => (
                      <div
                        key={verification.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex-1 mb-4 md:mb-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-foreground font-montserrat">{verification.landlord}</h4>
                            <Badge
                              variant="outline"
                              className={
                                verification.status === "under-review"
                                  ? "text-blue-600 border-blue-600"
                                  : "text-orange-600 border-orange-600"
                              }
                            >
                              {verification.status === "under-review" ? (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Under Review
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-nunito mb-2">{verification.property}</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {verification.documents.map((doc) => (
                              <Badge key={doc} variant="outline" className="font-nunito">
                                <FileText className="h-3 w-3 mr-1" />
                                {doc}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground font-nunito">
                            Submitted: {verification.submittedDate}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-nunito bg-transparent"
                            onClick={() => {
                              setSelectedVerification(verification)
                              setVerifyNotes(verification.notes ?? "")
                              setRejectReason("")
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Button
                            size="sm"
                            className="tyrent-gradient text-white font-nunito"
                            onClick={() => approveVerification(verification.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 font-nunito bg-transparent"
                            onClick={() => rejectVerification(verification.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Disputes Tab */}
            <TabsContent value="disputes" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-foreground font-montserrat">Active Disputes</h3>
                    <Badge className="bg-red-500 text-white border-0">{disputes.length} Active</Badge>
                  </div>

                  <div className="space-y-4">
                    {disputes.map((dispute) => (
                      <div
                        key={dispute.id}
                        className="flex flex-col md:flex-row md:items-start justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex-1 mb-4 md:mb-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-foreground font-montserrat">{dispute.issue}</h4>
                            <Badge
                              variant="outline"
                              className={
                                dispute.priority === "high"
                                  ? "text-red-600 border-red-600"
                                  : "text-orange-600 border-orange-600"
                              }
                            >
                              {dispute.priority} priority
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                dispute.status === "investigating"
                                  ? "text-blue-600 border-blue-600"
                                  : "text-orange-600 border-orange-600"
                              }
                            >
                              {dispute.status}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground font-nunito mb-2">
                            <p>Tenant: {dispute.tenant}</p>
                            <p>Landlord: {dispute.landlord}</p>
                            <p>Property: {dispute.property}</p>
                          </div>
                          <p className="text-xs text-muted-foreground font-nunito">
                            Submitted: {dispute.submittedDate}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-nunito bg-transparent"
                            onClick={() => investigateDispute(dispute.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Investigate
                          </Button>
                          <Button
                            size="sm"
                            className="tyrent-gradient text-white font-nunito"
                            onClick={() => {
                              setSelectedDispute(dispute)
                              setResolutionText("")
                            }}
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-6 font-montserrat">Revenue Growth</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                      {[45, 52, 48, 65, 58, 72, 68, 85, 78, 92, 88, 95].map((height, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <div
                            className="w-full tyrent-gradient rounded-t-lg transition-all hover:opacity-80"
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-xs text-muted-foreground font-nunito">
                            {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][index]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-6 font-montserrat">User Growth</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground font-nunito">Landlords</span>
                          <span className="text-sm font-semibold font-nunito">{stats?.totalLandlords ?? 0}</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full tyrent-gradient"
                            style={{
                              width: `${((stats?.totalLandlords ?? 0) / Math.max(1, stats?.totalUsers ?? 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground font-nunito">Tenants</span>
                          <span className="text-sm font-semibold font-nunito">{stats?.totalTenants ?? 0}</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width: `${((stats?.totalTenants ?? 0) / Math.max(1, stats?.totalUsers ?? 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-2 font-nunito">Occupancy Rate</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-bold text-foreground font-montserrat">
                            {stats?.occupancyRate ?? 0}%
                          </p>
                          <div className="flex items-center gap-1 text-green-600 mb-2">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm font-semibold font-nunito">+3.2%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* User View Modal */}
          {selectedUser && (
            <>
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setSelectedUser(null)} />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground font-montserrat">{selectedUser.name}</h3>
                        <p className="text-sm text-muted-foreground font-nunito">{selectedUser.email}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="font-nunito" onClick={() => setSelectedUser(null)}>
                        Close
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">{selectedUser.type}</Badge>
                      <Badge variant="outline">Status: {selectedUser.status}</Badge>
                      {selectedUser.verified && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {(verificationMeta[selectedUser.id]?.nationalId || verificationMeta[selectedUser.id]?.phone) && (
                      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {verificationMeta[selectedUser.id]?.nationalId && (
                          <div className="rounded-lg border border-border p-3">
                            <p className="text-xs text-muted-foreground font-nunito">National ID</p>
                            <p className="text-sm font-medium font-nunito">
                              {verificationMeta[selectedUser.id]?.nationalId}
                            </p>
                          </div>
                        )}
                        {verificationMeta[selectedUser.id]?.phone && (
                          <div className="rounded-lg border border-border p-3">
                            <p className="text-xs text-muted-foreground font-nunito">Phone Number</p>
                            <p className="text-sm font-medium font-nunito">
                              {verificationMeta[selectedUser.id]?.phone}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {(verificationMeta[selectedUser.id]?.documents ?? []).map((doc) => (
                        <Button
                          key={`${doc.label}-${doc.url}`}
                          variant="outline"
                          size="sm"
                          className="font-nunito bg-transparent"
                          asChild
                        >
                          <a href={absolutizeUrl(doc.url)} target="_blank" rel="noreferrer">
                            <FileText className="h-4 w-4 mr-1" />
                            {doc.label}
                          </a>
                        </Button>
                      ))}
                      {(verificationMeta[selectedUser.id]?.documents ?? []).length === 0 && (
                        <p className="text-xs text-muted-foreground font-nunito">No document links available.</p>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground font-nunito">Joined: {selectedUser.joinedDate}</p>

                    <div className="mt-6 flex items-center justify-end gap-2">
                      {selectedUser.status === "pending" && (
                        <Button
                          variant="outline"
                          className="text-green-600 border-green-600 font-nunito bg-transparent"
                          onClick={() => {
                            approveUser(selectedUser.id)
                            setSelectedUser(null)
                          }}
                        >
                          Approve
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-600 font-nunito bg-transparent"
                        onClick={() => {
                          suspendUser(selectedUser.id)
                          setSelectedUser(null)
                        }}
                      >
                        Suspend
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Verification Review Modal */}
          {selectedVerification && (
            <>
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={() => setSelectedVerification(null)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground font-montserrat">Review Verification</h3>
                        <p className="text-sm text-muted-foreground font-nunito">
                          {selectedVerification.landlord} • {selectedVerification.property}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-nunito"
                        onClick={() => setSelectedVerification(null)}
                      >
                        Close
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">Status: {selectedVerification.status}</Badge>
                      <Badge variant="outline">Submitted: {selectedVerification.submittedDate}</Badge>
                    </div>

                    {(verificationMeta[selectedVerification.id]?.nationalId ||
                      verificationMeta[selectedVerification.id]?.phone) && (
                      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {verificationMeta[selectedVerification.id]?.nationalId && (
                          <div className="rounded-lg border border-border p-3">
                            <p className="text-xs text-muted-foreground font-nunito">National ID</p>
                            <p className="text-sm font-medium font-nunito">
                              {verificationMeta[selectedVerification.id]?.nationalId}
                            </p>
                          </div>
                        )}
                        {verificationMeta[selectedVerification.id]?.phone && (
                          <div className="rounded-lg border border-border p-3">
                            <p className="text-xs text-muted-foreground font-nunito">Phone Number</p>
                            <p className="text-sm font-medium font-nunito">
                              {verificationMeta[selectedVerification.id]?.phone}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedVerification.documents.map((doc) => (
                        <Badge key={doc} variant="outline" className="font-nunito">
                          <FileText className="h-3 w-3 mr-1" />
                          {doc}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {(verificationMeta[selectedVerification.id]?.documents ?? []).map((doc) => (
                        <Button key={`${doc.label}-${doc.url}`} variant="outline" size="sm" className="font-nunito bg-transparent" asChild>
                          <a href={absolutizeUrl(doc.url)} target="_blank" rel="noreferrer">
                            <FileText className="h-4 w-4 mr-1" />
                            {doc.label}
                          </a>
                        </Button>
                      ))}
                      {(verificationMeta[selectedVerification.id]?.documents ?? []).length === 0 && (
                        <p className="text-xs text-muted-foreground font-nunito">No uploaded document links available yet.</p>
                      )}
                    </div>

                    {(verificationMeta[selectedVerification.id]?.documents ?? []).some((d) => isLikelyImageUrl(d.url)) && (
                      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(verificationMeta[selectedVerification.id]?.documents ?? [])
                          .filter((d) => isLikelyImageUrl(d.url))
                          .slice(0, 4)
                          .map((d) => (
                            <a
                              key={`preview-${d.label}-${d.url}`}
                              href={absolutizeUrl(d.url)}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border border-border overflow-hidden hover:opacity-90 transition-opacity"
                            >
                              <img src={absolutizeUrl(d.url)} alt={d.label} className="w-full h-40 object-cover" />
                              <div className="p-2 text-xs text-muted-foreground font-nunito">{d.label}</div>
                            </a>
                          ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground font-montserrat">Notes</label>
                      <textarea
                        value={verifyNotes}
                        onChange={(e) => setVerifyNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito resize-none"
                        placeholder="Internal notes (optional)"
                      />
                      <label className="block text-sm font-semibold text-foreground font-montserrat mt-4">
                        Rejection reason (only if rejecting)
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito resize-none"
                        placeholder="Reason for rejection"
                      />
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        className="bg-transparent font-nunito"
                        onClick={() => markVerificationReview(selectedVerification.id)}
                      >
                        Mark Under Review
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="text-red-600 border-red-600 font-nunito bg-transparent"
                          onClick={() => rejectVerification(selectedVerification.id)}
                        >
                          Reject
                        </Button>
                        <Button className="tyrent-gradient text-white font-nunito" onClick={() => approveVerification(selectedVerification.id)}>
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Dispute Resolve Modal */}
          {selectedDispute && (
            <>
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setSelectedDispute(null)} />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground font-montserrat">Resolve Dispute</h3>
                        <p className="text-sm text-muted-foreground font-nunito">{selectedDispute.issue}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="font-nunito" onClick={() => setSelectedDispute(null)}>
                        Close
                      </Button>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground font-nunito mb-4">
                      <p>Tenant: {selectedDispute.tenant}</p>
                      <p>Landlord: {selectedDispute.landlord}</p>
                      <p>Property: {selectedDispute.property}</p>
                      <p>Submitted: {selectedDispute.submittedDate}</p>
                      <p>Status: {selectedDispute.status}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                        Resolution summary
                      </label>
                      <textarea
                        value={resolutionText}
                        onChange={(e) => setResolutionText(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito resize-none"
                        placeholder="Describe how this dispute was resolved..."
                      />
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2">
                      <Button variant="outline" className="bg-transparent font-nunito" onClick={() => setSelectedDispute(null)}>
                        Cancel
                      </Button>
                      <Button className="tyrent-gradient text-white font-nunito" onClick={() => resolveDispute(selectedDispute.id)}>
                        <Shield className="h-4 w-4 mr-2" />
                        Mark Resolved
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
