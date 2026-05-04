"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ApiError } from "@/lib/api/client"
import { backendInitiateMpesaPayment } from "@/lib/api/wallet"
import { requireAuth } from "@/lib/route-guards"
import { PageRoutes } from "@/constants/page-routes"
import {
  ArrowLeft,
  Wallet,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building2,
} from "lucide-react"

export default function PropertyListingCheckout() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStage, setSubmitStage] = useState<"idle" | "creating" | "initiating" | "finishing">("idle")
  const paymentMethod = "mpesa"

  const propertyData = searchParams.get("property") ? JSON.parse(decodeURIComponent(searchParams.get("property") || "{}")) : null

  useEffect(() => {
    const auth = requireAuth({ role: "landlord" })
    if (!auth.ok) {
      router.replace(auth.redirectTo)
      return
    }
  }, [router])

  const subscriptionFee = 500
  const total = subscriptionFee

  const handleSubmit = async () => {
    setSubmitError(null)
    if (!agreedToTerms) {
      setSubmitError("Please accept terms and conditions.")
      return
    }
    if (paymentMethod === "mpesa" && !phoneNumber.trim()) {
      setSubmitError("Please enter your M-Pesa phone number.")
      return
    }

    setIsSubmitting(true)
    setSubmitStage("initiating")
    try {
      if (paymentMethod === "mpesa") {
        await backendInitiateMpesaPayment({
          phone: phoneNumber.trim(),
          amount: String(total),
          booking_id: "property-subscription",
        })
      }

      setSubmitStage("finishing")
      router.push(
        `${PageRoutes.LANDLORD_PROPERTY_CONFIRMATION}?property=${encodeURIComponent(JSON.stringify(propertyData || {}))}`
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
                      ? "Processing your subscription..."
                      : submitStage === "initiating"
                        ? "Waiting for M-Pesa prompt..."
                        : "Finalizing your subscription..."}
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
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-foreground mb-2 font-montserrat">List Your Property</h1>
                <p className="text-muted-foreground font-nunito">Complete payment to publish your property listing</p>
              </motion.div>

              {submitError && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 font-nunito">{submitError}</p>
                </div>
              )}

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
                          <li>Your property will be published after payment confirmation</li>
                          <li>Subscription fee includes listing for 30 days</li>
                          <li>You can add multiple units to a single property</li>
                          <li>Tenants can view and book your property immediately after listing</li>
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
                          Listing Policy
                        </a>
                        , and{" "}
                        <a href="#" className="text-primary hover:underline">
                          Community Guidelines
                        </a>
                        . I understand that my property listing is subject to platform review and approval.
                      </span>
                    </label>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Payment Summary - Sticky */}
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
                      <div className="w-full h-32 rounded-lg mb-4 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg text-foreground mb-2 font-montserrat">New Property Listing</h3>
                      <p className="text-sm text-muted-foreground font-nunito">Publish your property and start accepting bookings</p>
                    </div>

                    <Separator className="my-6" />

                    {/* Price Breakdown */}
                    <div className="space-y-4 mb-6">
                      <h3 className="font-semibold text-foreground font-montserrat">Price Breakdown</h3>

                      <div className="space-y-3 text-sm font-nunito">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Listing Subscription Fee</span>
                          <span className="font-semibold">KES {subscriptionFee.toLocaleString()}</span>
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
                      disabled={!agreedToTerms || isSubmitting}
                      className="w-full tyrent-gradient text-white font-nunito py-6 text-base"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Pay and Publish
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground mt-4 font-nunito">
                      Your listing will be published immediately after successful payment
                    </p>
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
