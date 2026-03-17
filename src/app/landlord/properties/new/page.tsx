"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Building2,
  MapPin,
  ImageIcon,
  FileText,
  Home,
  CheckCircle2,
  Upload,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
  Wifi,
  Car,
  Shield,
  Droplets,
  Zap,
  Wind,
  Dumbbell,
  Users,
  Trash2,
} from "lucide-react"
import { PageRoutes } from "@/constants/page-routes"
import {
  generateId,
  getLandlordPropertyById,
  type LandlordProperty,
  upsertLandlordProperty,
} from "@/lib/landlord-storage"

const steps = [
  { id: 1, name: "Property Info", icon: Building2 },
  { id: 2, name: "Location & Amenities", icon: MapPin },
  { id: 3, name: "Images & Documents", icon: ImageIcon },
  { id: 4, name: "Add Units", icon: Home },
]

const amenitiesList = [
  { icon: Wifi, label: "WiFi" },
  { icon: Car, label: "Parking" },
  { icon: Shield, label: "24/7 Security" },
  { icon: Droplets, label: "Water Supply" },
  { icon: Zap, label: "Backup Generator" },
  { icon: Wind, label: "Air Conditioning" },
  { icon: Dumbbell, label: "Gym" },
  { icon: Users, label: "Swimming Pool" },
]

interface Unit {
  id: string
  unitNumber: string
  category: string
  type: string
  bedrooms: number
  bathrooms: number
  size: number
  rent: number
  deposit: number
  status: "vacant" | "occupied"
  images: File[]
}

export default function NewPropertyListing() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")

  const [currentStep, setCurrentStep] = useState(1)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Property Info
    propertyName: "",
    propertyType: "apartment",
    description: "",
    rules: "",

    // Location
    county: "Nairobi",
    area: "",
    street: "",
    distanceToRoad: "",
    distanceToSchool: "",
    distanceToMarket: "",

    // Amenities
    selectedAmenities: [] as string[],
    customAmenities: "",

    // Images & Documents
    propertyImages: [] as File[],
    propertyImageUrls: "" as string,
    leaseAgreement: null as File | null,

    // Units
    units: [] as Unit[],
  })

  const [currentUnit, setCurrentUnit] = useState<Unit>({
    id: Date.now().toString(),
    unitNumber: "",
    category: "living",
    type: "1bedroom",
    bedrooms: 1,
    bathrooms: 1,
    size: 0,
    rent: 0,
    deposit: 0,
    status: "vacant",
    images: [],
  })

  const progress = (currentStep / steps.length) * 100

  useEffect(() => {
    if (!editId) return
    const existing = getLandlordPropertyById(editId)
    if (!existing) return

    setFormData({
      propertyName: existing.name ?? "",
      propertyType: existing.propertyType ?? "apartment",
      description: existing.description ?? "",
      rules: existing.rules ?? "",

      county: existing.county ?? "Nairobi",
      area: existing.area ?? "",
      street: existing.street ?? "",
      distanceToRoad: existing.distanceToRoad ?? "",
      distanceToSchool: existing.distanceToSchool ?? "",
      distanceToMarket: existing.distanceToMarket ?? "",

      selectedAmenities: existing.amenities ?? [],
      customAmenities: existing.customAmenities ?? "",

      // File objects can't be restored; keep empty and allow re-upload if desired.
      propertyImages: [],
      propertyImageUrls: (existing.imageUrls ?? []).join(", "),
      leaseAgreement: null,

      units: (existing.units ?? []).map((u) => ({
        id: u.id,
        unitNumber: u.unitNumber,
        category: u.category,
        type: u.type,
        bedrooms: u.bedrooms,
        bathrooms: u.bathrooms,
        size: u.size,
        rent: u.rent,
        deposit: u.deposit,
        status: u.status,
        images: [],
      })),
    })
    setCurrentStep(1)
  }, [editId])

  const parsedPropertyImageUrls = (formData.propertyImageUrls || "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => /^https?:\/\//i.test(s))

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

  const toggleAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      selectedAmenities: formData.selectedAmenities.includes(amenity)
        ? formData.selectedAmenities.filter((a) => a !== amenity)
        : [...formData.selectedAmenities, amenity],
    })
  }

  const handlePropertyImagesUpload = (files: FileList | null) => {
    if (files) {
      setFormData({
        ...formData,
        propertyImages: [...formData.propertyImages, ...Array.from(files)],
      })
    }
  }

  const removePropertyImage = (index: number) => {
    setFormData({
      ...formData,
      propertyImages: formData.propertyImages.filter((_, i) => i !== index),
    })
  }

  const handleUnitImagesUpload = (files: FileList | null) => {
    if (files) {
      setCurrentUnit({
        ...currentUnit,
        images: [...currentUnit.images, ...Array.from(files)],
      })
    }
  }

  const removeUnitImage = (index: number) => {
    setCurrentUnit({
      ...currentUnit,
      images: currentUnit.images.filter((_, i) => i !== index),
    })
  }

  const addUnit = () => {
    setFormData({
      ...formData,
      units: [...formData.units, currentUnit],
    })
    setCurrentUnit({
      id: Date.now().toString(),
      unitNumber: "",
      category: "living",
      type: "1bedroom",
      bedrooms: 1,
      bathrooms: 1,
      size: 0,
      rent: 0,
      deposit: 0,
      status: "vacant",
      images: [],
    })
  }

  const removeUnit = (id: string) => {
    setFormData({
      ...formData,
      units: formData.units.filter((u) => u.id !== id),
    })
  }

  const handleSubmit = () => {
    setSubmitError(null)

    const missingStep1 = !formData.propertyName.trim() || !formData.description.trim()
    const missingStep2 = !formData.area.trim() || !formData.street.trim()
    const missingImages = !editId && formData.propertyImages.length === 0 && parsedPropertyImageUrls.length === 0
    const missingUnits = formData.units.length === 0
    const invalidUnits = formData.units.some((u) => !u.unitNumber.trim() || u.rent <= 0 || u.deposit < 0)

    if (missingStep1) {
      setCurrentStep(1)
      setSubmitError("Please fill in the required Property Information fields.")
      return
    }
    if (missingStep2) {
      setCurrentStep(2)
      setSubmitError("Please fill in the required Location fields (Area and Street).")
      return
    }
    if (missingImages) {
      setCurrentStep(3)
      setSubmitError("Please upload at least 1 property image (or paste at least 1 image URL).")
      return
    }
    if (missingUnits || invalidUnits) {
      setCurrentStep(4)
      setSubmitError("Please add at least 1 valid unit (Unit Number, Rent and Deposit).")
      return
    }

    setIsSubmitting(true)
    try {
      const now = new Date().toISOString()
      const existing = editId ? getLandlordPropertyById(editId) : null
      const propertyId = existing?.id ?? generateId("property")

      const property: LandlordProperty = {
        id: propertyId,
        name: formData.propertyName.trim(),
        propertyType: formData.propertyType,
        description: formData.description.trim(),
        rules: formData.rules.trim(),
        county: formData.county,
        area: formData.area.trim(),
        street: formData.street.trim(),
        distanceToRoad: formData.distanceToRoad.trim(),
        distanceToSchool: formData.distanceToSchool.trim(),
        distanceToMarket: formData.distanceToMarket.trim(),
        amenities: formData.selectedAmenities,
        customAmenities: formData.customAmenities.trim(),
        imageNames: formData.propertyImages.map((f) => f.name),
        imageUrls: parsedPropertyImageUrls,
        leaseAgreementName: formData.leaseAgreement?.name ?? "",
        units: formData.units.map((u) => ({
          id: u.id || generateId("unit"),
          unitNumber: u.unitNumber.trim(),
          category: u.category,
          type: u.type,
          bedrooms: u.bedrooms,
          bathrooms: u.bathrooms,
          size: u.size,
          rent: u.rent,
          deposit: u.deposit,
          status: u.status,
          imageNames: (u.images ?? []).map((f) => f.name),
        })),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      }

      upsertLandlordProperty(property)
      router.push(`${PageRoutes.LANDLORD_DASHBOARD}?created=1`)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to publish listing. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-montserrat">
              Create Property Listing
            </h1>
            <p className="text-muted-foreground font-nunito">
              Add your property details and units to start receiving bookings
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
                {/* Step 1: Property Information */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2 font-montserrat">Property Information</h2>
                      <p className="text-muted-foreground font-nunito">Tell us about your property</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                          Property Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Sunrise Apartments"
                          value={formData.propertyName}
                          onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                          Property Type *
                        </label>
                        <select
                          value={formData.propertyType}
                          onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                        >
                          <option value="apartment">Apartment Complex</option>
                          <option value="standalone">Standalone Building</option>
                          <option value="gated">Gated Community</option>
                          <option value="commercial">Commercial Building</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                        Property Description *
                      </label>
                      <textarea
                        placeholder="Describe your property, its features, and what makes it special..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={5}
                        className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                        Property Rules & Policies
                      </label>
                      <textarea
                        placeholder="e.g., No pets allowed, Quiet hours from 10 PM to 6 AM, Visitors must register at reception..."
                        value={formData.rules}
                        onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito resize-none"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Location & Amenities */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2 font-montserrat">Location & Amenities</h2>
                      <p className="text-muted-foreground font-nunito">Where is your property located?</p>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground font-montserrat">Location Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                            County *
                          </label>
                          <select
                            value={formData.county}
                            onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          >
                            <option value="Nairobi">Nairobi</option>
                            <option value="Kiambu">Kiambu</option>
                            <option value="Machakos">Machakos</option>
                            <option value="Kajiado">Kajiado</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                            Area/Estate *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Kilimani, Westlands"
                            value={formData.area}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            placeholder="Enter street address"
                            value={formData.street}
                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                            Distance to Main Road
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., 500m"
                            value={formData.distanceToRoad}
                            onChange={(e) => setFormData({ ...formData, distanceToRoad: e.target.value })}
                            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                            Distance to School
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., 1km"
                            value={formData.distanceToSchool}
                            onChange={(e) => setFormData({ ...formData, distanceToSchool: e.target.value })}
                            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                            Distance to Market/Mall
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., 2km"
                            value={formData.distanceToMarket}
                            onChange={(e) => setFormData({ ...formData, distanceToMarket: e.target.value })}
                            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground font-montserrat">Property Amenities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {amenitiesList.map((amenity) => (
                          <button
                            key={amenity.label}
                            onClick={() => toggleAmenity(amenity.label)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                              formData.selectedAmenities.includes(amenity.label)
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50 hover:bg-muted"
                            }`}
                          >
                            <amenity.icon
                              className={`h-6 w-6 mb-2 ${
                                formData.selectedAmenities.includes(amenity.label)
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            />
                            <span
                              className={`text-xs font-medium font-nunito text-center ${
                                formData.selectedAmenities.includes(amenity.label) ? "text-primary" : "text-foreground"
                              }`}
                            >
                              {amenity.label}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                          Additional Amenities
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Playground, Laundry room, Rooftop terrace (comma separated)"
                          value={formData.customAmenities}
                          onChange={(e) => setFormData({ ...formData, customAmenities: e.target.value })}
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Images & Documents */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2 font-montserrat">Images & Documents</h2>
                      <p className="text-muted-foreground font-nunito">
                        Upload property images and lease agreement template
                      </p>
                    </div>

                    {/* Property Images */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground font-montserrat">Property Images *</h3>
                      <p className="text-sm text-muted-foreground font-nunito">
                        Upload exterior and common area photos (Max 10 images, 5MB each)
                      </p>

                      <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors">
                        <label className="cursor-pointer flex flex-col items-center">
                          <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                          <span className="text-sm font-medium text-foreground mb-1 font-nunito">
                            Click to upload images
                          </span>
                          <span className="text-xs text-muted-foreground font-nunito">PNG, JPG up to 5MB each</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handlePropertyImagesUpload(e.target.files)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {formData.propertyImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {formData.propertyImages.map((file, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(file) || "/placeholder.svg"}
                                alt={`Property ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => removePropertyImage(index)}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-foreground font-montserrat">
                          Or paste image URLs (comma or newline separated)
                        </label>
                        <textarea
                          placeholder="https://images.unsplash.com/...\nhttps://images.unsplash.com/..."
                          value={formData.propertyImageUrls}
                          onChange={(e) => setFormData({ ...formData, propertyImageUrls: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito resize-none"
                        />
                        {parsedPropertyImageUrls.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {parsedPropertyImageUrls.slice(0, 8).map((url, index) => (
                              <div key={url} className="relative group">
                                <img
                                  src={url}
                                  alt={`URL Image ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Lease Agreement */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground font-montserrat">
                        Lease Agreement Template
                      </h3>
                      <p className="text-sm text-muted-foreground font-nunito">
                        Upload your standard lease agreement (PDF format)
                      </p>

                      <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors">
                        <label className="cursor-pointer flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg tyrent-gradient flex items-center justify-center shrink-0">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground mb-1 font-nunito">
                              {formData.leaseAgreement ? formData.leaseAgreement.name : "Upload lease agreement"}
                            </p>
                            <p className="text-xs text-muted-foreground font-nunito">PDF up to 10MB</p>
                          </div>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setFormData({ ...formData, leaseAgreement: e.target.files?.[0] || null })}
                            className="hidden"
                          />
                          <Button type="button" variant="outline" size="sm" className="font-nunito bg-transparent">
                            {formData.leaseAgreement ? "Change" : "Browse"}
                          </Button>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Add Units */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2 font-montserrat">Add Units/Rooms</h2>
                      <p className="text-muted-foreground font-nunito">
                        Add individual units or rooms available in this property
                      </p>
                    </div>

                    {/* Added Units List */}
                    {formData.units.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-foreground font-montserrat">
                          Added Units ({formData.units.length})
                        </h3>
                        {formData.units.map((unit) => (
                          <div key={unit.id} className="border border-border rounded-lg p-4 flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-foreground font-montserrat">
                                  Unit {unit.unitNumber}
                                </h4>
                                <Badge variant="outline">{unit.type}</Badge>
                                <Badge variant={unit.status === "vacant" ? "default" : "secondary"}>
                                  {unit.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground font-nunito">
                                {unit.bedrooms} BR • {unit.bathrooms} BA • {unit.size} sqft • KES{" "}
                                {unit.rent.toLocaleString()}/month
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeUnit(unit.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Unit Form */}
                    <div className="border-2 border-primary/20 rounded-lg p-6 bg-primary/5">
                      <h3 className="text-lg font-semibold text-foreground mb-4 font-montserrat">Add New Unit</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                            Unit Number/ID *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., A101, B2, House 5"
                            value={currentUnit.unitNumber}
                            onChange={(e) => setCurrentUnit({ ...currentUnit, unitNumber: e.target.value })}
                            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                            Category *
                          </label>
                          <select
                            value={currentUnit.category}
                            onChange={(e) => setCurrentUnit({ ...currentUnit, category: e.target.value })}
                            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          >
                            <option value="living">Living Space</option>
                            <option value="office">Office Space</option>
                            <option value="business">Business Space</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                            Unit Type *
                          </label>
                          <select
                            value={currentUnit.type}
                            onChange={(e) => setCurrentUnit({ ...currentUnit, type: e.target.value })}
                            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          >
                            <option value="bedsitter">Bedsitter</option>
                            <option value="1bedroom">1 Bedroom</option>
                            <option value="2bedroom">2 Bedrooms</option>
                            <option value="3bedroom">3 Bedrooms</option>
                            <option value="4bedroom">4+ Bedrooms</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                            Bedrooms
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={currentUnit.bedrooms}
                            onChange={(e) =>
                              setCurrentUnit({ ...currentUnit, bedrooms: Number.parseInt(e.target.value) })
                            }
                            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                            Bathrooms
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={currentUnit.bathrooms}
                            onChange={(e) =>
                              setCurrentUnit({ ...currentUnit, bathrooms: Number.parseInt(e.target.value) })
                            }
                            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                            Size (sqft)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={currentUnit.size}
                            onChange={(e) => setCurrentUnit({ ...currentUnit, size: Number.parseInt(e.target.value) })}
                            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                            Monthly Rent (KES) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={currentUnit.rent}
                            onChange={(e) => setCurrentUnit({ ...currentUnit, rent: Number.parseInt(e.target.value) })}
                            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                            Deposit (KES) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={currentUnit.deposit}
                            onChange={(e) =>
                              setCurrentUnit({ ...currentUnit, deposit: Number.parseInt(e.target.value) })
                            }
                            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                            Status *
                          </label>
                          <select
                            value={currentUnit.status}
                            onChange={(e) =>
                              setCurrentUnit({ ...currentUnit, status: e.target.value as "vacant" | "occupied" })
                            }
                            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          >
                            <option value="vacant">Vacant</option>
                            <option value="occupied">Occupied</option>
                          </select>
                        </div>
                      </div>

                      {/* Unit Images */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                          Unit Images *
                        </label>
                        <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary transition-colors">
                          <label className="cursor-pointer flex items-center gap-3">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium text-foreground font-nunito">Upload unit images</p>
                              <p className="text-xs text-muted-foreground font-nunito">Interior and exterior photos</p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleUnitImagesUpload(e.target.files)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {currentUnit.images.length > 0 && (
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-3">
                            {currentUnit.images.map((file, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={URL.createObjectURL(file) || "/placeholder.svg"}
                                  alt={`Unit ${index + 1}`}
                                  className="w-full h-20 object-cover rounded-lg"
                                />
                                <button
                                  onClick={() => removeUnitImage(index)}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={addUnit}
                        disabled={!currentUnit.unitNumber || !currentUnit.rent}
                        className="w-full tyrent-gradient text-white font-nunito"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add This Unit
                      </Button>
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
                  <Button onClick={handleNext} className="tyrent-gradient text-white font-nunito">
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={formData.units.length === 0}
                    className="tyrent-gradient text-white font-nunito"
                  >
                    {isSubmitting ? "Publishing..." : editId ? "Save Changes" : "Publish Listing"}
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
        </div>
      </div>
    </div>
  )
}
