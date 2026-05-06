"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageRoutes } from "@/constants/page-routes"
import { ApiError } from "@/lib/api/client"
import { backendGetApartment, type BackendApartment, type BackendUnit } from "@/lib/api/properties"
import { backendCreateBooking } from "@/lib/api/bookings"
import { backendInitiateMpesaPayment } from "@/lib/api/wallet"
import { requireAuth } from "@/lib/route-guards"
import {
  Calendar,
  Users,
  ArrowLeft,
  Wallet,
  Loader2,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  AlertCircle,
  CheckCircle2,
  Shield,
  Clock,
} from "lucide-react"

export default function BookingCheckout() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [apartment, setApartment] = useState<BackendApartment | null>(null)
  const [loadingProperty, setLoadingProperty] = useState(true)
  const [moveInDate, setMoveInDate] = useState("")
  const [tenants, setTenants] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStage, setSubmitStage] = useState<"idle" | "creating" | "initiating" | "finishing">("idle")
  const paymentMethod = "mpesa"

  const propertyId = params?.propertyId as string
  const selectedUnitId = (searchParams.get("unit") || "").trim()

  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/+$/, "")
  const absolutizeUrl = (url?: string | null) => {
    if (!url) return ""
    return url.startsWith("http://") || url.startsWith("https://") ? url : `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`
  }

  useEffect(() => {
    const auth = requireAuth({ role: "tenant" })
    if (!auth.ok) {
      router.replace(auth.redirectTo)
      return
    }
  }, [router])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoadingProperty(true)
      try {
        const apt = await backendGetApartment(propertyId)
        if (!cancelled) setApartment(apt)
      } catch {
        if (!cancelled) setApartment(null)
      } finally {
        if (!cancelled) setLoadingProperty(false)
      }
    }
    if (propertyId) void load()
    return () => {
      cancelled = true
    }
  }, [propertyId])

  const parseBedrooms = (unitType?: string | null) => {
    const t = String(unitType || "").toLowerCase()
    if (!t) return null
    if (t.includes("bedsitter") || t.includes("studio")) return 0
    const m = t.match(/(\d+)/)
    if (m) return Number(m[1])
    return null
  }

  const selectedUnit = useMemo(() => {
    const units = apartment?.units ?? []
    if (units.length === 0) return null
    const exact = units.find((u) => String(u.id) === selectedUnitId)
    if (exact) return exact
    const vacant = units.find((u) => String((u as any).status || "").toUpperCase() === "VACANT")
    return vacant ?? units[0]
  }, [apartment, selectedUnitId])

  const property = useMemo(() => {
    const unit = selectedUnit
    const interior = Array.isArray((unit as any)?.interior_images) ? ((unit as any).interior_images as string[]) : []
    const exterior = Array.isArray((unit as any)?.exterior_images) ? ((unit as any).exterior_images as string[]) : []
    const fallbackExterior = absolutizeUrl(apartment?.exterior_image_url || apartment?.exterior_image) || "/placeholder.svg"
    const unitImage = interior[0] || exterior[0]
    return {
      id: apartment?.id || propertyId,
      title: apartment?.name || "Property",
      location: apartment?.address || "No address provided",
      bedrooms: parseBedrooms((unit as any)?.type) ?? 0,
      bathrooms: 1,
      size: Number((unit as any)?.size_sqft ?? 0),
      price: Number((unit as any)?.price_per_month ?? 0),
      images: [unitImage ? absolutizeUrl(unitImage) : fallbackExterior],
    }
  }, [apartment, selectedUnit, propertyId])

  const rent = property.price || 0
  const bookingFee = 350
  const total = bookingFee

  const handleSubmit = async () => {
    setSubmitError(null)
    if (!moveInDate || !agreedToTerms) {
      setSubmitError("Please provide move-in date and accept terms.")
      return
    }
    if (!selectedUnit?.id) {
      setSubmitError("No unit selected for this booking.")
      return
    }
    if (!phoneNumber.trim()) {
      setSubmitError("Please enter your M-Pesa phone number.")
      return
    }
  
    setIsSubmitting(true)
    setSubmitStage("initiating")
  
    try {
      // No booking creation — just initiate payment with unit_id
      const response = await backendInitiateMpesaPayment({
        phone: phoneNumber.trim(),
        unit_id: String(selectedUnit.id),
      })
  
      setSubmitStage("finishing")
  
      // Redirect to a waiting page — booking doesn't exist yet
      if (!response.checkout_request_id) {
        setSubmitError("Payment initiated but no confirmation received. Please contact support.")
        return
      }
      
      router.push(
        `${PageRoutes.BOOKING_PENDING}?checkout_request_id=${encodeURIComponent(response.checkout_request_id)}&unit=${encodeURIComponent(String(selectedUnit.id))}`
      )
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Payment failed. Please try again."
      setSubmitError(msg)
    } finally {
      setIsSubmitting(false)
      setSubmitStage("idle")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {isSubmitting && (
        <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full tyrent-gradient flex items-center justify-center shrink-0">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground font-montserrat mb-1">
                    {submitStage === "creating"
                      ? "Creating your booking..."
                      : submitStage === "initiating"
                        ? "Waiting for M-Pesa prompt..."
                        : "Finalizing your booking..."}
                  </h3>
                  <p className="text-sm text-muted-foreground font-nunito">
                    {submitStage === "initiating"
                      ? "Please complete the payment prompt on your phone."
                      : "Please wait a moment. Do not close this page."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 font-nunito">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to property
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-foreground mb-2 font-montserrat">Confirm and Pay</h1>
                <p className="text-muted-foreground font-nunito">Review your booking details and complete payment</p>
                {selectedUnit?.id && (
                  <p className="text-sm text-primary font-nunito mt-1">
                    Booking selected unit: {String((selectedUnit as any).unit_number_or_id || selectedUnit.id).slice(0, 16)}
                  </p>
                )}
              </motion.div>
              {loadingProperty && <p className="text-sm text-muted-foreground font-nunito">Loading property details...</p>}
              {submitError && <p className="text-sm text-red-600 font-nunito">{submitError}</p>}

              {/* Move-in Details */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2 font-montserrat">
                      <Calendar className="h-5 w-5 text-primary" />
                      Move-in Details
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                          Preferred Move-in Date *
                        </label>
                        <input
                          type="date"
                          value={moveInDate}
                          onChange={(e) => setMoveInDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                          Number of Tenants
                        </label>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setTenants(Math.max(1, tenants - 1))}
                            className="bg-transparent"
                          >
                            -
                          </Button>
                          <div className="flex items-center gap-2 px-6 py-2 border border-border rounded-lg">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <span className="font-semibold font-nunito">{tenants}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setTenants(tenants + 1)}
                            className="bg-transparent"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Method */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2 font-montserrat">
                      <Wallet className="h-5 w-5 text-primary" />
                      Payment Method
                    </h2>

                    <div className="space-y-4">
                      {/* M-Pesa */}
                      <label
                        className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all border-primary bg-primary/5`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="mpesa"
                          checked={paymentMethod === "mpesa"}
                          readOnly
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Wallet className="h-5 w-5 text-green-600" />
                            <span className="font-semibold font-montserrat">M-Pesa</span>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Recommended
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-nunito mb-3">
                            Pay securely with M-Pesa mobile money
                          </p>
                          {paymentMethod === "mpesa" && (
                            <div className="mt-3">
                              <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                                M-Pesa Phone Number
                              </label>
                              <input
                                type="tel"
                                placeholder="+254 700 000 000"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                              />
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Important Information */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <div className="space-y-2 text-sm text-blue-900 dark:text-blue-100 font-nunito">
                        <p className="font-semibold">Important Information:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                          <li>Your booking is subject to landlord approval</li>
                          <li>Full refund if booking is not approved within 48 hours</li>
                          <li>Deposit is refundable at the end of tenancy (subject to property condition)</li>
                          <li>Service fee covers verification, support, and platform maintenance</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Terms and Conditions */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardContent className="p-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-foreground font-nunito">
                        I agree to the{" "}
                        <a href="#" className="text-primary hover:underline">
                          Terms and Conditions
                        </a>
                        ,{" "}
                        <a href="#" className="text-primary hover:underline">
                          Cancellation Policy
                        </a>
                        , and{" "}
                        <a href="#" className="text-primary hover:underline">
                          House Rules
                        </a>
                        . I understand that my booking is subject to landlord approval.
                      </span>
                    </label>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Booking Summary - Sticky */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-24"
              >
                <Card className="shadow-xl">
                  <CardContent className="p-6">
                    {/* Property Preview */}
                    <div className="mb-6">
                      <img
                        src={property.images?.[0] || "/placeholder.svg"}
                        alt={property.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <h3 className="font-bold text-lg text-foreground mb-2 font-montserrat line-clamp-2">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-nunito">
                        <MapPin className="h-4 w-4" />
                        {property.location}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground font-nunito">
                        <div className="flex items-center gap-1">
                          <BedDouble className="h-4 w-4" />
                          {property.bedrooms} BR
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          {property.bathrooms} BA
                        </div>
                        <div className="flex items-center gap-1">
                          <Maximize className="h-4 w-4" />
                          {property.size} sqft
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Price Breakdown */}
                    <div className="space-y-4 mb-6">
                      <h3 className="font-semibold text-foreground font-montserrat">Price Breakdown</h3>

                      <div className="space-y-3 text-sm font-nunito">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Booking Fee (48-hour reservation)</span>
                          <span className="font-semibold">KES {bookingFee.toLocaleString()}</span>
                        </div>

                        <Separator />

                        <div className="flex justify-between text-lg">
                          <span className="font-bold text-foreground">Total Due Today</span>
                          <span className="font-bold text-primary">KES {total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmit}
                      disabled={!moveInDate || !agreedToTerms || isSubmitting || loadingProperty || !selectedUnit}
                      className="w-full tyrent-gradient text-white py-6 text-lg font-montserrat shadow-lg"
                    >
                      {isSubmitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                      {isSubmitting
                        ? submitStage === "creating"
                          ? "Creating booking..."
                          : submitStage === "initiating"
                            ? "Initiating payment..."
                            : "Finalizing..."
                        : `Pay KES ${total} & Reserve`}
                    </Button>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground font-nunito">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Secure payment powered by Tyrent</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Response Time */}
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary shrink-0" />
                      <div className="text-sm font-nunito">
                        <p className="font-semibold text-foreground">Landlord Response</p>
                        <p className="text-muted-foreground">Landlord will contact you within 48 hours to proceed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
