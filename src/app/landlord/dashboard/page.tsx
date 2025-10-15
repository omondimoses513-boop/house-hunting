"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  Home,
  DollarSign,
  Calendar,
  Plus,
  Eye,
  Edit,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  MapPin,
} from "lucide-react"

export default function LandlordDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  // Mock data
  const stats = {
    totalProperties: 5,
    totalUnits: 24,
    occupiedUnits: 18,
    vacantUnits: 6,
    monthlyRevenue: 1170000,
    revenueChange: 12.5,
    pendingBookings: 3,
    activeLeases: 18,
  }

  const properties = [
    {
      id: "1",
      name: "Sunrise Apartments",
      location: "Kilimani, Nairobi",
      totalUnits: 12,
      occupiedUnits: 10,
      vacantUnits: 2,
      monthlyRevenue: 650000,
      image: "/modern-apartment-living-room.png",
    },
    {
      id: "2",
      name: "Westlands Heights",
      location: "Westlands, Nairobi",
      totalUnits: 8,
      occupiedUnits: 6,
      vacantUnits: 2,
      monthlyRevenue: 480000,
      image: "/luxury-penthouse-living-room.png",
    },
    {
      id: "3",
      name: "Garden View Estate",
      location: "Lavington, Nairobi",
      totalUnits: 4,
      occupiedUnits: 2,
      vacantUnits: 2,
      monthlyRevenue: 220000,
      image: "/spacious-one-bedroom-apartment.jpg",
    },
  ]

  const bookings = [
    {
      id: "1",
      tenant: "Jane Wanjiru",
      property: "Sunrise Apartments",
      unit: "A101",
      moveInDate: "2025-03-01",
      amount: 200000,
      status: "pending",
      submittedDate: "2025-02-15",
    },
    {
      id: "2",
      tenant: "Peter Omondi",
      property: "Westlands Heights",
      unit: "B205",
      moveInDate: "2025-03-15",
      amount: 180000,
      status: "pending",
      submittedDate: "2025-02-16",
    },
    {
      id: "3",
      tenant: "Mary Njeri",
      property: "Garden View Estate",
      unit: "C102",
      moveInDate: "2025-02-28",
      amount: 165000,
      status: "approved",
      submittedDate: "2025-02-10",
    },
  ]

  const recentActivity = [
    { type: "booking", message: "New booking request from Jane Wanjiru", time: "2 hours ago" },
    { type: "payment", message: "Payment received for Unit A205 - KES 65,000", time: "5 hours ago" },
    { type: "vacancy", message: "Unit B103 marked as vacant", time: "1 day ago" },
    { type: "lease", message: "Lease renewed for Unit C301", time: "2 days ago" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 font-montserrat">Landlord Dashboard</h1>
              <p className="text-muted-foreground font-nunito">Manage your properties and track performance</p>
            </div>
            <Button className="mt-4 md:mt-0 tyrent-gradient text-white font-nunito">
              <Plus className="h-4 w-4 mr-2" />
              Add New Property
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="tyrent-card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg tyrent-gradient flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1 font-nunito">Total Properties</p>
                  <p className="text-3xl font-bold text-foreground font-montserrat">{stats.totalProperties}</p>
                  <p className="text-xs text-muted-foreground mt-2 font-nunito">{stats.totalUnits} total units</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="tyrent-card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                      <Home className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-green-600 font-nunito">
                      {((stats.occupiedUnits / stats.totalUnits) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1 font-nunito">Occupancy Rate</p>
                  <p className="text-3xl font-bold text-foreground font-montserrat">{stats.occupiedUnits}</p>
                  <p className="text-xs text-muted-foreground mt-2 font-nunito">{stats.vacantUnits} units vacant</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="tyrent-card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="text-sm font-semibold font-nunito">{stats.revenueChange}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1 font-nunito">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-foreground font-montserrat">
                    {(stats.monthlyRevenue / 1000).toFixed(0)}K
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
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    {stats.pendingBookings > 0 && (
                      <Badge className="bg-orange-500 text-white border-0">{stats.pendingBookings}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1 font-nunito">Pending Bookings</p>
                  <p className="text-3xl font-bold text-foreground font-montserrat">{stats.pendingBookings}</p>
                  <p className="text-xs text-muted-foreground mt-2 font-nunito">Require your attention</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="properties" className="space-y-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="properties" className="font-nunito">
                Properties
              </TabsTrigger>
              <TabsTrigger value="bookings" className="font-nunito">
                Bookings
              </TabsTrigger>
              <TabsTrigger value="analytics" className="font-nunito">
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Properties Tab */}
            <TabsContent value="properties" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {properties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="tyrent-card-hover">
                      <CardContent className="p-0">
                        <div className="relative">
                          <img
                            src={property.image || "/placeholder.svg"}
                            alt={property.name}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          <Badge className="absolute top-3 right-3 tyrent-gradient text-white border-0">
                            {property.totalUnits} Units
                          </Badge>
                        </div>

                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-foreground mb-1 font-montserrat">
                                {property.name}
                              </h3>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground font-nunito">
                                <MapPin className="h-4 w-4" />
                                {property.location}
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="shrink-0">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <p className="text-2xl font-bold text-foreground font-montserrat">
                                {property.totalUnits}
                              </p>
                              <p className="text-xs text-muted-foreground font-nunito">Total</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                              <p className="text-2xl font-bold text-green-600 font-montserrat">
                                {property.occupiedUnits}
                              </p>
                              <p className="text-xs text-green-600 font-nunito">Occupied</p>
                            </div>
                            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                              <p className="text-2xl font-bold text-orange-600 font-montserrat">
                                {property.vacantUnits}
                              </p>
                              <p className="text-xs text-orange-600 font-nunito">Vacant</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-border">
                            <div>
                              <p className="text-sm text-muted-foreground font-nunito">Monthly Revenue</p>
                              <p className="text-xl font-bold text-foreground font-montserrat">
                                KES {(property.monthlyRevenue / 1000).toFixed(0)}K
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="font-nunito bg-transparent">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm" className="font-nunito bg-transparent">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4 font-montserrat">Recent Booking Requests</h3>

                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 mb-4 md:mb-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-foreground font-montserrat">{booking.tenant}</h4>
                            <Badge
                              variant={booking.status === "pending" ? "outline" : "default"}
                              className={
                                booking.status === "pending"
                                  ? "text-orange-600 border-orange-600"
                                  : "bg-green-500 text-white border-0"
                              }
                            >
                              {booking.status === "pending" ? (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Approved
                                </>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-nunito mb-1">
                            {booking.property} - Unit {booking.unit}
                          </p>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-nunito">
                            <span>Move-in: {booking.moveInDate}</span>
                            <span>Amount: KES {booking.amount.toLocaleString()}</span>
                            <span>Submitted: {booking.submittedDate}</span>
                          </div>
                        </div>

                        {booking.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" className="tyrent-gradient text-white font-nunito">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 font-nunito bg-transparent"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        )}
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
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-foreground font-montserrat">Revenue Trend</h3>
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-3 py-2 border border-input rounded-lg bg-background text-sm font-nunito"
                      >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-nunito">Total Revenue</span>
                        <span className="text-2xl font-bold text-foreground font-montserrat">
                          KES {(stats.monthlyRevenue / 1000).toFixed(0)}K
                        </span>
                      </div>

                      <div className="h-48 flex items-end justify-between gap-2">
                        {[65, 72, 68, 85, 78, 92, 88].map((height, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div
                              className="w-full tyrent-gradient rounded-t-lg transition-all hover:opacity-80"
                              style={{ height: `${height}%` }}
                            />
                            <span className="text-xs text-muted-foreground font-nunito">
                              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-6 font-montserrat">Recent Activity</h3>

                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              activity.type === "booking"
                                ? "bg-blue-500"
                                : activity.type === "payment"
                                  ? "bg-green-500"
                                  : activity.type === "vacancy"
                                    ? "bg-orange-500"
                                    : "bg-purple-500"
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-sm text-foreground font-nunito">{activity.message}</p>
                            <p className="text-xs text-muted-foreground font-nunito">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
