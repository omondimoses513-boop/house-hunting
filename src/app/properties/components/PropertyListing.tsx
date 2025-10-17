"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { sampleProperties } from "@/data/SampleProperties"
import { PageRoutes } from "@/constants/page-routes"
import {
  MapPin,
  Star,
  Heart,
  BedDouble,
  Bath,
  Maximize,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  Home,
  DollarSign,
  X,
  Wifi,
  Car,
  Dumbbell,
  Shield,
  Video,
} from "lucide-react"

export default function PropertiesListing() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedArea, setSelectedArea] = useState("All Areas")
  const [selectedType, setSelectedType] = useState("All Types")
  const [displayCount, setDisplayCount] = useState(12)
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedBedrooms, setSelectedBedrooms] = useState("Any")
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState(100000)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const observerTarget = useRef(null)

  const areas = [
    "All Areas",
    "Kilimani",
    "Westlands",
    "Karen",
    "Lavington",
    "Ruiru",
    "Runda",
    "South B",
    "Kileleshwa",
    "Roysambu",
    "Upperhill",
    "Mirema",
    "Thika",
    "Juja",
  ]
  const propertyTypes = ["All Types", "Bedsitter", "1 Bedroom", "2 Bedrooms", "3 Bedrooms", "4+ Bedrooms"]

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))
  }

  const handleBooking = (propertyId: string) => {
    router.push(PageRoutes.BOOKING(propertyId))
  }

  const filteredProperties = sampleProperties.filter((p) => {
    const matchesArea = selectedArea === "All Areas" || p.area === selectedArea
    const matchesType =
      selectedType === "All Types" ||
      (selectedType === "Bedsitter" && p.bedrooms === 0) ||
      (selectedType === "1 Bedroom" && p.bedrooms === 1) ||
      (selectedType === "2 Bedrooms" && p.bedrooms === 2) ||
      (selectedType === "3 Bedrooms" && p.bedrooms === 3) ||
      (selectedType === "4+ Bedrooms" && p.bedrooms >= 4)
    const matchesPrice = p.price <= priceRange
    const matchesBedrooms =
      selectedBedrooms === "Any" ||
      (selectedBedrooms === "4+" && p.bedrooms >= 4) ||
      selectedBedrooms === String(p.bedrooms)
    return matchesArea && matchesType && matchesPrice && matchesBedrooms
  })

  const displayedProperties = filteredProperties.slice(0, displayCount)
  const hasMore = displayCount < filteredProperties.length

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setIsLoading(true)
          setTimeout(() => {
            setDisplayCount((prev) => prev + 12)
            setIsLoading(false)
          }, 800)
        }
      },
      { threshold: 0.5 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [hasMore, isLoading])

  return (
    <div className="mt-28 bg-background">
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-16">
        {/* Integrated Search Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card className="shadow-2xl border-0">
            <CardContent className="p-2">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center rounded-2xl lg:rounded-full bg-muted">
                {/* Location */}
                <motion.div
                  className="flex-1 px-6 py-4 cursor-pointer rounded-t-2xl lg:rounded-l-full lg:rounded-tr-none hover:bg-muted/80 transition-colors relative"
                  whileHover={{ scale: 1.02 }}
                  onFocus={() => setFocusedField("location")}
                  onBlur={() => setFocusedField(null)}
                >
                  <label className="block text-xs font-semibold text-muted-foreground mb-1 font-montserrat">
                    Where
                  </label>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                    <select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-sm text-foreground font-nunito cursor-pointer"
                    >
                      {areas.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                  {focusedField === "location" && (
                    <motion.div
                      className="absolute inset-0 border-2 border-primary rounded-2xl lg:rounded-l-full lg:rounded-r-none pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}
                </motion.div>

                <div className="hidden lg:block w-px h-12 bg-border self-center" />

                {/* Property Type */}
                <motion.div
                  className="flex-1 px-6 py-4 cursor-pointer hover:bg-muted/80 transition-colors relative"
                  whileHover={{ scale: 1.02 }}
                  onFocus={() => setFocusedField("type")}
                  onBlur={() => setFocusedField(null)}
                >
                  <label className="block text-xs font-semibold text-muted-foreground mb-1 font-montserrat">
                    Property Type
                  </label>
                  <div className="flex items-center">
                    <Home className="h-4 w-4 text-muted-foreground mr-2" />
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-sm text-foreground font-nunito cursor-pointer"
                    >
                      {propertyTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  {focusedField === "type" && (
                    <motion.div
                      className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}
                </motion.div>

                <div className="hidden lg:block w-px h-12 bg-border self-center" />

                {/* Price Range */}
                <motion.div
                  className="flex-1 px-6 py-4 cursor-pointer rounded-b-2xl lg:rounded-r-full lg:rounded-bl-none hover:bg-muted/80 transition-colors relative"
                  whileHover={{ scale: 1.02 }}
                  onFocus={() => setFocusedField("price")}
                  onBlur={() => setFocusedField(null)}
                >
                  <label className="block text-xs font-semibold text-muted-foreground mb-1 font-montserrat">
                    Budget
                  </label>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm text-foreground font-nunito">
                      Up to KES {(priceRange / 1000).toFixed(0)}K
                    </span>
                  </div>
                  {focusedField === "price" && (
                    <motion.div
                      className="absolute inset-0 border-2 border-primary rounded-2xl lg:rounded-r-full lg:rounded-l-none pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}
                </motion.div>

                {/* Search Button */}
                <div className="lg:pr-2 p-2 lg:p-0">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      className="w-full lg:w-auto tyrent-gradient hover:tyrent-gradient-dark text-white rounded-full px-8 py-6 shadow-lg font-montserrat transition-all duration-300"
                    >
                      <Search className="h-5 w-5 lg:mr-2" />
                      <span className="hidden lg:inline">Search</span>
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Filters Toggle */}
              <div className="flex items-center justify-between mt-4 px-4">
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-nunito"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>{showFilters ? "Hide" : "Show"} filters</span>
                </motion.button>

                <div className="flex gap-2">
                  {selectedAmenities.slice(0, 2).map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="text-xs font-nunito">
                      {amenity}
                    </Badge>
                  ))}
                  {selectedAmenities.length > 2 && (
                    <Badge variant="secondary" className="text-xs font-nunito">
                      +{selectedAmenities.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-6 shadow-xl border-0 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-foreground font-montserrat">Filters</h3>
                    <motion.button
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-muted rounded-full transition-colors"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="h-5 w-5 text-muted-foreground" />
                    </motion.button>
                  </div>

                  <div className="space-y-8">
                    {/* Bedrooms */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3 font-montserrat">
                        Bedrooms
                      </label>
                      <div className="grid grid-cols-6 gap-3">
                        {["Any", "0", "1", "2", "3", "4+"].map((bed) => (
                          <motion.button
                            key={bed}
                            onClick={() => setSelectedBedrooms(bed)}
                            className={`px-4 py-3 rounded-xl border-2 transition-all text-center font-medium font-nunito ${
                              selectedBedrooms === bed
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50 hover:bg-muted text-foreground"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {bed === "0" ? "Studio" : bed}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3 font-montserrat">
                        Amenities
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {[
                          { icon: Wifi, label: "WiFi" },
                          { icon: Car, label: "Parking" },
                          { icon: Dumbbell, label: "Gym" },
                          { icon: Shield, label: "Security" },
                          { icon: Home, label: "Furnished" },
                        ].map((amenity) => (
                          <motion.button
                            key={amenity.label}
                            onClick={() => toggleAmenity(amenity.label)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all space-y-2 ${
                              selectedAmenities.includes(amenity.label)
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50 hover:bg-muted"
                            }`}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <amenity.icon
                              className={`h-6 w-6 ${
                                selectedAmenities.includes(amenity.label) ? "text-primary" : "text-muted-foreground"
                              }`}
                            />
                            <span
                              className={`text-xs font-medium font-nunito ${
                                selectedAmenities.includes(amenity.label) ? "text-primary" : "text-foreground"
                              }`}
                            >
                              {amenity.label}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range Slider */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3 font-montserrat">
                        Maximum Price
                      </label>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm font-nunito">
                          <span className="text-muted-foreground">KES 10,000</span>
                          <span className="text-foreground font-semibold text-lg">
                            KES {priceRange.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">KES 200,000</span>
                        </div>
                        <input
                          type="range"
                          min="10000"
                          max="200000"
                          value={priceRange}
                          onChange={(e) => setPriceRange(Number(e.target.value))}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                    <motion.button
                      className="text-sm font-medium text-muted-foreground hover:text-foreground underline font-nunito"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedBedrooms("Any")
                        setSelectedAmenities([])
                        setPriceRange(100000)
                      }}
                    >
                      Clear all
                    </motion.button>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="tyrent-gradient hover:tyrent-gradient-dark text-white px-8 font-montserrat">
                        Show {filteredProperties.length} properties
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.5) }}
            >
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 tyrent-card-hover group h-full flex flex-col">
                <div className="relative">
                  <Link href={`${PageRoutes.PROPERTIES}/${property.slug}`}>
                    <img
                      src={property.images[0] || "/placeholder.svg"}
                      alt={property.title}
                      className="w-full h-64 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleFavorite(property.id)
                    }}
                    className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all z-10"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favorites.includes(property.id) ? "fill-red-500 text-red-500" : "text-gray-700"
                      }`}
                    />
                  </motion.button>
                  {property.verified && (
                    <Badge className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-sm text-white border-0 z-10">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <Link href={`${PageRoutes.PROPERTIES}/${property.slug}`}>
                  <CardContent className="p-4 cursor-pointer flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-base text-foreground font-montserrat line-clamp-1 group-hover:text-primary transition-colors">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-xs text-muted-foreground mt-1 font-nunito">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {property.location}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 font-nunito">
                      <div className="flex items-center">
                        <BedDouble className="h-3.5 w-3.5 mr-1" />
                        {property.bedrooms === 0 ? "Studio" : `${property.bedrooms} BR`}
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-3.5 w-3.5 mr-1" />
                        {property.bathrooms} BA
                      </div>
                      <div className="flex items-center">
                        <Maximize className="h-3.5 w-3.5 mr-1" />
                        {property.size} sqft
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-sm text-foreground font-nunito">{property.rating}</span>
                        <span className="text-xs text-muted-foreground font-nunito">({property.reviews})</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground font-montserrat">
                          KES {(property.price / 1000).toFixed(0)}K
                        </p>
                        <p className="text-xs text-muted-foreground font-nunito">per month</p>
                      </div>
                    </div>
                  </CardContent>
                </Link>

                <div className="px-4 pb-4 flex gap-2">
                  <Button
                    onClick={() => handleBooking(property.id)}
                    className="flex-1 tyrent-gradient text-white text-sm font-nunito"
                    size="sm"
                  >
                    Book
                  </Button>
                  <Button variant="outline" className="flex-1 text-sm font-nunito bg-transparent" size="sm">
                    <Video className="h-4 w-4 mr-1" />
                    Tour
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <motion.div className="flex space-x-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-primary rounded-full"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </motion.div>
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {hasMore && <div ref={observerTarget} className="h-20" />}

        {/* No More Properties */}
        {!hasMore && displayedProperties.length > 0 && (
          <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-muted-foreground text-base font-nunito">
              You've viewed all {filteredProperties.length} properties
            </p>
          </motion.div>
        )}

        {/* No Results */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-16">
            <div className="mb-4">
              <Home className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
            </div>
            <p className="text-muted-foreground text-lg font-nunito mb-2">No properties found matching your filters</p>
            <p className="text-sm text-muted-foreground font-nunito">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
