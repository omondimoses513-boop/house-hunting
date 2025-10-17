"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { sampleProperties } from "@/data/SampleProperties"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, MapPin, Star, BedDouble, Bath, Maximize, CheckCircle2, Heart, Video, Calendar } from "lucide-react"
import { useState } from "react"
import { PageRoutes } from "@/constants/page-routes"

export default function FeaturedProperties() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<string[]>([])

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

  // Display only first 6 properties
  const featuredProperties = sampleProperties.slice(0, 6)

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
            Featured Properties
          </motion.h2>
          <motion.p className="text-muted-foreground max-w-2xl mx-auto font-nunito" variants={itemVariants}>
            Discover handpicked apartments from verified landlords, complete with virtual tours and transparent pricing.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {featuredProperties.map((property, index) => (
            <motion.div key={property.id} variants={itemVariants} whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 tyrent-card-hover h-full flex flex-col">
                <div className="relative">
                  <Link href={`/properties/${property.slug}`}>
                    <img
                      src={property.images[0] || "/placeholder.svg"}
                      alt={property.title}
                      className="w-full h-64 object-cover cursor-pointer"
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

                <Link href={`/properties/${property.slug}`}>
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
                        {property.bedrooms === 0 ? "Studio" : `${property.bedrooms} BR`}
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {property.bathrooms} BA
                      </div>
                      <div className="flex items-center">
                        <Maximize className="h-4 w-4 mr-1" />
                        {property.size} sqft
                      </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2 mb-3">
                      {property.amenities.slice(0, 3).map((amenity) => (
                        <Badge key={amenity} variant="outline" className="text-xs font-nunito">
                          {amenity}
                        </Badge>
                      ))}
                      {property.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs font-nunito">
                          +{property.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border mb-4">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-foreground font-nunito">{property.rating}</span>
                          <span className="text-sm text-muted-foreground font-nunito">({property.reviews})</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-nunito">{property.distanceFromCenter}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground font-montserrat">
                          KES {(property.price / 1000).toFixed(0)}K
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
                        className="flex-1 font-nunito"
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
                        className="flex-1 tyrent-gradient text-white font-nunito"
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
