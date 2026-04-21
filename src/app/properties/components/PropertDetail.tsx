"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { PageRoutes } from "@/constants/page-routes"
import { getFavorites, submitReport, toggleFavorite } from "@/lib/user-preferences"
import { ApiError } from "@/lib/api/client"
import { backendGetApartment, backendListApartments, type BackendApartment, type BackendUnit } from "@/lib/api/properties"
import {
  Star,
  Heart,
  Share2,
  MapPin,
  MapPinIcon,
  Home,
  BedDouble,
  Bath,
  Maximize,
  CheckCircle2,
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  X,
  Video,
  Clock,
  FileText,
} from "lucide-react"

export default function PropertyDetail() {
  const params = useParams()
  const slug = params?.slug as string

  const [apartment, setApartment] = useState<BackendApartment | null>(null)
  const [similar, setSimilar] = useState<BackendApartment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/+$/, "")
  const absolutizeUrl = (url?: string | null) => {
    if (!url) return ""
    return url.startsWith("http://") || url.startsWith("https://") ? url : `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`
  }

  const cheapestUnit = (units?: BackendUnit[]) => {
    if (!Array.isArray(units) || units.length === 0) return null
    let best: BackendUnit | null = null
    let bestPrice = Number.POSITIVE_INFINITY
    for (const u of units) {
      const p = Number((u as any).price_per_month ?? Number.POSITIVE_INFINITY)
      if (Number.isFinite(p) && p < bestPrice) {
        bestPrice = p
        best = u
      }
    }
    return best
  }

  const parseBedrooms = (unitType?: string | null) => {
    const t = String(unitType || "").toLowerCase()
    if (!t) return null
    if (t.includes("bedsitter") || t.includes("studio")) return 0
    const m = t.match(/(\d+)/)
    if (m) return Number(m[1])
    return null
  }

  const toUnitTypeLabel = (unitType?: string | null) => {
    const raw = String(unitType || "").trim()
    if (!raw) return "Unit"
    const lower = raw.toLowerCase()
    if (lower === "bedsitter" || lower === "studio") return "Bedsitter"
    if (/^\d+bed(room)?$/i.test(lower)) {
      const n = lower.match(/\d+/)?.[0] ?? ""
      return `${n} Bedroom`
    }
    return raw
  }

  const getDistanceKm = (
    items: Array<{ amenity_type: string; amenity_type_display?: string; distance_km: number }>,
    target: "ROAD" | "SCHOOL" | "MARKET",
  ) => {
    const t = target.toUpperCase()
    const hit = items.find((x) => {
      const raw = String(x.amenity_type || "").toUpperCase()
      const disp = String(x.amenity_type_display || "").toUpperCase()
      return raw === t || raw.includes(t) || disp.includes(t)
    })
    if (!hit || !Number.isFinite(hit.distance_km) || hit.distance_km <= 0) return "--"
    return `${hit.distance_km} km`
  }

  const collectImages = (apt: BackendApartment) => {
    const urls: string[] = []
    const push = (u?: string | null) => {
      const v = absolutizeUrl(u)
      if (v) urls.push(v)
    }
    push(apt.exterior_image_url)
    push(apt.exterior_image)
    for (const unit of apt.units ?? []) {
      const interior = (unit as any).interior_images
      const exterior = (unit as any).exterior_images
      if (Array.isArray(interior)) for (const u of interior) if (typeof u === "string") push(u)
      if (Array.isArray(exterior)) for (const u of exterior) if (typeof u === "string") push(u)
    }
    return Array.from(new Set(urls)).filter(Boolean)
  }

  const property = useMemo(() => {
    if (!apartment) return null
    const unit = cheapestUnit(apartment.units)
    const price = Number(unit?.price_per_month ?? 0)
    const size = Number(unit?.size_sqft ?? 0)
    const bedrooms = parseBedrooms((unit as any)?.type ?? null)
    const bathrooms = 1
    const verified = (apartment.verification_status ?? "").toString().toUpperCase() === "VERIFIED"
    const images = collectImages(apartment)
    const latNum = typeof apartment.latitude === "number" ? apartment.latitude : Number(apartment.latitude ?? 0)
    const lngNum = typeof apartment.longitude === "number" ? apartment.longitude : Number(apartment.longitude ?? 0)
    const hasCoords = Number.isFinite(latNum) && Number.isFinite(lngNum) && (latNum !== 0 || lngNum !== 0)
    const landlord = apartment.landlord_info
    const landlordName = (landlord?.full_name || landlord?.username || "").toString().trim()
    return {
      id: apartment.id,
      title: apartment.name,
      location: apartment.address || "No address provided",
      area: apartment.address || "",
      price,
      bedrooms,
      bathrooms,
      size,
      images: images.length ? images : ["/placeholder.svg"],
      amenities: (apartment.amenities ?? []).map((a) => a.name).filter(Boolean),
      rating: typeof apartment.average_rating === "number" ? apartment.average_rating : 0,
      reviews: typeof apartment.review_count === "number" ? apartment.review_count : 0,
      verified,
      description: apartment.overview_description || "",
      rules: apartment.rules_and_policies || "",
      virtualTourUrl: apartment.virtual_tour_url || "",
      amenityDistances: (apartment.amenity_distances ?? []).map((d) => ({
        amenity_type: String(d.amenity_type || ""),
        amenity_type_display: d.amenity_type_display ? String(d.amenity_type_display) : undefined,
        distance_km: Number(d.distance_km ?? 0),
        nearest_name: d.nearest_name ? String(d.nearest_name) : undefined,
      })),
      leaseAgreementUrl: apartment.lease_agreement?.document ? absolutizeUrl(apartment.lease_agreement.document) : "",
      highlights: [] as string[],
      features: [] as string[],
      hasBalcony: false,
      walkToTransit: 0,
      walkToMainRoad: 0,
      mapLocation: {
        lat: hasCoords ? latNum : 0,
        lng: hasCoords ? lngNum : 0,
        address: apartment.address || "",
      },
      landlord: {
        name: landlordName || `Landlord ${(apartment.landlord ?? "").toString().slice(0, 8)}`,
        avatar: "",
        verified: false,
        joinedDate: "",
        phone: landlord?.phone_number ? String(landlord.phone_number) : "",
        email: landlord?.email ? String(landlord.email) : "",
      },
    }
  }, [apartment])

  const availableUnits = useMemo(() => {
    if (!apartment?.units?.length) return []
    return apartment.units.map((u) => {
      const interior = Array.isArray((u as any).interior_images) ? ((u as any).interior_images as string[]) : []
      const exterior = Array.isArray((u as any).exterior_images) ? ((u as any).exterior_images as string[]) : []
      const images = [...interior, ...exterior].map((img) => absolutizeUrl(img)).filter(Boolean)
      const rent = Number((u as any).price_per_month ?? 0)
      const size = Number((u as any).size_sqft ?? 0)
      const status = String((u as any).status ?? "VACANT").toUpperCase()
      return {
        id: String(u.id),
        unitNumber: String((u as any).unit_number_or_id ?? ""),
        typeLabel: toUnitTypeLabel((u as any).type),
        rent,
        size,
        status,
        images,
      }
    })
  }, [apartment, absolutizeUrl])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!slug) return
      setLoading(true)
      setLoadError(null)
      try {
        const [apt, all] = await Promise.all([backendGetApartment(slug), backendListApartments()])
        if (cancelled) return
        setApartment(apt)
        setSimilar((all ?? []).filter((a) => a?.id && a.id !== apt.id).slice(0, 4))
      } catch (err) {
        const msg =
          err instanceof ApiError && err.status === 404
            ? "Property not found."
            : err instanceof Error
              ? err.message
              : "Failed to load property."
        if (!cancelled) {
          setLoadError(msg)
          setApartment(null)
          setSimilar([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [slug])

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [banner, setBanner] = useState<{ title: string; message: string } | null>(null)

  const [contactOpen, setContactOpen] = useState(false)
  const [contactSubject, setContactSubject] = useState("")
  const [contactMessage, setContactMessage] = useState("")

  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState("Scam / suspicious listing")
  const [reportDetails, setReportDetails] = useState("")
  const [reportEmail, setReportEmail] = useState("")

  useEffect(() => {
    if (!property?.id) return
    setIsFavorite(getFavorites().includes(property.id))
  }, [property?.id])

  const whatsappPhone = useMemo(() => {
    const raw = property?.landlord?.phone || ""
    const digits = raw.replace(/[^\d]/g, "")
    if (digits.startsWith("0")) return `254${digits.slice(1)}`
    if (digits.startsWith("254")) return digits
    if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`
    return digits
  }, [property?.landlord?.phone])

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <p className="text-sm text-muted-foreground font-nunito">Loading property...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 font-montserrat">Property Not Found</h1>
          <p className="text-muted-foreground mb-4 font-nunito">
            {loadError || "The property you're looking for doesn't exist."}
          </p>
          <Link href={PageRoutes.PROPERTIES}>
            <Button className="tyrent-gradient text-white font-montserrat">Browse All Properties</Button>
          </Link>
        </div>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
  }

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    try {
      const nav: Navigator | undefined = typeof window !== "undefined" ? window.navigator : undefined
      const share = nav ? (nav as unknown as { share?: (data: { title: string; text: string; url: string }) => Promise<void> }).share : undefined
      if (share) {
        await share({
          title: property.title,
          text: "Check out this listing on Tyrent",
          url,
        })
        setBanner({ title: "Shared", message: "Thanks for sharing this listing." })
        return
      }
      const clipboard = nav ? (nav as unknown as { clipboard?: { writeText: (text: string) => Promise<void> } }).clipboard : undefined
      if (clipboard?.writeText) {
        await clipboard.writeText(url)
        setBanner({ title: "Link copied", message: "Listing link copied to clipboard." })
        return
      }
      setBanner({ title: "Link copied", message: "Listing link copied to clipboard." })
    } catch {
      setBanner({ title: "Share failed", message: "Please copy the URL from the address bar." })
    }
  }

  const openContact = () => {
    setContactSubject(`Enquiry: ${property.title}`)
    setContactMessage("")
    setContactOpen(true)
  }

  const sendContact = () => {
    if (!contactSubject.trim() || !contactMessage.trim()) {
      setBanner({ title: "Message incomplete", message: "Please add a subject and message." })
      return
    }
    if (!property.landlord.email) {
      setContactOpen(false)
      setBanner({
        title: "Contact not available",
        message: "This listing doesn't include landlord contact details yet.",
      })
      return
    }
    setContactOpen(false)
    setBanner({ title: "Draft saved", message: "Opening your email app with the message." })
    const mailto = `mailto:${encodeURIComponent(property.landlord.email)}?subject=${encodeURIComponent(
      contactSubject.trim(),
    )}&body=${encodeURIComponent(contactMessage.trim())}`
    window.location.href = mailto
  }

  const submitListingReport = () => {
    if (!reportReason.trim()) return
    submitReport({
      propertyId: property.id,
      propertyTitle: property.title,
      reason: reportReason,
      details: reportDetails.trim() || undefined,
      contactEmail: reportEmail.trim() || undefined,
    })
    setReportOpen(false)
    setReportDetails("")
    setReportEmail("")
    setBanner({ title: "Report submitted", message: "Thanks — our team will review this listing." })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Background Gradient */}
      <div className="fixed top-0 left-0 right-0 h-80 tyrent-gradient -z-10 opacity-90"></div>
      {/* Full Screen Photo Gallery Modal */}
      {showAllPhotos && (
        <motion.div
          className="fixed inset-0 bg-background z-50 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="sticky top-0 z-10 border-b border-border/60 bg-background/95 backdrop-blur">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold font-montserrat">All Photos</h2>
              <Button
                variant="outline"
                onClick={() => setShowAllPhotos(false)}
                className="font-nunito bg-transparent h-9 px-3"
              >
                <X className="h-4 w-4 mr-1" />
                Close
              </Button>
            </div>
          </div>
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {property.images.map((image, index) => (
                <div key={index} className="rounded-lg overflow-hidden border border-border/50 bg-muted/30">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${property.title} - Photo ${index + 1}`}
                    className="w-full h-56 md:h-64 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Back Button */}
      <div className="pt-24 pb-4 container mx-auto px-4 sm:px-6 lg:px-8">
        <Link href={PageRoutes.PROPERTIES}>
          <Button variant="ghost" className="font-nunito">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to listings
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {banner && (
          <div className="mb-6 rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground font-montserrat">{banner.title}</p>
                <p className="text-sm text-muted-foreground font-nunito">{banner.message}</p>
              </div>
              <Button variant="ghost" size="sm" className="font-nunito" onClick={() => setBanner(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-montserrat">{property.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold font-nunito">{property.rating}</span>
                  <span className="text-muted-foreground font-nunito">({property.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground font-nunito">
                  <MapPin className="h-4 w-4" />
                  {property.location}
                </div>
                {property.verified && (
                  <Badge className="bg-green-500 text-white border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setIsFavorite((prev) => !prev)
                  toggleFavorite(property.id)
                }}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="outline" className="font-nunito bg-transparent" onClick={() => setReportOpen(true)}>
                Report
              </Button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 md:auto-rows-[140px] gap-2 rounded-2xl overflow-hidden">
            <div className="md:col-span-2 md:row-span-2 relative group">
              <img
                src={property.images[0] || "/placeholder.svg"}
                alt={property.title}
                className="w-full h-72 md:h-full object-cover cursor-pointer hover:brightness-95 transition-all"
                onClick={() => setShowAllPhotos(true)}
              />
            </div>
            {property.images.slice(1, 5).map((image, index) => (
              <div key={index} className="relative group cursor-pointer h-40 md:h-full">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${property.title} - View ${index + 2}`}
                  className="w-full h-full object-cover hover:brightness-95 transition-all"
                  onClick={() => setShowAllPhotos(true)}
                />
                {index === 3 && property.images.length > 5 && (
                  <div
                    className="absolute inset-0 bg-black/60 flex items-center justify-center hover:bg-black/70 transition-all"
                    onClick={() => setShowAllPhotos(true)}
                  >
                    <span className="text-white font-semibold font-montserrat">
                      +{property.images.length - 5} photos
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="font-nunito bg-transparent" onClick={() => setShowAllPhotos(true)}>
              Show all {property.images.length} photos
            </Button>
            <Button asChild variant="outline" className="font-nunito bg-transparent">
              <Link href={`/virtual-tour/${property.id}`}>
              <Video className="h-4 w-4 mr-2" />
              Virtual Tour
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 font-montserrat">Property Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-card p-4 rounded-lg shadow-md">
                    <div className="flex items-center text-muted-foreground mb-2">
                      <BedDouble className="h-5 w-5 mr-2" />
                      <span className="text-sm">Bedrooms</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground font-montserrat">
                      {property.bedrooms === 0 ? "Studio" : property.bedrooms}
                    </p>
                  </div>
                  <div className="bg-card p-4 rounded-lg shadow-md">
                    <div className="flex items-center text-muted-foreground mb-2">
                      <Bath className="h-5 w-5 mr-2" />
                      <span className="text-sm">Bathrooms</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground font-montserrat">{property.bathrooms}</p>
                  </div>
                  <div className="bg-card p-4 rounded-lg shadow-md">
                    <div className="flex items-center text-muted-foreground mb-2">
                      <Maximize className="h-5 w-5 mr-2" />
                      <span className="text-sm">Size</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground font-montserrat">{property.size} sqft</p>
                  </div>
                  <div className="bg-card p-4 rounded-lg shadow-md">
                    <div className="flex items-center text-muted-foreground mb-2">
                      <Clock className="h-5 w-5 mr-2" />
                      <span className="text-sm">To main road</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground font-montserrat">
                      {getDistanceKm(property.amenityDistances ?? [], "ROAD")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-card p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold text-foreground mb-4 font-montserrat flex items-center">
                      <MapPinIcon className="h-5 w-5 mr-2 text-primary" />
                      Location Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Address</p>
                        <p className="text-foreground font-nunito">{property.mapLocation.address}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">To main road</p>
                          <p className="text-lg font-bold text-foreground font-montserrat">
                            {getDistanceKm(property.amenityDistances ?? [], "ROAD")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">To school</p>
                          <p className="text-lg font-bold text-foreground font-montserrat">
                            {getDistanceKm(property.amenityDistances ?? [], "SCHOOL")}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">To market</p>
                          <p className="text-lg font-bold text-foreground font-montserrat">
                            {getDistanceKm(property.amenityDistances ?? [], "MARKET")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Nearest</p>
                          <p className="text-sm text-muted-foreground font-nunito line-clamp-2">
                            {(() => {
                              const d = (property.amenityDistances ?? [])[0]
                              return d?.nearest_name ? d.nearest_name : "—"
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(property.rules?.trim() || property.leaseAgreementUrl || property.virtualTourUrl) && (
                    <div className="bg-card p-6 rounded-lg shadow-md">
                      <h3 className="text-lg font-bold text-foreground mb-4 font-montserrat flex items-center">
                        <Home className="h-5 w-5 mr-2 text-primary" />
                        Documents & rules
                      </h3>
                      <div className="space-y-3">
                        {property.rules?.trim() && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1 font-nunito">Rules & policies</p>
                            <p className="text-sm text-foreground font-nunito whitespace-pre-wrap">{property.rules}</p>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {property.leaseAgreementUrl && (
                            <Button asChild variant="outline" size="sm" className="font-nunito bg-transparent">
                              <a href={property.leaseAgreementUrl} target="_blank" rel="noreferrer">
                                <FileText className="h-4 w-4 mr-1" />
                                Lease (PDF)
                              </a>
                            </Button>
                          )}
                          {property.virtualTourUrl && (
                            <Button asChild variant="outline" size="sm" className="font-nunito bg-transparent">
                              <a href={property.virtualTourUrl} target="_blank" rel="noreferrer">
                                <Video className="h-4 w-4 mr-1" />
                                Virtual tour
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-bold mb-3 font-montserrat">About this place</h3>
                  <p className="text-muted-foreground whitespace-pre-line font-nunito leading-relaxed">
                    {property.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4 font-montserrat">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="font-nunito">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {availableUnits.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4 font-montserrat">Available units</h2>
                  <div className="space-y-4">
                    {availableUnits.map((unit) => (
                      <div key={unit.id} className="rounded-xl border border-border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                          <div>
                            <p className="font-semibold text-foreground font-montserrat">
                              {unit.unitNumber ? `Unit ${unit.unitNumber}` : "Unit"}
                            </p>
                            <p className="text-sm text-muted-foreground font-nunito">{unit.typeLabel}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground font-montserrat">
                              {unit.rent ? `KES ${unit.rent.toLocaleString()}` : "KES --"}
                            </p>
                            <p className="text-xs text-muted-foreground font-nunito">per month</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant={unit.status === "VACANT" ? "default" : "secondary"} className="font-nunito">
                            {unit.status}
                          </Badge>
                          {unit.size > 0 && (
                            <Badge variant="outline" className="font-nunito">
                              <Maximize className="h-3.5 w-3.5 mr-1" />
                              {unit.size} sqft
                            </Badge>
                          )}
                        </div>
                        {unit.images.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {unit.images.slice(0, 4).map((img, idx) => (
                              <img
                                key={`${unit.id}-img-${idx}`}
                                src={img}
                                alt={`${property.title} ${unit.unitNumber} ${idx + 1}`}
                                className="w-full h-24 object-cover rounded-md"
                              />
                            ))}
                          </div>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button asChild variant="outline" size="sm" className="font-nunito bg-transparent">
                            <Link href={`/virtual-tour/${property.id}?unit=${encodeURIComponent(unit.id)}`}>
                              <Video className="h-4 w-4 mr-1" />
                              Virtual tour
                            </Link>
                          </Button>
                          <Button asChild size="sm" className="tyrent-gradient text-white font-nunito">
                            <Link href={`${PageRoutes.BOOKING(property.id)}?unit=${encodeURIComponent(unit.id)}`}>
                              Book this unit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Highlights removed (not in backend payload) */}

            {/* Landlord contact - Only show name */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-3 font-montserrat">Landlord</h2>
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{property.landlord.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 text-sm font-nunito">
                    <p className="text-foreground font-semibold">{property.landlord.name}</p>
                    {/* Contact information hidden - will be displayed after booking confirmation */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2 font-montserrat">Ready to book?</h3>
                <p className="text-sm text-muted-foreground mb-4 font-nunito">
                  Choose a unit above for exact pricing, photos, and direct booking.
                </p>
                <Button asChild className="w-full tyrent-gradient text-white font-nunito">
                  <Link href={PageRoutes.BOOKING(property.id)}>Go to booking page</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Properties */}
        {similar.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8 font-montserrat">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similar.map((apt) => {
                const u = cheapestUnit(apt.units)
                const p = Number((u as any)?.price_per_month ?? 0)
                const img = absolutizeUrl(apt.exterior_image_url || apt.exterior_image) || "/placeholder.svg"
                const r = typeof apt.average_rating === "number" ? apt.average_rating : 0
                return (
                  <Link key={apt.id} href={`${PageRoutes.PROPERTIES}/${apt.id}`}>
                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 tyrent-card-hover cursor-pointer">
                      <img src={img} alt={apt.name} className="w-full h-48 object-cover" />
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-2 font-montserrat line-clamp-1">{apt.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2 font-nunito">
                          <MapPin className="h-4 w-4" />
                          {apt.address || "No address provided"}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold font-nunito">{r ? r.toFixed(1) : "--"}</span>
                          </div>
                          <span className="text-xl font-bold font-montserrat">
                            {p ? `KES ${(p / 1000).toFixed(0)}K` : "KES --"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {contactOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setContactOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground font-montserrat">Message landlord</h3>
                    <p className="text-sm text-muted-foreground font-nunito">{property.landlord.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="font-nunito" onClick={() => setContactOpen(false)}>
                    Close
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">Subject</label>
                    <input
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">Message</label>
                    <textarea
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito resize-none"
                      placeholder="Ask about availability, viewing times, fees, etc."
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-2">
                  <Button variant="outline" className="bg-transparent font-nunito" onClick={() => setContactOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="tyrent-gradient text-white font-nunito" onClick={sendContact}>
                    Send via Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Report Modal */}
      {reportOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setReportOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground font-montserrat">Report listing</h3>
                    <p className="text-sm text-muted-foreground font-nunito">{property.title}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="font-nunito" onClick={() => setReportOpen(false)}>
                    Close
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">Reason</label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                    >
                      <option>Scam / suspicious listing</option>
                      <option>Wrong location / misleading</option>
                      <option>Incorrect price / hidden charges</option>
                      <option>Duplicate listing</option>
                      <option>Inappropriate content</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                      Details (optional)
                    </label>
                    <textarea
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito resize-none"
                      placeholder="Add any helpful context..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2 font-montserrat">
                      Your email (optional)
                    </label>
                    <input
                      type="email"
                      value={reportEmail}
                      onChange={(e) => setReportEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring font-nunito"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-2">
                  <Button variant="outline" className="bg-transparent font-nunito" onClick={() => setReportOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="tyrent-gradient text-white font-nunito" onClick={submitListingReport}>
                    Submit report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
