"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { backendGetBooking, type BackendBooking } from "@/lib/api/bookings"
import { backendListApartments, type BackendApartment } from "@/lib/api/properties"
import { CheckCircle2, Home, Mail, Calendar, MapPin, Download, ArrowRight, Phone, User } from "lucide-react"

export default function BookingConfirmation() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = (searchParams.get("booking") || "").trim()
  const [booking, setBooking] = useState<BackendBooking | null>(null)
  const [apartmentList, setApartmentList] = useState<BackendApartment[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!bookingId) return
      try {
        const [b, apartments] = await Promise.all([backendGetBooking(bookingId), backendListApartments().catch(() => [])])
        if (!cancelled) {
          setBooking(b)
          setApartmentList(Array.isArray(apartments) ? apartments : [])
        }
      } catch {
        if (!cancelled) {
          setBooking(null)
          setApartmentList([])
        }
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [bookingId])

  const bookingView = useMemo(() => {
    if (!booking) return null
    for (const apt of apartmentList) {
      for (const unit of apt.units ?? []) {
        if (String(unit.id) === String(booking.unit)) {
          return {
            property: apt.name,
            unit: String((unit as any).unit_number_or_id ?? unit.id),
            location: apt.address || "No address provided",
            landlord: {
              name: apt.landlord_info?.full_name || apt.landlord_info?.username || "Landlord",
              phone: apt.landlord_info?.phone_number || "",
              email: apt.landlord_info?.email || "",
            },
          }
        }
      }
    }
    return {
      property: "Booked Property",
      unit: String(booking.unit).slice(0, 8),
      location: "Location unavailable",
      landlord: {
        name: "Landlord",
        phone: "",
        email: "",
      },
    }
  }, [booking, apartmentList])

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
              Your 48-hour reservation is confirmed. The landlord will contact you shortly.
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
                      <p className="font-semibold text-foreground font-montserrat">{bookingView?.property || "Booked Property"}</p>
                      <p className="text-sm text-muted-foreground font-nunito">Unit {bookingView?.unit || "--"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground font-nunito">Location</p>
                      <p className="font-semibold text-foreground font-nunito">{bookingView?.location || "Location unavailable"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground font-nunito">Move-in Date</p>
                      <p className="font-semibold text-foreground font-nunito">{booking?.move_in_date || "--"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground font-nunito">Booking Reference</p>
                      <p className="font-semibold text-foreground font-mono">
                        {booking?.booking_confirmation_code || bookingId || "Pending"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4 font-montserrat flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Landlord Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground font-nunito">Landlord Name</p>
                      <p className="font-semibold text-foreground font-montserrat">{bookingView?.landlord?.name || "Landlord"}</p>
                    </div>
                    {bookingView?.landlord?.phone && (
                      <div>
                        <p className="text-sm text-muted-foreground font-nunito flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </p>
                        <p className="font-semibold text-foreground font-nunito">{bookingView.landlord.phone}</p>
                      </div>
                    )}
                    {bookingView?.landlord?.email && (
                      <div>
                        <p className="text-sm text-muted-foreground font-nunito flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </p>
                        <p className="font-semibold text-foreground font-nunito break-all">{bookingView.landlord.email}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground font-nunito">Booking Fee Paid</span>
                    <span className="text-2xl font-bold text-foreground font-montserrat">KES 350</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-nunito">
                    {booking?.payment_status === "COMPLETED" ? "Payment successful via M-Pesa" : "Payment initiated successfully"}
                  </p>
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
                      <p className="font-semibold text-foreground font-montserrat">Landlord Contact</p>
                      <p className="text-sm text-muted-foreground font-nunito">
                        The landlord will contact you via phone or email to discuss next steps and rental agreement
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full tyrent-gradient flex items-center justify-center text-white font-bold text-sm shrink-0 font-montserrat">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-foreground font-montserrat">Complete Rental Agreement</p>
                      <p className="text-sm text-muted-foreground font-nunito">
                        Once approved, finalize the rental agreement and arrange move-in with the landlord
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
              onClick={() => router.push("/tenant/dashboard?tab=overview")}
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
