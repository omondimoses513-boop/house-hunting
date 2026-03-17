"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageRoutes } from "@/constants/page-routes"
import { getLandlordPropertyById, type LandlordProperty } from "@/lib/landlord-storage"
import { ArrowLeft, Edit, MapPin, Home, CheckCircle2 } from "lucide-react"

function normalizeImage(src: string) {
  if (!src) return "/placeholder.svg"
  if (src.startsWith("http") || src.startsWith("/")) return src
  return `/${src}`
}

export default function LandlordPropertyViewPage() {
  const params = useParams<{ id: string }>()
  const propertyId = params?.id

  const [property, setProperty] = useState<LandlordProperty | null>(null)

  useEffect(() => {
    if (!propertyId) return
    setProperty(getLandlordPropertyById(propertyId))
  }, [propertyId])

  const images = useMemo(() => {
    if (!property) return []
    const fromUrls = property.imageUrls ?? []
    const fromNames = property.imageNames ?? []
    const merged = [...fromUrls, ...fromNames].map(normalizeImage).filter(Boolean)
    return Array.from(new Set(merged))
  }, [property])

  if (!propertyId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground font-nunito">Missing property id.</p>
                <Button asChild className="mt-4 tyrent-gradient text-white font-nunito">
                  <Link href={PageRoutes.LANDLORD_DASHBOARD}>Back to dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-lg font-semibold text-foreground font-montserrat">Property not found</p>
                <p className="text-sm text-muted-foreground font-nunito mt-1">
                  This listing may have been removed or you may need to create it again.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button asChild variant="outline" className="bg-transparent font-nunito">
                    <Link href={PageRoutes.LANDLORD_DASHBOARD}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to dashboard
                    </Link>
                  </Button>
                  <Button asChild className="tyrent-gradient text-white font-nunito">
                    <Link href={PageRoutes.LANDLORD_CREATE_PROPERTY}>Add New Property</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const occupied = property.units.filter((u) => u.status === "occupied").length
  const vacant = property.units.filter((u) => u.status === "vacant").length
  const monthlyRevenue = property.units.reduce((sum, u) => sum + (u.status === "occupied" ? u.rent : 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <Button asChild variant="outline" className="bg-transparent font-nunito">
              <Link href={PageRoutes.LANDLORD_DASHBOARD}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <Button asChild className="tyrent-gradient text-white font-nunito">
              <Link href={`${PageRoutes.LANDLORD_CREATE_PROPERTY}?edit=${property.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Listing
              </Link>
            </Button>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={images[0] ?? "/placeholder.svg"}
                  alt={property.name}
                  className="w-full h-64 md:h-80 object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="rounded-xl bg-background/80 backdrop-blur border border-border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-montserrat">
                          {property.name}
                        </h1>
                        <p className="text-sm text-muted-foreground font-nunito flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          {property.area}, {property.county} • {property.street}
                        </p>
                      </div>
                      <Badge className="tyrent-gradient text-white border-0">{property.propertyType}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {images.length > 1 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.slice(1, 9).map((src) => (
                <img key={src} src={src} alt="Property image" className="w-full h-32 object-cover rounded-lg" />
              ))}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-foreground font-montserrat mb-2">Description</h2>
                  <p className="text-sm text-muted-foreground font-nunito whitespace-pre-wrap">
                    {property.description || "No description provided."}
                  </p>
                </CardContent>
              </Card>

              {(property.amenities.length > 0 || property.customAmenities) && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground font-montserrat mb-4">Amenities</h2>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((a) => (
                        <Badge key={a} variant="outline" className="font-nunito">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {a}
                        </Badge>
                      ))}
                      {property.customAmenities
                        ?.split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((a) => (
                          <Badge key={a} variant="outline" className="font-nunito">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {a}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl font-bold text-foreground font-montserrat">Units</h2>
                    <Badge variant="outline" className="font-nunito">
                      <Home className="h-3 w-3 mr-1" />
                      {property.units.length} total
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {property.units.map((u) => (
                      <div
                        key={u.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-3 border border-border rounded-lg p-4"
                      >
                        <div>
                          <p className="font-semibold text-foreground font-montserrat">Unit {u.unitNumber}</p>
                          <p className="text-sm text-muted-foreground font-nunito">
                            {u.bedrooms} BR • {u.bathrooms} BA • {u.size} sqft • KES {u.rent.toLocaleString()}/month
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-nunito">
                            {u.type}
                          </Badge>
                          <Badge
                            className={
                              u.status === "occupied"
                                ? "bg-green-500 text-white border-0"
                                : "bg-orange-500 text-white border-0"
                            }
                          >
                            {u.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-foreground font-montserrat mb-4">Performance</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs text-muted-foreground font-nunito">Occupied</p>
                      <p className="text-2xl font-bold text-foreground font-montserrat">{occupied}</p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs text-muted-foreground font-nunito">Vacant</p>
                      <p className="text-2xl font-bold text-foreground font-montserrat">{vacant}</p>
                    </div>
                    <div className="rounded-lg border border-border p-4 col-span-2">
                      <p className="text-xs text-muted-foreground font-nunito">Est. Monthly Revenue</p>
                      <p className="text-2xl font-bold text-foreground font-montserrat">
                        KES {monthlyRevenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {property.rules?.trim() && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground font-montserrat mb-2">Rules</h2>
                    <p className="text-sm text-muted-foreground font-nunito whitespace-pre-wrap">{property.rules}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

