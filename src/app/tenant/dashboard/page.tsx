"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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

export default function TenantDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview")

  // Mock data
  const currentLease = {
    property: "Modern 2BR Apartment in Kilimani",
    unit: "A101",
    location: "Kilimani, Nairobi",
    landlord: {
      name: "John Kamau",
      phone: "+254 700 000 000",
      email: "john@example.com",
      verified: true,
    },
    rent: 65000,
    deposit: 130000,
    leaseStart: "2025-01-01",
    leaseEnd: "2025-12-31",
    nextPaymentDue: "2025-03-01",
    daysUntilPayment: 5,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
  }

  const paymentHistory = [
    { id: "1", date: "2025-02-01", amount: 65000, status: "paid", method: "M-Pesa", reference: "TYR-PAY-001" },
    { id: "2", date: "2025-01-01", amount: 195000, status: "paid", method: "M-Pesa", reference: "TYR-PAY-002" },
  ]

  const maintenanceRequests = [
    {
      id: "1",
      title: "Leaking kitchen faucet",
      description: "The kitchen faucet has been leaking for 2 days",
      status: "in-progress",
      priority: "medium",
      submittedDate: "2025-02-10",
      category: "Plumbing",
    },
    {
      id: "2",
      title: "Broken window lock",
      description: "Window lock in bedroom needs replacement",
      status: "pending",
      priority: "high",
      submittedDate: "2025-02-15",
      category: "Security",
    },
    {
      id: "3",
      title: "AC not cooling properly",
      description: "Air conditioning unit not working efficiently",
      status: "resolved",
      priority: "low",
      submittedDate: "2025-01-20",
      category: "HVAC",
    },
  ]

  const documents = [
    { id: "1", name: "Lease Agreement", type: "PDF", size: "2.4 MB", uploadedDate: "2025-01-01" },
    { id: "2", name: "Move-in Inspection Report", type: "PDF", size: "1.8 MB", uploadedDate: "2025-01-01" },
    { id: "3", name: "Payment Receipt - Feb 2025", type: "PDF", size: "156 KB", uploadedDate: "2025-02-01" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 font-montserrat">Tenant Dashboard</h1>
            <p className="text-muted-foreground font-nunito">Manage your rental and stay connected</p>
          </div>

          {/* Current Lease Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="tyrent-card-hover">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Property Image */}
                  <div className="lg:col-span-1">
                    <img
                      src={currentLease.image || "/placeholder.svg"}
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
                          {currentLease.daysUntilPayment} days
                        </p>
                      </div>
                    </div>

                    {/* Payment Alert */}
                    {currentLease.daysUntilPayment <= 7 && (
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
                          <Button size="sm" className="tyrent-gradient text-white font-nunito shrink-0">
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
                        <Button variant="outline" size="sm" className="font-nunito bg-transparent">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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
                      <p className="text-3xl font-bold text-foreground font-montserrat">KES 260K</p>
                      <p className="text-xs text-muted-foreground mt-2 font-nunito">Since Jan 2025</p>
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
                      <p className="text-3xl font-bold text-green-600 font-montserrat">On Time</p>
                      <p className="text-xs text-muted-foreground mt-2 font-nunito">100% payment record</p>
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
                      <p className="text-3xl font-bold text-foreground font-montserrat">2</p>
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
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2 font-nunito bg-transparent">
                      <CreditCard className="h-6 w-6 text-primary" />
                      <span>Pay Rent</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2 font-nunito bg-transparent">
                      <Wrench className="h-6 w-6 text-primary" />
                      <span>Request Maintenance</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2 font-nunito bg-transparent">
                      <MessageSquare className="h-6 w-6 text-primary" />
                      <span>Message Landlord</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex-col gap-2 font-nunito bg-transparent">
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
                    <Button variant="outline" size="sm" className="font-nunito bg-transparent">
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
                        <Button variant="outline" size="sm" className="font-nunito bg-transparent">
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
                <Button className="tyrent-gradient text-white font-nunito">
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
                        <Button variant="outline" size="sm" className="font-nunito bg-transparent">
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
                        <Button variant="outline" size="sm" className="font-nunito bg-transparent">
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
        </div>
      </div>
    </div>
  )
}
