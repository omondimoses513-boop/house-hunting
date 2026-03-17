"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
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
  getAdminDisputes,
  getAdminStats,
  getAdminUsers,
  getAdminVerifications,
  seedAdminDemoDataIfEmpty,
  type AdminDispute,
  type AdminStats,
  type AdminUser,
  type AdminVerification,
  updateAdminDispute,
  updateAdminUser,
  updateAdminVerification,
} from "@/lib/admin-storage"

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [banner, setBanner] = useState<{ title: string; message: string } | null>(null)

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([])
  const [pendingVerifications, setPendingVerifications] = useState<AdminVerification[]>([])
  const [disputes, setDisputes] = useState<AdminDispute[]>([])

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [selectedVerification, setSelectedVerification] = useState<AdminVerification | null>(null)
  const [selectedDispute, setSelectedDispute] = useState<AdminDispute | null>(null)

  const [verifyNotes, setVerifyNotes] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [resolutionText, setResolutionText] = useState("")

  useEffect(() => {
    seedAdminDemoDataIfEmpty()
    setStats(getAdminStats())
    setRecentUsers(getAdminUsers())
    setPendingVerifications(getAdminVerifications())
    setDisputes(getAdminDisputes())
  }, [])

  const derived = useMemo(() => {
    const pendingCount = pendingVerifications.filter((v) => v.status === "pending" || v.status === "under-review").length
    const activeDisputes = disputes.filter((d) => d.status !== "resolved").length
    return { pendingCount, activeDisputes }
  }, [pendingVerifications, disputes])

  const platformMetrics = useMemo(() => {
    const bookings = Math.max(1000, Math.round((stats?.totalUsers ?? 1200) * 1.8))
    const avgBookingValue = 185000
    const platformFeeRevenue = Math.round(((stats?.totalRevenue ?? 45600000) * 0.26) / 100000) * 100000
    return [
      { label: "Total Bookings", value: bookings.toLocaleString(), change: "+12.5%", trend: "up" as const },
      { label: "Avg. Booking Value", value: `KES ${(avgBookingValue / 1000).toFixed(0)}K`, change: "+8.2%", trend: "up" as const },
      {
        label: "Platform Fee Revenue",
        value: `KES ${(platformFeeRevenue / 1000000).toFixed(1)}M`,
        change: "+15.3%",
        trend: "up" as const,
      },
      { label: "User Satisfaction", value: "4.7/5.0", change: "+0.2", trend: "up" as const },
    ]
  }, [stats])

  const approveUser = (userId: string) => {
    setRecentUsers(updateAdminUser(userId, { status: "active", verified: true }))
    setBanner({ title: "User approved", message: "The user is now active and verified." })
  }

  const suspendUser = (userId: string) => {
    setRecentUsers(updateAdminUser(userId, { status: "suspended" }))
    setBanner({ title: "User suspended", message: "The user account has been suspended." })
  }

  const markVerificationReview = (id: string) => {
    setPendingVerifications(updateAdminVerification(id, { status: "under-review" }))
    setBanner({ title: "Marked as under review", message: "Verification is now in review state." })
  }

  const approveVerification = (id: string) => {
    setPendingVerifications(updateAdminVerification(id, { status: "approved", notes: verifyNotes.trim() || undefined }))
    setVerifyNotes("")
    setSelectedVerification(null)
    setBanner({ title: "Verification approved", message: "The landlord verification has been approved." })
  }

  const rejectVerification = (id: string) => {
    setPendingVerifications(updateAdminVerification(id, { status: "rejected", notes: rejectReason.trim() || undefined }))
    setRejectReason("")
    setSelectedVerification(null)
    setBanner({ title: "Verification rejected", message: "The landlord verification was rejected." })
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

                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedVerification.documents.map((doc) => (
                        <Badge key={doc} variant="outline" className="font-nunito">
                          <FileText className="h-3 w-3 mr-1" />
                          {doc}
                        </Badge>
                      ))}
                    </div>

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
