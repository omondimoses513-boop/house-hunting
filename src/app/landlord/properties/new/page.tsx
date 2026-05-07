"use client"

import { useEffect, useMemo, useState } from "react"
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
  Loader2,
} from "lucide-react"
import { PageRoutes } from "@/constants/page-routes"
import { ApiError } from "@/lib/api/client"
import {
  backendListAmenities,
  backendListApartments,
  backendCreateApartment,
  backendCreateApartmentForm,
  backendCreateUnit,
  backendGetApartment,
  backendListAmenityDistances,
  backendListUnits,
  backendSetAmenityDistances,
  backendUpdateApartment,
  backendUpdateApartmentForm,
  backendUpdateUnit,
  backendUploadLeaseAgreement,
  backendUploadApartmentImage,
  backendUploadUnitImages,
} from "@/lib/api/properties"
import { backendCheckSubscription } from "@/lib/api/wallet"

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
  interiorImages: File[]
  exteriorImages: File[]
}

export default function NewPropertyListing() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")

  const [subscriptionChecked, setSubscriptionChecked] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [amenityOptions, setAmenityOptions] = useState<Array<{ id: string; name: string }>>([])
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
    latitude: "",
    longitude: "",
    distanceToRoad: "",
    distanceToSchool: "",
    distanceToMarket: "",

    // Amenities
    selectedAmenities: [] as string[],
    selectedAmenityIds: [] as string[],
    customAmenities: "",

    // Images & Documents
    propertyImages: [] as File[],
    propertyImageUrls: "" as string,
    virtualTourUrl: "" as string,
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
    interiorImages: [],
    exteriorImages: [],
  })
  const [unitUploadType, setUnitUploadType] = useState<"interior" | "exterior">("interior")

  const progress = (currentStep / steps.length) * 100

  const parseBedroomsFromUnitType = (unitType?: string | null) => {
    const t = String(unitType || "").toLowerCase()
    if (!t) return 1
    if (t.includes("bedsitter") || t.includes("studio")) return 0
    const m = t.match(/(\d+)/)
    if (m) return Number(m[1])
    return 1
  }

  const parseDistanceKm = (raw: string): number | null => {
    const s = raw.trim().toLowerCase()
    if (!s) return null
    const match = s.match(/(\d+(\.\d+)?)/)
    if (!match) return null
    const value = Number(match[1])
    if (!Number.isFinite(value)) return null
    if (s.includes("km")) return value
    if (s.includes("m")) return value / 1000
    return value
  }

  useEffect(() => {
    let cancelled = false
    const loadEdit = async () => {
      if (!editId) return
      try {
        const apt = await backendGetApartment(editId)
        const units = await backendListUnits({ apartment: apt.id })
        const distances = await backendListAmenityDistances(apt.id).catch(() => [])
        if (cancelled) return

        const address = (apt.address ?? "").toString()
        const parts = address.split(",").map((s) => s.trim()).filter(Boolean)
        const street = parts[0] ?? ""
        const area = parts[1] ?? ""
        const county = parts[2] ?? "Nairobi"

        setFormData((prev) => ({
          ...prev,
          propertyName: apt.name ?? "",
          propertyType: "apartment",
          description: apt.overview_description ?? "",
          rules: (() => {
            const raw = (apt.rules_and_policies ?? "").toString()
            const marker = "\n\nAmenities:"
            const idx = raw.indexOf(marker)
            return idx >= 0 ? raw.slice(0, idx).trim() : raw
          })(),

          county,
          area,
          street,
          latitude: apt.latitude ? String(apt.latitude) : "",
          longitude: apt.longitude ? String(apt.longitude) : "",
          distanceToRoad: (() => {
            const d = (distances ?? []).find((x: any) => String(x.amenity_type).toUpperCase() === "ROAD")
            return d?.distance_km ? String(d.distance_km) : ""
          })(),
          distanceToSchool: (() => {
            const d = (distances ?? []).find((x: any) => String(x.amenity_type).toUpperCase() === "SCHOOL")
            return d?.distance_km ? String(d.distance_km) : ""
          })(),
          distanceToMarket: (() => {
            const d = (distances ?? []).find((x: any) => String(x.amenity_type).toUpperCase() === "MARKET")
            return d?.distance_km ? String(d.distance_km) : ""
          })(),

          selectedAmenities: [],
          selectedAmenityIds: (apt.amenities ?? []).map((a: any) => String(a.id)).filter(Boolean),
          customAmenities: (() => {
            const raw = (apt.rules_and_policies ?? "").toString()
            const m = raw.match(/\n\nAmenities:\s*([^\n]+)\s*$/)
            return m?.[1] ? String(m[1]).trim() : ""
          })(),

          propertyImages: [],
          propertyImageUrls: apt.exterior_image_url ? String(apt.exterior_image_url) : "",
          virtualTourUrl: apt.virtual_tour_url ? String(apt.virtual_tour_url) : "",
          leaseAgreement: null,

          units: (units ?? []).map((u) => ({
            id: String(u.id),
            unitNumber: String(u.unit_number_or_id ?? ""),
            category: String(u.category ?? "living"),
            type: String(u.type ?? "1bedroom"),
            bedrooms: parseBedroomsFromUnitType(String(u.type ?? "")),
            bathrooms: 1,
            size: Number(u.size_sqft ?? 0),
            rent: Number(u.price_per_month ?? 0),
            deposit: 0,
            status: String(u.status ?? "").toUpperCase() === "OCCUPIED" ? "occupied" : "vacant",
            interiorImages: [],
            exteriorImages: [],
          })),
        }))
        setCurrentStep(1)
      } catch {
        // If we can't load the listing, keep the create flow and allow user to re-publish.
      }
    }
    void loadEdit()
    return () => {
      cancelled = true
    }
  }, [editId])

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const sub = await backendCheckSubscription()
        if (!sub.has_active) {
          setHasActiveSubscription(false)
          router.replace(PageRoutes.LANDLORD_PROPERTY_CHECKOUT)
          return
        }
        setHasActiveSubscription(true)
      } catch {
        setHasActiveSubscription(false)
        router.replace(PageRoutes.LANDLORD_PROPERTY_CHECKOUT)
        return
      }
      setSubscriptionChecked(true)
    }
    void checkSubscription()
  }, [router])

  useEffect(() => {
    let cancelled = false
    const loadAmenityOptions = async () => {
      try {
        const items = await backendListAmenities()
        if (!cancelled && Array.isArray(items)) {
          setAmenityOptions(items.map((a) => ({ id: String(a.id), name: String(a.name) })))
          return
        }
      } catch {
        // Fallback below if amenities endpoint is not exposed.
      }

      try {
        const apartments = await backendListApartments()
        const map = new Map<string, string>()
        for (const apt of apartments ?? []) {
          for (const a of apt.amenities ?? []) {
            if (a?.id && a?.name) map.set(String(a.id), String(a.name))
          }
        }
        if (!cancelled) {
          setAmenityOptions(Array.from(map.entries()).map(([id, name]) => ({ id, name })))
        }
      } catch {
        if (!cancelled) setAmenityOptions([])
      }
    }
    void loadAmenityOptions()
    return () => {
      cancelled = true
    }
  }, [])
  
  // Show a loading state while checking subscription
  if (hasActiveSubscription === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const parsedPropertyImageUrls = (formData.propertyImageUrls || "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => /^https?:\/\//i.test(s))

  const deriveAmenitiesForBackendNotes = () => {
    const map = new Map(amenityOptions.map((a) => [a.id, a.name]))
    const pickedFromIds = (formData.selectedAmenityIds ?? [])
      .map((id) => map.get(id))
      .filter((s): s is string => Boolean(s))
      .map((s) => s.trim())
      .filter(Boolean)
    const pickedLegacy = (formData.selectedAmenities ?? []).map((s) => s.trim()).filter(Boolean)
    const extra = (formData.customAmenities ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    const all = Array.from(new Set([...pickedFromIds, ...pickedLegacy, ...extra]))
    return all
  }

  const buildRulesPayload = () => {
    const base = (formData.rules ?? "").trim()
    const amenities = deriveAmenitiesForBackendNotes()
    if (amenities.length === 0) return base
    const suffix = `\n\nAmenities: ${amenities.join(", ")}`
    return base ? `${base}${suffix}` : suffix.trim()
  }

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

  const toggleAmenity = (amenityId: string) => {
    setFormData({
      ...formData,
      selectedAmenityIds: formData.selectedAmenityIds.includes(amenityId)
        ? formData.selectedAmenityIds.filter((a) => a !== amenityId)
        : [...formData.selectedAmenityIds, amenityId],
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
      const picked = Array.from(files)
      setCurrentUnit({
        ...currentUnit,
        interiorImages:
          unitUploadType === "interior" ? [...currentUnit.interiorImages, ...picked] : currentUnit.interiorImages,
        exteriorImages:
          unitUploadType === "exterior" ? [...currentUnit.exteriorImages, ...picked] : currentUnit.exteriorImages,
      })
    }
  }

  const removeUnitImage = (type: "interior" | "exterior", index: number) => {
    setCurrentUnit({
      ...currentUnit,
      interiorImages:
        type === "interior" ? currentUnit.interiorImages.filter((_, i) => i !== index) : currentUnit.interiorImages,
      exteriorImages:
        type === "exterior" ? currentUnit.exteriorImages.filter((_, i) => i !== index) : currentUnit.exteriorImages,
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
      interiorImages: [],
      exteriorImages: [],
    })
    setUnitUploadType("interior")
  }

  const removeUnit = (id: string) => {
    setFormData({
      ...formData,
      units: formData.units.filter((u) => u.id !== id),
    })
  }

  const handleSubmit = async () => {
    setSubmitError(null)

    const missingStep1 = !formData.propertyName.trim() || !formData.description.trim()
    const missingStep2 = !formData.street.trim()
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
      setSubmitError("Please fill in the required Location field (Street Address).")
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
    let createdApartment: { id: string } | null = null
    
    try {
      const address = [formData.street.trim(), formData.area.trim(), formData.county].filter(Boolean).join(", ")
      const overview_description = formData.description.trim()
      const rules_and_policies = buildRulesPayload()
      const virtual_tour_url = formData.virtualTourUrl.trim()
      const latitude = formData.latitude.trim() ? Number(formData.latitude.trim()) : null
      const longitude = formData.longitude.trim() ? Number(formData.longitude.trim()) : null

      const firstUrl = parsedPropertyImageUrls[0] ?? ""
      const firstFile = formData.propertyImages[0] ?? null

      const apartment = editId
        ? await (firstFile
            ? (() => {
                const fd = new FormData()
                fd.append("name", formData.propertyName.trim())
                fd.append("address", address)
                fd.append("overview_description", overview_description)
                fd.append("rules_and_policies", rules_and_policies)
                for (const amenityId of formData.selectedAmenityIds) fd.append("amenity_ids", amenityId)
                if (firstUrl) fd.append("exterior_image_url", firstUrl)
                if (virtual_tour_url) fd.append("virtual_tour_url", virtual_tour_url)
                if (typeof latitude === "number" && Number.isFinite(latitude)) fd.append("latitude", String(latitude))
                if (typeof longitude === "number" && Number.isFinite(longitude)) fd.append("longitude", String(longitude))
                fd.append("exterior_image", firstFile)
                return backendUpdateApartmentForm(editId, fd)
              })()
            : backendUpdateApartment(editId, {
                name: formData.propertyName.trim(),
                address,
                overview_description,
                rules_and_policies,
                amenity_ids: formData.selectedAmenityIds,
                exterior_image_url: firstUrl || undefined,
                virtual_tour_url: virtual_tour_url || undefined,
                latitude: typeof latitude === "number" && Number.isFinite(latitude) ? latitude : null,
                longitude: typeof longitude === "number" && Number.isFinite(longitude) ? longitude : null,
              }))
        : await (firstFile
            ? (() => {
                const fd = new FormData()
                fd.append("name", formData.propertyName.trim())
                fd.append("address", address)
                fd.append("overview_description", overview_description)
                fd.append("rules_and_policies", rules_and_policies)
                for (const amenityId of formData.selectedAmenityIds) fd.append("amenity_ids", amenityId)
                if (firstUrl) fd.append("exterior_image_url", firstUrl)
                if (virtual_tour_url) fd.append("virtual_tour_url", virtual_tour_url)
                if (typeof latitude === "number" && Number.isFinite(latitude)) fd.append("latitude", String(latitude))
                if (typeof longitude === "number" && Number.isFinite(longitude)) fd.append("longitude", String(longitude))
                fd.append("exterior_image", firstFile)
                return backendCreateApartmentForm(fd)
              })()
            : backendCreateApartment({
                name: formData.propertyName.trim(),
                address,
                overview_description,
                rules_and_policies,
                amenity_ids: formData.selectedAmenityIds,
                exterior_image_url: firstUrl || undefined,
                virtual_tour_url: virtual_tour_url || undefined,
                latitude: typeof latitude === "number" && Number.isFinite(latitude) ? latitude : null,
                longitude: typeof longitude === "number" && Number.isFinite(longitude) ? longitude : null,
              }))

      createdApartment = apartment
      // If we have more than one uploaded image, push the first extra one via the dedicated upload endpoint.
      if (formData.propertyImages.length > 1) {
        for (const img of formData.propertyImages.slice(1, 6)) {
          try {
            await backendUploadApartmentImage(apartment.id, img)
          } catch {
            // non-fatal
          }
        }
      }

      const roadKm = parseDistanceKm(formData.distanceToRoad)
      const schoolKm = parseDistanceKm(formData.distanceToSchool)
      const marketKm = parseDistanceKm(formData.distanceToMarket)
      const distanceItems = [
        roadKm !== null ? { amenity_type: "ROAD", distance_km: roadKm } : null,
        schoolKm !== null ? { amenity_type: "SCHOOL", distance_km: schoolKm } : null,
        marketKm !== null ? { amenity_type: "MARKET", distance_km: marketKm } : null,
      ].filter(Boolean) as Array<{ amenity_type: string; distance_km: number }>

      if (distanceItems.length > 0) {
        try {
          await backendSetAmenityDistances(apartment.id, distanceItems)
        } catch {
          // non-fatal
        }
      }

      // Units: update existing (uuid) and create new.
      for (const u of formData.units) {
        const payload = {
          apartment: apartment.id,
          unit_number_or_id: u.unitNumber.trim(),
          category: u.category,
          type: u.type,
          size_sqft: u.size,
          price_per_month: u.rent,
          status: u.status === "occupied" ? "OCCUPIED" : "VACANT",
          description: "",
        }
        const isBackendId = typeof u.id === "string" && u.id.includes("-") && u.id.length > 20
        let savedUnitId = u.id
        if (editId && isBackendId) {
          const updated = await backendUpdateUnit(u.id, {
            unit_number_or_id: payload.unit_number_or_id,
            category: payload.category,
            type: payload.type,
            size_sqft: payload.size_sqft,
            price_per_month: payload.price_per_month,
            status: payload.status,
          })
          savedUnitId = String(updated.id)
        } else {
          const created = await backendCreateUnit(payload)
          savedUnitId = String(created.id)
        }

        if (savedUnitId) {
          try {
            if (u.interiorImages.length > 0) {
              await backendUploadUnitImages(savedUnitId, u.interiorImages, "interior")
            }
            if (u.exteriorImages.length > 0) {
              await backendUploadUnitImages(savedUnitId, u.exteriorImages, "exterior")
            }
          } catch {
            // non-fatal
          }
        }
      }

      // Lease agreement upload (optional)
      if (formData.leaseAgreement) {
        try {
          await backendUploadLeaseAgreement(apartment.id, formData.leaseAgreement)
        } catch {
          // non-fatal
        }
      }

      // Redirect to checkout for subscription payment
      const propertyPayload = {
        id: apartment.id,  // ← must be the real UUID from the backend response
        propertyName: formData.propertyName.trim(),
        address: [formData.street.trim(), formData.area.trim(), formData.county].filter(Boolean).join(", "),
        description: formData.description.trim(),
        units: formData.units.length,
      }
      
      console.log("Redirecting with apartment id:", apartment.id) // add this to debug
      
      router.push(
        `${PageRoutes.LANDLORD_PROPERTY_CHECKOUT}?property=${encodeURIComponent(JSON.stringify(propertyPayload))}`
      )

  } catch (e) {
    const msg =
      e instanceof ApiError
        ? e.message
        : e instanceof Error
          ? e.message
          : "Failed to publish listing. Please try again."

    if (
      msg.toLowerCase().includes("subscription") ||
      msg.toLowerCase().includes("payment before listing")
    ) {
      // If apartment was created before the error, pass its id
      // If not (error happened at creation), redirect without id
      if (createdApartment) {
        const propertyPayload = {
          id: createdApartment.id,
          propertyName: formData.propertyName.trim(),
          address: [formData.street.trim(), formData.area.trim(), formData.county].filter(Boolean).join(", "),
          description: formData.description.trim(),
          units: formData.units.length,
        }
        router.push(
          `${PageRoutes.LANDLORD_PROPERTY_CHECKOUT}?property=${encodeURIComponent(JSON.stringify(propertyPayload))}`
        )
      } else {
        router.push(PageRoutes.LANDLORD_PROPERTY_CHECKOUT)
      }
      return
    }

    setSubmitError(msg)
  } finally {
    setIsSubmitting(false)
  }
}

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        {hasActiveSubscription === false && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-yellow-800 dark:text-yellow-200 font-montserrat">
              Subscription Required
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 font-nunito">
              You need an active subscription to publish a listing.
            </p>
          </div>
          <Button
            onClick={() => router.push(PageRoutes.LANDLORD_PROPERTY_CHECKOUT)}
            className="tyrent-gradient text-white font-nunito shrink-0 ml-4"
          >
            Subscribe Now
          </Button>
        </div>
      )}
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
                          Status
                        </label>
                        <div className="w-full px-4 py-3 border border-input rounded-lg bg-muted/40 text-sm text-muted-foreground font-nunito">
                          Created as <span className="font-semibold">NOT_REQUESTED</span> (admin verification comes later)
                        </div>
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
                            Latitude (optional)
                          </label>
                          <input
                            type="number"
                            inputMode="decimal"
                            placeholder="-1.286389"
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                            className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                            Longitude (optional)
                          </label>
                          <input
                            type="number"
                            inputMode="decimal"
                            placeholder="36.817223"
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
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
                        {(amenityOptions.length > 0
                          ? amenityOptions.map((a) => ({ id: a.id, label: a.name }))
                          : amenitiesList.map((a) => ({ id: a.label, label: a.label }))
                        ).map((amenity) => (
                          <button
                            key={amenity.id}
                            onClick={() => toggleAmenity(amenity.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                              formData.selectedAmenityIds.includes(amenity.id) || formData.selectedAmenities.includes(amenity.label)
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50 hover:bg-muted"
                            }`}
                          >
                            <CheckCircle2
                              className={`h-6 w-6 mb-2 ${
                                formData.selectedAmenityIds.includes(amenity.id) || formData.selectedAmenities.includes(amenity.label)
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            />
                            <span
                              className={`text-xs font-medium font-nunito text-center ${
                                formData.selectedAmenityIds.includes(amenity.id) || formData.selectedAmenities.includes(amenity.label)
                                  ? "text-primary"
                                  : "text-foreground"
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

                    {/* Virtual tour */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground font-montserrat">
                        Virtual tour URL (optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={formData.virtualTourUrl}
                        onChange={(e) => setFormData({ ...formData, virtualTourUrl: e.target.value })}
                        className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                      />
                      <p className="text-xs text-muted-foreground font-nunito">
                        If you have a 360 tour link, paste it here.
                      </p>
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
                              <p className="text-xs text-muted-foreground font-nunito mt-1">
                                Interior photos: {unit.interiorImages.length} • Exterior photos: {unit.exteriorImages.length}
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
                            value={Number.isFinite(currentUnit.bedrooms) ? currentUnit.bedrooms : 0}
                            onChange={(e) =>
                              setCurrentUnit({
                                ...currentUnit,
                                bedrooms: e.target.value === "" ? 0 : Number.parseInt(e.target.value, 10),
                              })
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
                            value={Number.isFinite(currentUnit.bathrooms) ? currentUnit.bathrooms : 1}
                            onChange={(e) =>
                              setCurrentUnit({
                                ...currentUnit,
                                bathrooms: e.target.value === "" ? 1 : Number.parseInt(e.target.value, 10),
                              })
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
                            value={Number.isFinite(currentUnit.size) ? currentUnit.size : 0}
                            onChange={(e) =>
                              setCurrentUnit({
                                ...currentUnit,
                                size: e.target.value === "" ? 0 : Number.parseInt(e.target.value, 10),
                              })
                            }
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
                            value={Number.isFinite(currentUnit.rent) ? currentUnit.rent : 0}
                            onChange={(e) =>
                              setCurrentUnit({
                                ...currentUnit,
                                rent: e.target.value === "" ? 0 : Number.parseInt(e.target.value, 10),
                              })
                            }
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
                            value={Number.isFinite(currentUnit.deposit) ? currentUnit.deposit : 0}
                            onChange={(e) =>
                              setCurrentUnit({
                                ...currentUnit,
                                deposit: e.target.value === "" ? 0 : Number.parseInt(e.target.value, 10),
                              })
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
                          Unit Images
                        </label>
                        <div className="mb-3 max-w-xs">
                          <select
                            value={unitUploadType}
                            onChange={(e) => setUnitUploadType(e.target.value === "exterior" ? "exterior" : "interior")}
                            className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito text-sm"
                          >
                            <option value="interior">Interior photos</option>
                            <option value="exterior">Exterior photos</option>
                          </select>
                        </div>
                        <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary transition-colors">
                          <label className="cursor-pointer flex items-center gap-3">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium text-foreground font-nunito">Upload unit images</p>
                              <p className="text-xs text-muted-foreground font-nunito">
                                Selected type: {unitUploadType}
                              </p>
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

                        {(currentUnit.interiorImages.length > 0 || currentUnit.exteriorImages.length > 0) && (
                          <div className="space-y-4 mt-3">
                            {currentUnit.interiorImages.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-foreground mb-2 font-montserrat">
                                  Interior ({currentUnit.interiorImages.length})
                                </p>
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                  {currentUnit.interiorImages.map((file, index) => (
                                    <div key={`interior-${index}`} className="relative group">
                                      <img
                                        src={URL.createObjectURL(file) || "/placeholder.svg"}
                                        alt={`Interior ${index + 1}`}
                                        className="w-full h-20 object-cover rounded-lg"
                                      />
                                      <button
                                        onClick={() => removeUnitImage("interior", index)}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {currentUnit.exteriorImages.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-foreground mb-2 font-montserrat">
                                  Exterior ({currentUnit.exteriorImages.length})
                                </p>
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                  {currentUnit.exteriorImages.map((file, index) => (
                                    <div key={`exterior-${index}`} className="relative group">
                                      <img
                                        src={URL.createObjectURL(file) || "/placeholder.svg"}
                                        alt={`Exterior ${index + 1}`}
                                        className="w-full h-20 object-cover rounded-lg"
                                      />
                                      <button
                                        onClick={() => removeUnitImage("exterior", index)}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
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
