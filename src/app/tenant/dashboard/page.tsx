"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  FileText,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  Download,
  CreditCard,
  Wrench,
} from "lucide-react"
import { PageRoutes } from "@/constants/page-routes"
import {
  addTenantMaintenanceRequest,
  addTenantMessage,
  addTenantPayment,
  generateId,
  getTenantDocuments,
  getTenantLease,
  getTenantMaintenanceRequests,
  getTenantPayments,
  seedTenantDemoDataIfEmpty,
  type MaintenancePriority,
  type TenantDocument,
  type TenantLease,
  type TenantMaintenanceRequest,
  type TenantPayment,
} from "@/lib/tenant-storage"
import { requireAuth } from "@/lib/route-guards"

function daysUntil(dateIso: string) {
  const target = new Date(dateIso)
  const today = new Date()
  target.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function TenantDashboard() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("overview")
  const [banner, setBanner] = useState<{ title: string; message: string } | null>(null)

  const [lease, setLease] = useState<TenantLease | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<TenantPayment[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<TenantMaintenanceRequest[]>([])
  const [documents, setDocuments] = useState<TenantDocument[]>([])

  const [payOpen, setPayOpen] = useState(false)
  const [payAmount, setPayAmount] = useState<number>(0)
  const [payMethod, setPayMethod] = useState<"M-Pesa" | "Card" | "Bank">("M-Pesa")
  const [payNote, setPayNote] = useState("")

  const [maintenanceOpen, setMaintenanceOpen] = useState(false)
  const [maintenanceTitle, setMaintenanceTitle] = useState("")
  const [maintenanceCategory, setMaintenanceCategory] = useState("General")
  const [maintenancePriority, setMaintenancePriority] = useState<MaintenancePriority>("medium")
  const [maintenanceDescription, setMaintenanceDescription] = useState("")

  const [messageOpen, setMessageOpen] = useState(false)
  const [messageSubject, setMessageSubject] = useState("")
  const [messageBody, setMessageBody] = useState("")

  const [detailsRequest, setDetailsRequest] = useState<TenantMaintenanceRequest | null>(null)

  useEffect(() => {
    const auth = requireAuth({ role: "tenant" })
    if (!auth.ok) {
      router.replace(auth.redirectTo)
      return
    }
    seedTenantDemoDataIfEmpty()
    setLease(getTenantLease())
    setPaymentHistory(getTenantPayments())
    setMaintenanceRequests(getTenantMaintenanceRequests())
    setDocuments(getTenantDocuments())
  }, [])

  const currentLease = lease

  const daysUntilPayment = useMemo(() => {
    if (!currentLease?.nextPaymentDue) return null
    return daysUntil(currentLease.nextPaymentDue)
  }, [currentLease?.nextPaymentDue])

  const totalPaid = useMemo(() => {
    return paymentHistory.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)
  }, [paymentHistory])

  const activeMaintenanceCount = useMemo(() => {
    return maintenanceRequests.filter((r) => r.status !== "resolved").length
  }, [maintenanceRequests])

  const paymentStatusLabel = useMemo(() => {
    if (!daysUntilPayment) return "N/A"
    if (daysUntilPayment < 0) return "Overdue"
    if (daysUntilPayment <= 7) return "Due Soon"
    return "On Time"
  }, [daysUntilPayment])

  const paymentStatusColor = useMemo(() => {
    if (!daysUntilPayment) return "text-muted-foreground"
    if (daysUntilPayment < 0) return "text-red-600"
    if (daysUntilPayment <= 7) return "text-orange-600"
    return "text-green-600"
  }, [daysUntilPayment])

  const openPay = (amount?: number) => {
    if (!currentLease) return
    setPayAmount(typeof amount === "number" ? amount : currentLease.rent)
    setPayMethod("M-Pesa")
    setPayNote("")
    setPayOpen(true)
  }

  const submitPayment = () => {
    if (!currentLease) return
    if (!payAmount || payAmount <= 0) {
      setBanner({ title: "Payment amount required", message: "Please enter a valid amount." })
      return
    }

    const payment: TenantPayment = {
      id: generateId("payment"),
      date: new Date().toISOString().slice(0, 10),
      amount: payAmount,
      status: "paid",
      method: payMethod,
      reference: `TYR-PAY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      note: payNote.trim() || undefined,
    }
    setPaymentHistory(addTenantPayment(payment))
    setPayOpen(false)
    setBanner({ title: "Payment recorded", message: `Recorded KES ${payAmount.toLocaleString()} via ${payMethod}.` })
  }

  const submitMaintenance = () => {
    if (!maintenanceTitle.trim() || !maintenanceDescription.trim()) {
      setBanner({ title: "Missing details", message: "Please add a title and description for your request." })
      return
    }
    const req: TenantMaintenanceRequest = {
      id: generateId("maintenance"),
      title: maintenanceTitle.trim(),
      description: maintenanceDescription.trim(),
      status: "pending",
      priority: maintenancePriority,
      submittedDate: new Date().toISOString().slice(0, 10),
      category: maintenanceCategory.trim() || "General",
    }
    setMaintenanceRequests(addTenantMaintenanceRequest(req))
    setMaintenanceOpen(false)
    setMaintenanceTitle("")
    setMaintenanceCategory("General")
    setMaintenancePriority("medium")
    setMaintenanceDescription("")
    setSelectedTab("maintenance")
    setBanner({ title: "Request submitted", message: "Your maintenance request has been sent to the landlord." })
  }

  const submitMessage = () => {
    if (!messageSubject.trim() || !messageBody.trim()) {
      setBanner({ title: "Message incomplete", message: "Please add a subject and message body." })
      return
    }
    addTenantMessage({
      id: generateId("message"),
      createdAt: new Date().toISOString(),
      to: "landlord",
      subject: messageSubject.trim(),
      body: messageBody.trim(),
    })
    setMessageOpen(false)
    setMessageSubject("")
    setMessageBody("")
    setBanner({ title: "Message saved", message: "Your message was saved. You can also email your landlord directly." })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 font-montserrat">Tenant Dashboard</h1>
            <p className="text-muted-foreground font-nunito">Manage your rental and stay connected</p>
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

          {/* Current Lease Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="tyrent-card-hover">
              <CardContent className="p-0">
                {!currentLease ? (
                  <div className="p-6">
                    <p className="text-muted-foreground font-nunito">
                      No active lease found yet. Book a property to see your lease details here.
                    </p>
                    <Button asChild className="mt-4 tyrent-gradient text-white font-nunito">
                      <Link href={PageRoutes.PROPERTIES}>Browse Properties</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Property Image */}
                  <div className="lg:col-span-1">
                    <img
                      src={currentLease.imageUrl || "/placeholder.svg"}
                      alt={currentLease.property}
                      className="w-full h-full object-cover rounded-l-lg"
                    />
                  </div>

                  {/* Lease Details */}
                  <div className="lg:col-span-2 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-2 font-montserrat">
                          {currentLease.property}
                        </h2>
                        <div className="flex items-center gap-2 text-muted-foreground mb-2 font-nunito">
                          <MapPin className="h-4 w-4" />
                          <span>{currentLease.location}</span>
                          <Badge variant="outline">Unit {currentLease.unit}</Badge>
                        </div>
                      </div>
                      <Badge className="tyrent-gradient text-white border-0">Active Lease</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1 font-nunito">Monthly Rent</p>
                        <p className="text-lg font-bold text-foreground font-montserrat">
                          KES {currentLease.rent.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1 font-nunito">Lease Period</p>
                        <p className="text-lg font-bold text-foreground font-montserrat">12 Months</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1 font-nunito">Lease Ends</p>
                        <p className="text-lg font-bold text-foreground font-montserrat">{currentLease.leaseEnd}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1 font-nunito">Next Payment</p>
                        <p className="text-lg font-bold text-orange-600 font-montserrat">
                          {daysUntilPayment ?? "--"} days
                        </p>
                      </div>
                    </div>

                    {/* Payment Alert */}
                    {(daysUntilPayment ?? 999) <= 7 && (
                      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-orange-900 dark:text-orange-100 font-montserrat">
                              Payment Due Soon
                            </p>
                            <p className="text-sm text-orange-800 dark:text-orange-200 font-nunito">
                              Your rent payment of KES {currentLease.rent.toLocaleString()} is due on{" "}
                              {currentLease.nextPaymentDue}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="tyrent-gradient text-white font-nunito shrink-0"
                            onClick={() => openPay()}
                          >
                            Pay Now
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Landlord Contact */}
                    <div className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm font-semibold text-foreground font-montserrat">Your Landlord</p>
                            {currentLease.landlord.verified && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-foreground font-nunito mb-1">{currentLease.landlord.name}</p>
                          <div className="flex flex-col gap-1 text-sm text-muted-foreground font-nunito">
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {currentLease.landlord.phone}
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {currentLease.landlord.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-nunito bg-transparent"
                            onClick={() => {
                              setMessageSubject(`Regarding Unit ${currentLease.unit}`)
                              setMessageBody("")
                              setMessageOpen(true)
                            }}
                          >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                          </Button>
                          <Button asChild variant="outline" size="sm" className="font-nunito bg-transparent">
                            <a href={`mailto:${currentLease.landlord.email}`}>Email</a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="overview" className="font-nunito">
                Overview
              </TabsTrigger>
              <TabsTrigger value="payments" className="font-nunito">
                Payments
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="font-nunito">
                Maintenance
              </TabsTrigger>
              <TabsTrigger value="documents" className="font-nunito">
                Documents
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Card className="tyrent-card-hover">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg tyrent-gradient flex items-center justify-center mb-4">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1 font-nunito">Total Paid</p>
                      <p className="text-3xl font-bold text-foreground font-montserrat">
                        KES {(totalPaid / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 font-nunito">
                        {paymentHistory.length} payments recorded
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className="tyrent-card-hover">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1 font-nunito">Payment Status</p>
                      <p className={`text-3xl font-bold font-montserrat ${paymentStatusColor}`}>{paymentStatusLabel}</p>
                      <p className="text-xs text-muted-foreground mt-2 font-nunito">
                        Next due: {currentLease?.nextPaymentDue ?? "--"}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Card className="tyrent-card-hover">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center mb-4">
                        <Wrench className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1 font-nunito">Maintenance</p>
                      <p className="text-3xl font-bold text-foreground font-montserrat">{activeMaintenanceCount}</p>
                      <p className="text-xs text-muted-foreground mt-2 font-nunito">Active requests</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4 font-montserrat">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2 font-nunito bg-transparent"
                      onClick={() => openPay()}
                      disabled={!currentLease}
                    >
                      <CreditCard className="h-6 w-6 text-primary" />
                      <span>Pay Rent</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2 font-nunito bg-transparent"
                      onClick={() => {
                        setMaintenanceOpen(true)
                        setMaintenanceTitle("")
                        setMaintenanceDescription("")
                        setMaintenanceCategory("General")
                        setMaintenancePriority("medium")
                      }}
                      disabled={!currentLease}
                    >
                      <Wrench className="h-6 w-6 text-primary" />
                      <span>Request Maintenance</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2 font-nunito bg-transparent"
                      onClick={() => {
                        if (!currentLease) return
                        setMessageSubject(`Regarding Unit ${currentLease.unit}`)
                        setMessageBody("")
                        setMessageOpen(true)
                      }}
                      disabled={!currentLease}
                    >
                      <MessageSquare className="h-6 w-6 text-primary" />
                      <span>Message Landlord</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2 font-nunito bg-transparent"
                      onClick={() => setSelectedTab("documents")}
                    >
                      <FileText className="h-6 w-6 text-primary" />
                      <span>View Documents</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-foreground font-montserrat">Payment History</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-nunito bg-transparent"
                      onClick={() => {
                        const rows = paymentHistory
                          .map((p) => `${p.date}\tKES ${p.amount}\t${p.method}\t${p.reference}\t${p.status}`)
                          .join("\n")
                        downloadText("payment_history.tsv", `Date\tAmount\tMethod\tReference\tStatus\n${rows}\n`)
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {paymentHistory.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-start gap-4 mb-4 md:mb-0">
                          <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-950/20 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-foreground font-montserrat">
                                KES {payment.amount.toLocaleString()}
                              </p>
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Paid
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground font-nunito mb-1">
                              Payment Date: {payment.date}
                            </p>
                            <div className="flex gap-4 text-xs text-muted-foreground font-nunito">
                              <span>Method: {payment.method}</span>
                              <span>Ref: {payment.reference}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-nunito bg-transparent"
                          onClick={() => {
                            downloadText(
                              `payment_${payment.reference}.txt`,
                              `Tyrent Payment Receipt\n\nAmount: KES ${payment.amount.toLocaleString()}\nDate: ${
                                payment.date
                              }\nMethod: ${payment.method}\nReference: ${payment.reference}\nStatus: ${payment.status}\n`,
                            )
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Receipt
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Maintenance Tab */}
            <TabsContent value="maintenance" className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground font-montserrat">Maintenance Requests</h3>
                  <p className="text-sm text-muted-foreground font-nunito">
                    Track and manage your maintenance requests
                  </p>
                </div>
                <Button
                  className="tyrent-gradient text-white font-nunito"
                  onClick={() => {
                    setMaintenanceOpen(true)
                    setMaintenanceTitle("")
                    setMaintenanceDescription("")
                    setMaintenanceCategory("General")
                    setMaintenancePriority("medium")
                  }}
                  disabled={!currentLease}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </div>

              <div className="space-y-4">
                {maintenanceRequests.map((request) => (
                  <Card key={request.id} className="tyrent-card-hover">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-foreground font-montserrat">{request.title}</h4>
                            <Badge
                              variant="outline"
                              className={
                                request.status === "resolved"
                                  ? "text-green-600 border-green-600"
                                  : request.status === "in-progress"
                                    ? "text-blue-600 border-blue-600"
                                    : "text-orange-600 border-orange-600"
                              }
                            >
                              {request.status === "resolved" ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Resolved
                                </>
                              ) : request.status === "in-progress" ? (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  In Progress
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </>
                              )}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                request.priority === "high"
                                  ? "text-red-600 border-red-600"
                                  : request.priority === "medium"
                                    ? "text-orange-600 border-orange-600"
                                    : "text-gray-600 border-gray-600"
                              }
                            >
                              {request.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 font-nunito">{request.description}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground font-nunito">
                            <span>Category: {request.category}</span>
                            <span>Submitted: {request.submittedDate}</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-nunito bg-transparent"
                          onClick={() => setDetailsRequest(request)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-6 font-montserrat">Your Documents</h3>

                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg tyrent-gradient flex items-center justify-center shrink-0">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground font-montserrat">{doc.name}</p>
                            <div className="flex gap-4 text-sm text-muted-foreground font-nunito">
                              <span>{doc.type}</span>
                              <span>{doc.size}</span>
                              <span>Uploaded: {doc.uploadedDate}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-nunito bg-transparent"
                          onClick={() => {
                            downloadText(
                              `${doc.name.replaceAll(" ", "_")}.txt`,
                              doc.content || `${doc.name}\n\nDemo document placeholder.`,
                            )
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Pay Rent Modal */}
          {payOpen && currentLease && (
            <>
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setPayOpen(false)} />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground font-montserrat">Pay Rent</h3>
                        <p className="text-sm text-muted-foreground font-nunito">
                          {currentLease.property} • Unit {currentLease.unit}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="font-nunito" onClick={() => setPayOpen(false)}>
                        Close
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                          Amount (KES)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={payAmount}
                          onChange={(e) => setPayAmount(Number.parseInt(e.target.value || "0"))}
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">Method</label>
                        <select
                          value={payMethod}
                          onChange={(e) => setPayMethod(e.target.value as "M-Pesa" | "Card" | "Bank")}
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                        >
                          <option value="M-Pesa">M-Pesa</option>
                          <option value="Card">Card</option>
                          <option value="Bank">Bank</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                          Note (optional)
                        </label>
                        <textarea
                          value={payNote}
                          onChange={(e) => setPayNote(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito resize-none"
                          placeholder="e.g., Paying early this month"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-2">
                      <Button variant="outline" className="bg-transparent font-nunito" onClick={() => setPayOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="tyrent-gradient text-white font-nunito" onClick={submitPayment}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Confirm Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* New Maintenance Modal */}
          {maintenanceOpen && currentLease && (
            <>
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={() => setMaintenanceOpen(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground font-montserrat">New Maintenance Request</h3>
                        <p className="text-sm text-muted-foreground font-nunito">
                          {currentLease.property} • Unit {currentLease.unit}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="font-nunito" onClick={() => setMaintenanceOpen(false)}>
                        Close
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">Title</label>
                        <input
                          type="text"
                          value={maintenanceTitle}
                          onChange={(e) => setMaintenanceTitle(e.target.value)}
                          placeholder="e.g., Leaking faucet"
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                            Category
                          </label>
                          <input
                            type="text"
                            value={maintenanceCategory}
                            onChange={(e) => setMaintenanceCategory(e.target.value)}
                            placeholder="e.g., Plumbing"
                            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                            Priority
                          </label>
                          <select
                            value={maintenancePriority}
                            onChange={(e) => setMaintenancePriority(e.target.value as MaintenancePriority)}
                            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                          Description
                        </label>
                        <textarea
                          value={maintenanceDescription}
                          onChange={(e) => setMaintenanceDescription(e.target.value)}
                          rows={4}
                          placeholder="Describe the issue, when it started, and any extra details."
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito resize-none"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        className="bg-transparent font-nunito"
                        onClick={() => setMaintenanceOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button className="tyrent-gradient text-white font-nunito" onClick={submitMaintenance}>
                        <Wrench className="h-4 w-4 mr-2" />
                        Submit Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Message Landlord Modal */}
          {messageOpen && currentLease && (
            <>
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setMessageOpen(false)} />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground font-montserrat">Message Landlord</h3>
                        <p className="text-sm text-muted-foreground font-nunito">
                          To {currentLease.landlord.name} • {currentLease.landlord.email}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="font-nunito" onClick={() => setMessageOpen(false)}>
                        Close
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">Subject</label>
                        <input
                          type="text"
                          value={messageSubject}
                          onChange={(e) => setMessageSubject(e.target.value)}
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">Message</label>
                        <textarea
                          value={messageBody}
                          onChange={(e) => setMessageBody(e.target.value)}
                          rows={5}
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito resize-none"
                          placeholder="Write your message..."
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-2">
                      <Button variant="outline" className="bg-transparent font-nunito" onClick={() => setMessageOpen(false)}>
                        Cancel
                      </Button>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" className="bg-transparent font-nunito">
                          <a
                            href={`mailto:${currentLease.landlord.email}?subject=${encodeURIComponent(
                              messageSubject || "Tenant Message",
                            )}&body=${encodeURIComponent(messageBody)}`}
                          >
                            Open Email
                          </a>
                        </Button>
                        <Button className="tyrent-gradient text-white font-nunito" onClick={submitMessage}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Save Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Maintenance Details Modal */}
          {detailsRequest && (
            <>
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setDetailsRequest(null)} />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground font-montserrat">{detailsRequest.title}</h3>
                        <p className="text-sm text-muted-foreground font-nunito">
                          {detailsRequest.category} • Submitted {detailsRequest.submittedDate}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="font-nunito" onClick={() => setDetailsRequest(null)}>
                        Close
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-nunito">
                          Status: {detailsRequest.status}
                        </Badge>
                        <Badge variant="outline" className="font-nunito">
                          Priority: {detailsRequest.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-nunito whitespace-pre-wrap">
                        {detailsRequest.description}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-end">
                      <Button variant="outline" className="bg-transparent font-nunito" onClick={() => setDetailsRequest(null)}>
                        Done
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
