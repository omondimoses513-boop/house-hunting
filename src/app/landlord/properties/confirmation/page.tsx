"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageRoutes } from "@/constants/page-routes"
import { CheckCircle2, ArrowRight, Download, Building2, Calendar } from "lucide-react"

interface PropertySubscription {
  id: string
  created_at: string
  payment_status: string
  subscription_amount: string
}

export default function PropertyListingConfirmation() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyData = searchParams.get("property") ? JSON.parse(decodeURIComponent(searchParams.get("property") || "{}")) : {}
  const [subscription, setSubscription] = useState<PropertySubscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set subscription details
    setSubscription({
      id: `PROP-${Date.now()}`,
      created_at: new Date().toISOString(),
      payment_status: "COMPLETED",
      subscription_amount: "500.00",
    })
    setLoading(false)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div className="w-24 h-24 rounded-full tyrent-gradient flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-montserrat">
              Property Listed Successfully!
            </h1>
            <p className="text-lg text-muted-foreground font-nunito">
              Your property is now live and visible to tenants on the platform.
            </p>
          </motion.div>

          {/* Subscription Details Card */}
          {!loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="shadow-xl mb-6">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground font-montserrat">Subscription Details</h2>
                    <Badge className="tyrent-gradient text-white border-0">Active</Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground font-nunito">Subscription Type</p>
                        <p className="font-semibold text-foreground font-montserrat">30-Day Property Listing</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground font-nunito">Subscription Date</p>
                        <p className="font-semibold text-foreground font-montserrat">
                          {subscription ? new Date(subscription.created_at).toLocaleDateString() : "---"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground font-nunito">Subscription Fee Paid</span>
                      <span className="text-2xl font-bold text-foreground font-montserrat">KES 500</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-nunito">
                      {subscription?.payment_status === "COMPLETED"
                        ? "Payment successful via M-Pesa"
                        : "Payment processing"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Next Steps */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 font-montserrat">What Happens Next?</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full tyrent-gradient flex items-center justify-center text-white font-bold text-sm shrink-0 font-montserrat">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-foreground font-montserrat">Property is Live</p>
                      <p className="text-sm text-muted-foreground font-nunito">
                        Your property is now visible to all tenants searching on the platform
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full tyrent-gradient flex items-center justify-center text-white font-bold text-sm shrink-0 font-montserrat">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-foreground font-montserrat">Receive Booking Requests</p>
                      <p className="text-sm text-muted-foreground font-nunito">
                        Tenants can view your property details and submit booking requests
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full tyrent-gradient flex items-center justify-center text-white font-bold text-sm shrink-0 font-montserrat">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-foreground font-montserrat">Manage Your Bookings</p>
                      <p className="text-sm text-muted-foreground font-nunito">
                        Review, confirm, or decline booking requests from interested tenants
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <Button
              onClick={() => router.push(PageRoutes.LANDLORD_CREATE_PROPERTY)}
              className="flex-1 tyrent-gradient text-white font-nunito"
            >
              Add Property Details
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              onClick={() => router.push(PageRoutes.LANDLORD_DASHBOARD)}
              variant="outline"
              className="flex-1 font-nunito bg-transparent"
            >
              Go to Dashboard
            </Button>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-muted-foreground font-nunito">
              Need help?{" "}
              <a href="#" className="text-primary hover:underline">
                Contact our support team
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
