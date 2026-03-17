"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getPropertyBySlug, getSimilarProperties } from "@/data/SampleProperties"
import { PageRoutes } from "@/constants/page-routes"
import { getFavorites, submitReport, toggleFavorite } from "@/lib/user-preferences"
import {
  Star,
  Heart,
  Share2,
  MapPin,
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
  Home,
  MapPinIcon,
} from "lucide-react"

export default function PropertyDetail() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const property = getPropertyBySlug(slug)
  const similarProperties = property ? getSimilarProperties(property.id) : []

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)
  const [banner, setBanner] = useState<{ title: string; message: string } | null>(null)

  const [contactOpen, setContactOpen] = useState(false)
  const [contactSubject, setContactSubject] = useState("")
  const [contactMessage, setContactMessage] = useState("")

  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState("Scam / suspicious listing")
  const [reportDetails, setReportDetails] = useState("")
  const [reportEmail, setReportEmail] = useState("")

  if (!property) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 font-montserrat">Property Not Found</h1>
          <p className="text-muted-foreground mb-4 font-nunito">The property you're looking for doesn't exist.</p>
          <Link href={PageRoutes.PROPERTIES}>
            <Button className="tyrent-gradient text-white font-montserrat">Browse All Properties</Button>
          </Link>
        </div>
      </div>
    )
  }

  useEffect(() => {
    setIsFavorite(getFavorites().includes(property.id))
  }, [property.id])

  const whatsappPhone = useMemo(() => {
    const raw = property.landlord.phone || ""
    const digits = raw.replace(/[^\d]/g, "")
    if (digits.startsWith("0")) return `254${digits.slice(1)}`
    if (digits.startsWith("254")) return digits
    if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`
    return digits
  }, [property.landlord.phone])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
  }

  const handleBooking = () => {
    router.push(`${PageRoutes.BOOKING}/${property.id}`)
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
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="icon" onClick={() => setShowAllPhotos(false)} className="rounded-full">
                <X className="h-6 w-6" />
              </Button>
              <h2 className="text-xl font-bold font-montserrat">All Photos</h2>
              <div className="w-10"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property.images.map((image, index) => (
                <img
                  key={index}
                  src={image || "/placeholder.svg"}
                  alt={`${property.title} - Photo ${index + 1}`}
                  className="w-full h-auto rounded-lg"
                />
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden">
            <div className="md:col-span-2 md:row-span-2 relative group">
              <img
                src={property.images[0] || "/placeholder.svg"}
                alt={property.title}
                className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all"
                onClick={() => setShowAllPhotos(true)}
              />
            </div>
            {property.images.slice(1, 5).map((image, index) => (
              <div key={index} className="relative group cursor-pointer h-48 md:h-auto">
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
                      <span className="text-sm">To Transit</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground font-montserrat">{property.walkToTransit} min</p>
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
                          <p className="text-sm text-muted-foreground mb-1">To Main Road</p>
                          <p className="text-lg font-bold text-foreground font-montserrat">
                            {property.walkToMainRoad} min
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">To Transit</p>
                          <p className="text-lg font-bold text-foreground font-montserrat">
                            {property.walkToTransit} min
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold text-foreground mb-4 font-montserrat flex items-center">
                      <Home className="h-5 w-5 mr-2 text-primary" />
                      Special Features
                    </h3>
                    <div className="space-y-2">
                      {property.hasBalcony && (
                        <div className="flex items-center text-foreground">
                          <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                          <span className="font-nunito">Balcony</span>
                        </div>
                      )}
                      {property.features.map((feature) => (
                        <div key={feature} className="flex items-center text-foreground">
                          <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                          <span className="font-nunito">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
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

            {/* Highlights */}
            {property.highlights && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4 font-montserrat">Highlights</h2>
                  <div className="space-y-3">
                    {property.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span className="font-nunito">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Landlord Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 font-montserrat">Meet your landlord</h2>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={property.landlord.avatar || "/placeholder.svg"} alt={property.landlord.name} />
                    <AvatarFallback>{property.landlord.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold font-montserrat">{property.landlord.name}</h3>
                      {property.landlord.verified && (
                        <Badge variant="outline" className="text-green-500 border-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 font-nunito">{property.landlord.joinedDate}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" className="tyrent-gradient text-white font-nunito" onClick={openContact}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button asChild size="sm" variant="outline" className="font-nunito bg-transparent">
                        <a href={`tel:${property.landlord.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                        </a>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="font-nunito bg-transparent">
                        <a href={`mailto:${property.landlord.email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                        </a>
                      </Button>
                      {whatsappPhone && (
                        <Button asChild size="sm" variant="outline" className="font-nunito bg-transparent">
                          <a href={`https://wa.me/${whatsappPhone}`} target="_blank" rel="noreferrer">
                            WhatsApp
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Card - Sticky */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-xl">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold font-montserrat">
                      KES {(property.price / 1000).toFixed(0)}K
                    </span>
                    <span className="text-muted-foreground font-nunito">/ month</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold font-nunito">{property.rating}</span>
                    <span className="text-muted-foreground font-nunito">({property.reviews} reviews)</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block font-montserrat">Move-in Date</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background font-nunito"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block font-montserrat">Guests</label>
                    <input
                      type="number"
                      min="1"
                      value={guests}
                      onChange={(e) => setGuests(Number.parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background font-nunito"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleBooking}
                  className="w-full tyrent-gradient text-white mb-4 py-6 text-lg font-montserrat hover:opacity-90 transition-opacity"
                >
                  Book Now
                </Button>

                <p className="text-center text-sm text-muted-foreground font-nunito">You won't be charged yet</p>

                <div className="mt-6 pt-6 border-t border-border space-y-2 text-sm">
                  <div className="flex justify-between font-nunito">
                    <span className="text-muted-foreground">Deposit</span>
                    <span className="font-semibold">KES {((property.price * 2) / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between font-nunito">
                    <span className="text-muted-foreground">Service fee</span>
                    <span className="font-semibold">KES 5K</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8 font-montserrat">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarProperties.map(
                (similar) =>
                  similar && (
                    <Link key={similar.id} href={`${PageRoutes.PROPERTIES}/${similar.slug}`}>
                      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 tyrent-card-hover cursor-pointer">
                        <img
                          src={similar.images[0] || "/placeholder.svg"}
                          alt={similar.title}
                          className="w-full h-48 object-cover"
                        />
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg mb-2 font-montserrat line-clamp-1">{similar.title}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2 font-nunito">
                            <MapPin className="h-4 w-4" />
                            {similar.location}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold font-nunito">{similar.rating}</span>
                            </div>
                            <span className="text-xl font-bold font-montserrat">
                              KES {(similar.price / 1000).toFixed(0)}K
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ),
              )}
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
