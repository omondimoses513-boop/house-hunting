"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  MapPin,
  Star,
  BedDouble,
  Bath,
  Maximize,
  CheckCircle2,
  Heart,
  Video,
  Calendar,
  Clock,
  Home,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { PageRoutes } from "@/constants/page-routes"
import { backendFeaturedApartments, backendListApartments, type BackendApartment, type BackendUnit } from "@/lib/api/properties"

export default function FeaturedProperties() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<string[]>([])
  const [featured, setFeatured] = useState<BackendApartment[]>([])
  const [loading, setLoading] = useState(true)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  }

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  const handleBook = (propertyId: string) => {
    router.push(PageRoutes.BOOKING(propertyId))
  }

  const handleVirtualTour = (propertyId: string) => {
    router.push(`/virtual-tour/${propertyId}`)
  }

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

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const featuredData = await backendFeaturedApartments().catch(() => [])
        if (cancelled) return
        if (Array.isArray(featuredData) && featuredData.length > 0) {
          setFeatured(featuredData)
          return
        }
        const allData = await backendListApartments().catch(() => [])
        if (!cancelled) setFeatured(Array.isArray(allData) ? allData : [])
      } catch {
        if (!cancelled) setFeatured([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const cards = useMemo(() => {
    return featured.slice(0, 6).map((apt) => {
      const unit = cheapestUnit(apt.units)
      const price = Number((unit as any)?.price_per_month ?? 0)
      const size = Number((unit as any)?.size_sqft ?? 0)
      const image = absolutizeUrl(apt.exterior_image_url || apt.exterior_image) || "/placeholder.svg"
      const verified = (apt.verification_status ?? "").toString().toUpperCase() === "VERIFIED"
      const rating = typeof apt.average_rating === "number" ? apt.average_rating : 0
      const reviews = typeof apt.review_count === "number" ? apt.review_count : 0
      return {
        id: apt.id,
        title: apt.name,
        location: apt.address || "No address provided",
        image,
        verified,
        rating,
        reviews,
        price,
        size,
        amenities: (apt.amenities ?? []).map((a) => a.name).filter(Boolean),
      }
    })
  }, [featured])

  return (
    <section className="py-12 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.h2 className="text-3xl font-bold text-foreground mb-4 font-montserrat" variants={itemVariants}>
            Properties You Can Explore
          </motion.h2>
          <motion.p className="text-muted-foreground max-w-2xl mx-auto font-nunito" variants={itemVariants}>
            Browse available apartments with transparent pricing, virtual tours, and amenities.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {!loading && cards.length === 0 && (
            <Card className="border-0 shadow-lg md:col-span-2 lg:col-span-3">
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground font-nunito">No properties available yet.</p>
                <p className="text-xs text-muted-foreground font-nunito mt-1">
                  Once apartments are published, they will show up here.
                </p>
                <Button asChild variant="outline" className="mt-4 bg-transparent font-montserrat">
                  <Link href="/properties">Browse all properties</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {cards.map((property) => (
            <motion.div key={property.id} variants={itemVariants} whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 tyrent-card-hover h-full flex flex-col">
                <div className="relative">
                  <Link href={`/properties/${property.id}`}>
                    <img
                      src={property.image || "/placeholder.svg"}
                      alt={property.title}
                      className="w-full h-44 object-cover cursor-pointer"
                    />
                  </Link>
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleFavorite(property.id)
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors z-10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favorites.includes(property.id) ? "fill-red-500 text-red-500" : "text-gray-700"
                      }`}
                    />
                  </motion.button>
                  {property.verified && (
                    <Badge className="absolute top-3 left-3 bg-green-500 text-white border-0 z-10">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <Link href={`/properties/${property.id}`}>
                  <CardContent className="p-4 cursor-pointer flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground font-montserrat line-clamp-1">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1 font-nunito">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.location}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 font-nunito">
                      <div className="flex items-center">
                        <BedDouble className="h-4 w-4 mr-1" />
                        --
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        --
                      </div>
                      <div className="flex items-center">
                        <Maximize className="h-4 w-4 mr-1" />
                        {property.size ? `${property.size} sqft` : "--"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3 p-2 bg-muted/50 rounded-md shadow-sm">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Virtual tours available</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>Verified listings</span>
                      </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2 mb-3">
                      {property.amenities.slice(0, 3).map((amenity) => (
                        <Badge key={amenity} variant="outline" className="text-xs font-nunito shadow-sm">
                          {amenity}
                        </Badge>
                      ))}
                      {property.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs font-nunito shadow-sm">
                          +{property.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border mb-4">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-foreground font-nunito">{property.rating ? property.rating.toFixed(1) : "--"}</span>
                          <span className="text-sm text-muted-foreground font-nunito">({property.reviews})</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-nunito">{property.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground font-montserrat">
                          {property.price ? `KES ${(property.price / 1000).toFixed(0)}K` : "KES --"}
                        </p>
                        <p className="text-xs text-muted-foreground font-nunito">per month</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Button
                        onClick={(e) => {
                          e.preventDefault()
                          handleVirtualTour(property.id)
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1 font-nunito shadow-sm hover:shadow-md"
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Tour
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.preventDefault()
                          handleBook(property.id)
                        }}
                        size="sm"
                        className="flex-1  font-nunito shadow-sm hover:shadow-md"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Book
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/properties">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="hover:bg-primary hover:text-primary-foreground font-montserrat bg-transparent"
              >
                View All Properties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
