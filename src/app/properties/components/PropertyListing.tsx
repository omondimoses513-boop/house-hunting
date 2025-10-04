'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { sampleProperties } from '@/data/SampleProperties'
import { 
  MapPin, 
  Star, 
  Heart,
  BedDouble,
  Bath,
  Maximize,
  CheckCircle2
} from 'lucide-react'

export default function PropertiesListing() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedArea, setSelectedArea] = useState('All Areas')
  const [selectedType, setSelectedType] = useState('All Types')

  const areas = ['All Areas', 'Kilimani', 'Westlands', 'Karen', 'Lavington', 'Ruiru', 'Runda', 'South B', 'Kileleshwa', 'Roysambu', 'Upperhill', 'Mirema', 'Thika', 'Juja']
  const propertyTypes = ['All Types', 'Bedsitter', '1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4+ Bedrooms']

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const filteredProperties = sampleProperties.filter(p => {
    const matchesArea = selectedArea === 'All Areas' || p.area === selectedArea
    const matchesType = selectedType === 'All Types' || 
      (selectedType === 'Bedsitter' && p.bedrooms === 0) ||
      (selectedType === '1 Bedroom' && p.bedrooms === 1) ||
      (selectedType === '2 Bedrooms' && p.bedrooms === 2) ||
      (selectedType === '3 Bedrooms' && p.bedrooms === 3) ||
      (selectedType === '4+ Bedrooms' && p.bedrooms >= 4)
    return matchesArea && matchesType
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative tyrent-gradient pt-32 pb-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-montserrat drop-shadow-lg">
              Discover Your Perfect Home
            </h1>
            <p className="text-white/90 font-nunito text-lg md:text-xl drop-shadow">
              {filteredProperties.length} properties available across Nairobi
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-16">
        {/* Filters Card */}
        <Card className="mb-8 shadow-xl border-0">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Area Filter */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 font-montserrat">Location</h3>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {areas.map((area) => (
                    <motion.button
                      key={area}
                      onClick={() => setSelectedArea(area)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all font-nunito ${
                        selectedArea === area
                          ? 'tyrent-gradient text-white shadow-lg'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {area}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Property Type Filter */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 font-montserrat">Property Type</h3>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {propertyTypes.map((type) => (
                    <motion.button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all font-nunito ${
                        selectedType === type
                          ? 'tyrent-gradient text-white shadow-lg'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {type}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 tyrent-card-hover">
                <div className="relative">
                  <Link href={`/properties/${property.slug}`}>
                    <img 
                      src={property.images[0]} 
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
                        favorites.includes(property.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-700'
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
                  <CardContent className="p-4 cursor-pointer">
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
                        {property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} BR`}
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

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-foreground font-nunito">
                            {property.rating}
                          </span>
                          <span className="text-sm text-muted-foreground font-nunito">
                            ({property.reviews})
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-nunito">
                          {property.distanceFromCenter}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground font-montserrat">
                          KES {(property.price / 1000).toFixed(0)}K
                        </p>
                        <p className="text-xs text-muted-foreground font-nunito">per month</p>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg font-nunito">
              No properties found matching your filters. Try adjusting your search.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}