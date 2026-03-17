'use client'

import React, { useState } from 'react'
import Link from "next/link"
import { PageRoutes } from "@/constants/page-routes"
import { getFavorites, toggleFavorite } from "@/lib/user-preferences"
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Star,
  Wifi,
  Car,
  Shield,
  Camera,
  Eye,
  Calendar
} from 'lucide-react'

interface PropertyCardProps {
  property: {
    id: string
    title: string
    location: string
    price: number
    rating: number
    reviews: number
    bedrooms: number
    bathrooms: number
    size: number
    images: string[]
    amenities: string[]
    verified: boolean
    available: boolean
    distanceFromCenter: string
    landlord: {
      name: string
      avatar: string
      verified: boolean
    }
  }
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(() => getFavorites().includes(property.id))

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    )
  }

  return (
    <Card className="tyrent-card-hover border-0 shadow-lg overflow-hidden bg-card">
      <div className="relative">
        {/* Image Carousel */}
        <div className="relative h-64 bg-muted overflow-hidden">
          <img
            src={property.images[currentImageIndex]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          
          {/* Image Navigation */}
          {property.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 shadow-md"
              >
                ←
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 shadow-md"
              >
                →
              </button>
            </>
          )}

          {/* Image Indicators */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {property.images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex space-x-2">
            {property.verified && (
              <div className="flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                <Shield className="h-3 w-3" />
                <span>Verified</span>
              </div>
            )}
            {property.available && (
              <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                Available
              </div>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={() => {
              setIsFavorited((prev) => !prev)
              toggleFavorite(property.id)
            }}
            className="absolute top-3 right-3 bg-background/80 hover:bg-background rounded-full p-2 shadow-md"
          >
            <Heart 
              className={`h-4 w-4 ${
                isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
              }`} 
            />
          </button>

          {/* Photo Count */}
          <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
            <Camera className="h-3 w-3" />
            <span>{property.images.length}</span>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Rating and Location */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-foreground">{property.rating}</span>
              <span className="text-sm text-muted-foreground">({property.reviews})</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="text-xs">{property.distanceFromCenter}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
            {property.title}
          </h3>

          {/* Location */}
          <p className="text-sm text-muted-foreground mb-3 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {property.location}
          </p>

          {/* Property Details */}
          <div className="flex items-center space-x-4 mb-3 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms} bed</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms} bath</span>
            </div>
            <div className="flex items-center space-x-1">
              <Square className="h-4 w-4" />
              <span>{property.size} sqft</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1 mb-3">
            {property.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground"
              >
                {amenity === 'WiFi' && <Wifi className="h-3 w-3 mr-1" />}
                {amenity === 'Parking' && <Car className="h-3 w-3 mr-1" />}
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>

          {/* Landlord Info */}
          <div className="flex items-center space-x-2 mb-3">
            <img
              src={property.landlord.avatar}
              alt={property.landlord.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-muted-foreground">{property.landlord.name}</span>
            {property.landlord.verified && (
              <Shield className="h-3 w-3 text-green-500" />
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-primary">
                KES {property.price.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground ml-1">/month</span>
            </div>
            <div className="flex space-x-2">
              <Button asChild variant="outline" size="sm" className="border-border hover:bg-accent">
                <Link href={`/virtual-tour/${property.id}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  Tour
                </Link>
              </Button>
              <Button asChild size="sm" className="tyrent-gradient dark:tyrent-gradient-dark text-white">
                <Link href={PageRoutes.BOOKING(property.id)}>
                  <Calendar className="h-4 w-4 mr-1" />
                  Book
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
