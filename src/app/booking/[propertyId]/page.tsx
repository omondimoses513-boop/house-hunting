"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { sampleProperties } from "@/data/SampleProperties"
import { PageRoutes } from "@/constants/page-routes"
import { addTenantPayment, saveTenantLease, type TenantLease } from "@/lib/tenant-storage"
import { generateId, saveLandlordBookings, type LandlordBooking } from "@/lib/landlord-storage"
import {
  Calendar,
  Users,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  Shield,
  Clock,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  AlertCircle,
  Wallet,
  Building2,
} from "lucide-react"

export default function BookingCheckout() {
  const params = useParams()
  const router = useRouter()
  const [moveInDate, setMoveInDate] = useState("")
  const [tenants, setTenants] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const propertyId = params?.propertyId as string
  const propertyData = sampleProperties.find((p) => p.id === propertyId)

  // Fallback to mock data if property not found
  const property = propertyData || {
    id: propertyId,
    title: "Modern 2BR Apartment in Kilimani",
    location: "Kilimani, Nairobi",
    bedrooms: 2,
    bathrooms: 2,
    size: 1200,
    price: 65000,
    images: ["/modern-apartment-living-room.png"],
    landlord: {
      name: "John Kamau",
      phone: "+254 700 000 000",
      verified: true,
    },
  }

  const rent = property.price || 65000
  const bookingFee = 350
  const serviceFee = 0
  const total = bookingFee

  const normalizePhoneForWhatsapp = (value: string) => {
    const digits = value.replace(/[^\d]/g, "")
    if (digits.startsWith("0")) return `254${digits.slice(1)}`
    if (digits.startsWith("254")) return digits
    if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`
    return digits
  }

  const handleSubmit = () => {
    if (!moveInDate || !agreedToTerms) return
    // Persist booking locally (frontend-only) until backend is wired.
    try {
      const lease: TenantLease = {
        id: generateId("lease"),
        propertyId: property.id,
        property: property.title,
        unit: "TBD",
        location: property.location,
        landlord: {
          name: property.landlord?.name ?? "Landlord",
          phone: property.landlord?.phone ?? "",
          email: (property as any)?.landlord?.email ?? "landlord@example.com",
          verified: Boolean(property.landlord?.verified),
        },
        rent: rent,
        deposit: rent * 2,
        leaseStart: moveInDate,
        leaseEnd: "",
        nextPaymentDue: "",
        imageUrl: property.images?.[0],
      }
      saveTenantLease(lease)

      addTenantPayment({
        id: generateId("payment"),
        date: new Date().toISOString().slice(0, 10),
        amount: total,
        status: "paid",
        method: paymentMethod === "mpesa" ? "M-Pesa" : paymentMethod === "card" ? "Card" : "Bank",
        reference: `TYR-BOOK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        note: `Booking fee for ${property.title}`,
      })

      // Also create a pending booking for the landlord dashboard (if landlord demo store exists).
      const landlordBooking: LandlordBooking = {
        id: generateId("booking"),
        tenant: "Tenant",
        propertyId: property.id,
        propertyName: property.title,
        unit: "TBD",
        moveInDate,
        amount: total,
        status: "pending",
        submittedDate: new Date().toISOString().slice(0, 10),
      }
      const existing = (() => {
        try {
          return (typeof window !== "undefined" ? (JSON.parse(localStorage.getItem("tyrent_landlord_bookings_v1") || "[]") as LandlordBooking[]) : [])
        } catch {
          return []
        }
      })()
      saveLandlordBookings([landlordBooking, ...existing])
    } catch {
      // If persistence fails, still allow navigation to confirmation.
    }

    router.push(PageRoutes.BOOKING_CONFIRMATION)
  }

  return (
    <div className="min-h-screen bg-background">
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
              </motion.div>

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
                      <CreditCard className="h-5 w-5 text-primary" />
                      Payment Method
                    </h2>

                    <div className="space-y-4">
                      {/* M-Pesa */}
                      <label
                        className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === "mpesa"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="mpesa"
                          checked={paymentMethod === "mpesa"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
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

                      {/* Card Payment */}
                      <label
                        className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === "card"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === "card"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <span className="font-semibold font-montserrat">Credit/Debit Card</span>
                          </div>
                          <p className="text-sm text-muted-foreground font-nunito mb-3">
                            Pay with Visa, Mastercard, or other cards
                          </p>
                          {paymentMethod === "card" && (
                            <div className="space-y-3 mt-3">
                              <div>
                                <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                                  Card Number
                                </label>
                                <input
                                  type="text"
                                  placeholder="1234 5678 9012 3456"
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(e.target.value)}
                                  className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                                    Expiry Date
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={cardExpiry}
                                    onChange={(e) => setCardExpiry(e.target.value)}
                                    className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                                    CVV
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="123"
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value)}
                                    className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>

                      {/* Bank Transfer */}
                      <label
                        className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === "bank"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="bank"
                          checked={paymentMethod === "bank"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <span className="font-semibold font-montserrat">Bank Transfer</span>
                          </div>
                          <p className="text-sm text-muted-foreground font-nunito">
                            Direct bank transfer (Processing time: 1-2 business days)
                          </p>
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

                    {/* Landlord Info */}
                    <div className="bg-muted/50 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-foreground font-montserrat">Landlord:</span>
                        {property.landlord?.verified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground font-nunito mb-1">{property.landlord?.name}</p>
                      <p className="text-xs text-muted-foreground font-nunito">{property.landlord?.phone}</p>
                      {property.landlord?.phone && (
                        <a
                          className="mt-2 inline-block text-xs text-primary hover:underline font-nunito"
                          href={`https://wa.me/${normalizePhoneForWhatsapp(property.landlord.phone)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp landlord
                        </a>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmit}
                      disabled={!moveInDate || !agreedToTerms}
                      className="w-full tyrent-gradient text-white py-6 text-lg font-montserrat shadow-lg"
                    >
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Pay KES {total} & Reserve
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
