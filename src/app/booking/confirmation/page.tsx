"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Home, Mail, Calendar, MapPin, Download, ArrowRight } from "lucide-react"

export default function BookingConfirmation() {
  const router = useRouter()

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
              Booking Request Submitted!
            </h1>
            <p className="text-lg text-muted-foreground font-nunito">
              Your booking request has been sent to the landlord for approval
            </p>
          </motion.div>

          {/* Booking Details Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="shadow-xl mb-6">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground font-montserrat">Booking Details</h2>
                  <Badge className="tyrent-gradient text-white border-0">Pending Approval</Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Home className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground font-nunito">Property</p>
                      <p className="font-semibold text-foreground font-montserrat">Modern 2BR Apartment in Kilimani</p>
                      <p className="text-sm text-muted-foreground font-nunito">Unit A101</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground font-nunito">Location</p>
                      <p className="font-semibold text-foreground font-nunito">Kilimani, Nairobi</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground font-nunito">Move-in Date</p>
                      <p className="font-semibold text-foreground font-nunito">March 1, 2025</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground font-nunito">Booking Reference</p>
                      <p className="font-semibold text-foreground font-mono">TYR-2025-001234</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground font-nunito">Total Paid</span>
                    <span className="text-2xl font-bold text-foreground font-montserrat">KES 200,000</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-nunito">Payment successful via M-Pesa</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

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
                      <p className="font-semibold text-foreground font-montserrat">Landlord Review</p>
                      <p className="text-sm text-muted-foreground font-nunito">
                        The landlord will review your booking request within 24-48 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full tyrent-gradient flex items-center justify-center text-white font-bold text-sm shrink-0 font-montserrat">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-foreground font-montserrat">Email Notification</p>
                      <p className="text-sm text-muted-foreground font-nunito">
                        You'll receive an email with the landlord's decision and next steps
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full tyrent-gradient flex items-center justify-center text-white font-bold text-sm shrink-0 font-montserrat">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-foreground font-montserrat">Move-in Coordination</p>
                      <p className="text-sm text-muted-foreground font-nunito">
                        Once approved, coordinate with the landlord for key handover and move-in
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
            <Button variant="outline" className="flex-1 font-nunito bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button
              onClick={() => router.push("/tenant/dashboard")}
              className="flex-1 tyrent-gradient text-white font-nunito"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
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
