"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  User,
  FileText,
  CreditCard,
  CheckCircle2,
  Upload,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Award as IdCard,
  Home,
  AlertCircle,
} from "lucide-react"
import { PageRoutes } from "@/constants/page-routes"
import { saveLandlordProfile, type LandlordProfile } from "@/lib/landlord-storage"
import { backendUploadLandlordDocuments } from "@/lib/api/landlord"

const steps = [
  { id: 1, name: "Personal Info", icon: User },
  { id: 2, name: "Verification", icon: IdCard },
  { id: 3, name: "Bank Details", icon: CreditCard },
  { id: 4, name: "Review", icon: CheckCircle2 },
]

export default function LandlordRegister() {
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(1)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: "",
    email: "",
    phone: "",
    idNumber: "",
    address: "",

    // Verification Documents
    idDocument: null as File | null,
    proofOfOwnership: null as File | null,
    kraPin: null as File | null,

    // Bank Details
    bankName: "",
    accountNumber: "",
    accountName: "",
    branchCode: "",

    // Terms
    agreedToTerms: false,
  })

  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData({ ...formData, [field]: file })
  }

  const handleSubmit = async () => {
    setSubmitError(null)

    const missingPersonal =
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.idNumber.trim() ||
      !formData.address.trim()

    const missingDocs = !formData.idDocument || !formData.proofOfOwnership

    const missingBank =
      !formData.bankName.trim() || !formData.accountNumber.trim() || !formData.accountName.trim()

    if (missingPersonal) {
      setCurrentStep(1)
      setSubmitError("Please complete all required Personal Info fields.")
      return
    }
    if (missingDocs) {
      setCurrentStep(2)
      setSubmitError("Please upload your ID/Passport and Proof of Ownership.")
      return
    }
    if (missingBank) {
      setCurrentStep(3)
      setSubmitError("Please complete your required Bank Details.")
      return
    }
    if (!formData.agreedToTerms) {
      setCurrentStep(4)
      setSubmitError("Please agree to the Terms and Conditions to continue.")
      return
    }

    setIsSubmitting(true)
    try {
      // Upload verification documents to backend (requires an authenticated landlord token).
      // The backend endpoint expects multipart/form-data.
      const uploadForm = new FormData()
      if (formData.idDocument) uploadForm.append("id_document", formData.idDocument)
      if (formData.proofOfOwnership) uploadForm.append("proof_of_ownership", formData.proofOfOwnership)
      if (formData.kraPin) uploadForm.append("kra_pin", formData.kraPin)

      const profile: LandlordProfile = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        idNumber: formData.idNumber.trim(),
        address: formData.address.trim(),
        bankName: formData.bankName.trim(),
        accountNumber: formData.accountNumber.trim(),
        accountName: formData.accountName.trim(),
        branchCode: formData.branchCode.trim(),
        idDocumentName: formData.idDocument?.name ?? "",
        proofOfOwnershipName: formData.proofOfOwnership?.name ?? "",
        kraPinName: formData.kraPin?.name ?? "",
        createdAt: new Date().toISOString(),
      }

      saveLandlordProfile(profile)

      // Upload after saving locally so the user doesn't lose progress
      // even if the backend temporarily rejects the request.
      await backendUploadLandlordDocuments(uploadForm)
      router.push(`${PageRoutes.LANDLORD_DASHBOARD}?registered=1`)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to submit application. Please try again.")
      setIsSubmitting(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-montserrat">
              Become a Tyrent Landlord
            </h1>
            <p className="text-muted-foreground font-nunito">
              Join hundreds of landlords managing their properties efficiently
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8">
            <Progress value={progress} className="h-2 mb-4" />
            <div className="flex justify-between">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                      currentStep >= step.id ? "tyrent-gradient text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium font-nunito hidden sm:block">{step.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form Card */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2 font-montserrat">Personal Information</h2>
                      <p className="text-muted-foreground font-nunito">Tell us about yourself to get started</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <input
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <input
                            type="tel"
                            placeholder="+254 700 000 000"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                          ID/Passport Number *
                        </label>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="12345678"
                            value={formData.idNumber}
                            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                        Physical Address *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <textarea
                          placeholder="Enter your physical address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          rows={3}
                          className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito resize-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Verification Documents */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2 font-montserrat">
                        Verification Documents
                      </h2>
                      <p className="text-muted-foreground font-nunito">
                        Upload documents to verify your identity and property ownership
                      </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <div className="text-sm text-blue-900 dark:text-blue-100 font-nunito">
                        <p className="font-semibold mb-1">Why we need these documents:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                          <li>To verify your identity and prevent fraud</li>
                          <li>To confirm property ownership</li>
                          <li>To comply with legal requirements</li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* ID Document */}
                      <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg tyrent-gradient flex items-center justify-center shrink-0">
                            <IdCard className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1 font-montserrat">
                              National ID or Passport *
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3 font-nunito">
                              Clear copy of your ID or passport (PDF, JPG, PNG - Max 5MB)
                            </p>
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload("idDocument", e.target.files?.[0] || null)}
                                className="hidden"
                              />
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-nunito">
                                <Upload className="h-4 w-4" />
                                {formData.idDocument ? "Change File" : "Upload Document"}
                              </div>
                            </label>
                            {formData.idDocument && (
                              <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-nunito">
                                <CheckCircle2 className="h-4 w-4" />
                                {formData.idDocument.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Proof of Ownership */}
                      <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg tyrent-gradient flex items-center justify-center shrink-0">
                            <Home className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1 font-montserrat">
                              Proof of Property Ownership *
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3 font-nunito">
                              Title deed, lease agreement, or ownership certificate (PDF, JPG, PNG - Max 10MB)
                            </p>
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload("proofOfOwnership", e.target.files?.[0] || null)}
                                className="hidden"
                              />
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-nunito">
                                <Upload className="h-4 w-4" />
                                {formData.proofOfOwnership ? "Change File" : "Upload Document"}
                              </div>
                            </label>
                            {formData.proofOfOwnership && (
                              <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-nunito">
                                <CheckCircle2 className="h-4 w-4" />
                                {formData.proofOfOwnership.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* KRA PIN */}
                      <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg tyrent-gradient flex items-center justify-center shrink-0">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1 font-montserrat">KRA PIN Certificate</h3>
                            <p className="text-sm text-muted-foreground mb-3 font-nunito">
                              Optional but recommended for tax purposes (PDF, JPG, PNG - Max 5MB)
                            </p>
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload("kraPin", e.target.files?.[0] || null)}
                                className="hidden"
                              />
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-nunito">
                                <Upload className="h-4 w-4" />
                                {formData.kraPin ? "Change File" : "Upload Document"}
                              </div>
                            </label>
                            {formData.kraPin && (
                              <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-nunito">
                                <CheckCircle2 className="h-4 w-4" />
                                {formData.kraPin.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Bank Details */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2 font-montserrat">Bank Details</h2>
                      <p className="text-muted-foreground font-nunito">
                        Add your bank account for receiving rental payments
                      </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                      <div className="text-sm text-green-900 dark:text-green-100 font-nunito">
                        <p className="font-semibold mb-1">Secure Payment Processing</p>
                        <p className="text-green-800 dark:text-green-200">
                          Your bank details are encrypted and secure. We use industry-standard security measures to
                          protect your information.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                          Bank Name *
                        </label>
                        <select
                          value={formData.bankName}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                        >
                          <option value="">Select your bank</option>
                          <option value="equity">Equity Bank</option>
                          <option value="kcb">KCB Bank</option>
                          <option value="coop">Co-operative Bank</option>
                          <option value="absa">Absa Bank</option>
                          <option value="stanbic">Stanbic Bank</option>
                          <option value="ncba">NCBA Bank</option>
                          <option value="dtb">Diamond Trust Bank</option>
                          <option value="mpesa">M-Pesa</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                          Account Number *
                        </label>
                        <input
                          type="text"
                          placeholder="1234567890"
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                          Account Name *
                        </label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={formData.accountName}
                          onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                          Branch Code
                        </label>
                        <input
                          type="text"
                          placeholder="001"
                          value={formData.branchCode}
                          onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2 font-montserrat">Review & Submit</h2>
                      <p className="text-muted-foreground font-nunito">
                        Please review your information before submitting
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Personal Info Summary */}
                      <div className="border border-border rounded-lg p-4">
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 font-montserrat">
                          <User className="h-5 w-5 text-primary" />
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm font-nunito">
                          <div>
                            <span className="text-muted-foreground">Name:</span>
                            <p className="font-medium">{formData.fullName || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <p className="font-medium">{formData.email || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Phone:</span>
                            <p className="font-medium">{formData.phone || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">ID Number:</span>
                            <p className="font-medium">{formData.idNumber || "Not provided"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Documents Summary */}
                      <div className="border border-border rounded-lg p-4">
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 font-montserrat">
                          <FileText className="h-5 w-5 text-primary" />
                          Documents
                        </h3>
                        <div className="space-y-2 text-sm font-nunito">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">ID Document:</span>
                            {formData.idDocument ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Uploaded
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600 border-red-600">
                                Missing
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Proof of Ownership:</span>
                            {formData.proofOfOwnership ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Uploaded
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600 border-red-600">
                                Missing
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">KRA PIN:</span>
                            {formData.kraPin ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Uploaded
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-600 border-gray-600">
                                Optional
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bank Details Summary */}
                      <div className="border border-border rounded-lg p-4">
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 font-montserrat">
                          <CreditCard className="h-5 w-5 text-primary" />
                          Bank Details
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm font-nunito">
                          <div>
                            <span className="text-muted-foreground">Bank:</span>
                            <p className="font-medium">{formData.bankName || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Account Number:</span>
                            <p className="font-medium">{formData.accountNumber || "Not provided"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="border border-border rounded-lg p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.agreedToTerms}
                          onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                          className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-foreground font-nunito">
                          I agree to the{" "}
                          <a href="#" className="text-primary hover:underline">
                            Terms and Conditions
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-primary hover:underline">
                            Privacy Policy
                          </a>
                          . I confirm that all information provided is accurate and I have the legal right to list the
                          properties I will add to the platform.
                        </span>
                      </label>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <p className="text-sm text-yellow-900 dark:text-yellow-100 font-nunito">
                        <strong>What happens next?</strong> Our team will review your application within 24-48 hours.
                        You'll receive an email notification once your account is approved.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="font-nunito bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentStep < steps.length ? (
                  <Button onClick={handleNext} className="font-nunito">
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.agreedToTerms}
                    className="tyrent-gradient text-white font-nunito"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>

              {submitError && (
                <div className="mt-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-4">
                  <p className="text-sm text-red-700 dark:text-red-200 font-nunito">{submitError}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
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
