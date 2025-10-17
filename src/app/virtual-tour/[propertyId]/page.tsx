"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { sampleProperties } from "@/data/SampleProperties"
import { PageRoutes } from "@/constants/page-routes"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  CheckCircle2,
  Calendar,
} from "lucide-react"

export default function VirtualTour() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params?.propertyId as string
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const property = sampleProperties.find((p) => p.id === propertyId)

  if (!property) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 font-montserrat">Property Not Found</h1>
          <Button onClick={() => router.back()} className="mt-4">
            Back
          </Button>
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

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 font-nunito">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Virtual Tour Viewer */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden shadow-2xl">
                  <div className="relative bg-black">
                    {/* Main Image Display */}
                    <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                      <motion.img
                        key={currentImageIndex}
                        src={property.images[currentImageIndex]}
                        alt={`${property.title} - View ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />

                      {/* Navigation Arrows */}
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors z-10 backdrop-blur-sm"
                      >
                        <ChevronLeft className="h-6 w-6 text-white" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors z-10 backdrop-blur-sm"
                      >
                        <ChevronRight className="h-6 w-6 text-white" />
                      </button>

                      {/* Image Counter */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-nunito">
                        {currentImageIndex + 1} / {property.images.length}
                      </div>
                    </div>

                    {/* Thumbnail Strip */}
                    <div className="bg-black p-4 overflow-x-auto">
                      <div className="flex gap-2">
                        {property.images.map((image, index) => (
                          <motion.button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                              index === currentImageIndex ? "border-primary" : "border-gray-600 hover:border-gray-400"
                            }`}
                            whileHover={{ scale: 1.05 }}
                          >
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Tour Information */}
                <Card className="mt-6">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4 font-montserrat">360° Virtual Tour</h2>
                    <p className="text-muted-foreground font-nunito mb-4">
                      Explore this property from every angle. Use the arrows to navigate through{" "}
                      {property.images.length} high-quality images showcasing the apartment's interior and exterior.
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="font-nunito">
                        {property.images.length} Photos
                      </Badge>
                      <Badge variant="outline" className="font-nunito">
                        High Resolution
                      </Badge>
                      <Badge variant="outline" className="font-nunito">
                        360° View
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Property Info Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-24 space-y-4"
              >
                {/* Property Card */}
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg text-foreground mb-2 font-montserrat line-clamp-2">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-nunito">
                      <MapPin className="h-4 w-4" />
                      {property.location}
                    </div>

                    {/* Property Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3 text-sm">
                        <BedDouble className="h-5 w-5 text-primary" />
                        <span className="text-foreground font-nunito">
                          {property.bedrooms === 0 ? "Studio" : `${property.bedrooms} Bedrooms`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Bath className="h-5 w-5 text-primary" />
                        <span className="text-foreground font-nunito">{property.bathrooms} Bathrooms</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Maximize className="h-5 w-5 text-primary" />
                        <span className="text-foreground font-nunito">{property.size} sqft</span>
                      </div>
                    </div>

                    {/* Verified Badge */}
                    {property.verified && (
                      <Badge className="w-full justify-center bg-green-500 text-white border-0 mb-4 font-nunito">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified Property
                      </Badge>
                    )}

                    {/* Price */}
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground font-nunito mb-1">Monthly Rent</p>
                      <p className="text-2xl font-bold text-foreground font-montserrat">
                        KES {property.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Booking Fee Info */}
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-900 dark:text-blue-100 font-nunito">
                        <span className="font-semibold">Booking Fee:</span> KES 350 for 48-hour reservation
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button
                        onClick={() => router.push(PageRoutes.BOOKING(property.id))}
                        className="w-full tyrent-gradient text-white font-nunito"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Now - KES 350
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/properties/${property.slug}`)}
                        className="w-full font-nunito"
                      >
                        View Full Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Amenities */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-3 font-montserrat">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((amenity) => (
                        <Badge key={amenity} variant="outline" className="font-nunito">
                          {amenity}
                        </Badge>
                      ))}
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
