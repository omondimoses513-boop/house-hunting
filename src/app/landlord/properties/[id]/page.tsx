"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageRoutes } from "@/constants/page-routes"
import { ArrowLeft, Edit, MapPin, Home, CheckCircle2 } from "lucide-react"
import { ApiError } from "@/lib/api/client"
import { backendGetApartment, backendListUnits, type BackendApartment, type BackendUnit } from "@/lib/api/properties"

function normalizeImage(src: string) {
  if (!src) return "/placeholder.svg"
  if (src.startsWith("http") || src.startsWith("/")) return src
  return `/${src}`
}

export default function LandlordPropertyViewPage() {
  const params = useParams<{ id: string }>()
  const propertyId = params?.id

  const [apartment, setApartment] = useState<BackendApartment | null>(null)
  const [units, setUnits] = useState<BackendUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!propertyId) return
      setLoading(true)
      setLoadError(null)
      try {
        const [apt, u] = await Promise.all([backendGetApartment(propertyId), backendListUnits({ apartment: propertyId })])
        if (cancelled) return
        setApartment(apt)
        setUnits(Array.isArray(u) ? u : [])
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
          setUnits([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [propertyId])

  const images = useMemo(() => {
    if (!apartment) return []
    const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/+$/, "")
    const abs = (url?: string | null) =>
      !url ? "" : url.startsWith("http://") || url.startsWith("https://") ? url : `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`
    const merged = [abs(apartment.exterior_image_url || apartment.exterior_image)].map(normalizeImage).filter(Boolean)
    return Array.from(new Set(merged))
  }, [apartment])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground font-nunito">Loading property...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!apartment) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-lg font-semibold text-foreground font-montserrat">Property not found</p>
                <p className="text-sm text-muted-foreground font-nunito mt-1">
                  {loadError || "This listing may have been removed or you may need to create it again."}
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

  const occupied = units.filter((u) => String(u.status ?? "").toUpperCase() === "OCCUPIED").length
  const vacant = units.filter((u) => String(u.status ?? "").toUpperCase() === "VACANT").length
  const monthlyRevenue = units.reduce((sum, u) => {
    const price = Number((u as any).price_per_month ?? 0)
    return sum + (String(u.status ?? "").toUpperCase() === "OCCUPIED" ? price : 0)
  }, 0)

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
              <Link href={`${PageRoutes.LANDLORD_CREATE_PROPERTY}?edit=${apartment.id}`}>
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
                  alt={apartment.name}
                  className="w-full h-64 md:h-80 object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="rounded-xl bg-background/80 backdrop-blur border border-border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-montserrat">
                          {apartment.name}
                        </h1>
                        <p className="text-sm text-muted-foreground font-nunito flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          {apartment.address || "No address provided"}
                        </p>
                      </div>
                      <Badge className="tyrent-gradient text-white border-0">
                        {(apartment.verification_status ?? "NOT_REQUESTED").toString().toLowerCase()}
                      </Badge>
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
                    {apartment.overview_description || "No description provided."}
                  </p>
                </CardContent>
              </Card>

              {(apartment.amenities?.length ?? 0) > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground font-montserrat mb-4">Amenities</h2>
                    <div className="flex flex-wrap gap-2">
                      {(apartment.amenities ?? []).map((a) => (
                        <Badge key={a.id} variant="outline" className="font-nunito">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {a.name}
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
                      {units.length} total
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {units.map((u) => (
                      <div
                        key={String(u.id)}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-3 border border-border rounded-lg p-4"
                      >
                        <div>
                          <p className="font-semibold text-foreground font-montserrat">Unit {u.unit_number_or_id}</p>
                          <p className="text-sm text-muted-foreground font-nunito">
                            {u.type || "--"} • {u.size_sqft ? `${u.size_sqft} sqft` : "--"} •{" "}
                            {u.price_per_month ? `KES ${Number(u.price_per_month).toLocaleString()}/month` : "KES --"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-nunito">
                            {u.category || "RESIDENTIAL"}
                          </Badge>
                          <Badge
                            className={
                              String(u.status ?? "").toUpperCase() === "OCCUPIED"
                                ? "bg-green-500 text-white border-0"
                                : "bg-orange-500 text-white border-0"
                            }
                          >
                            {String(u.status ?? "").toLowerCase() || "vacant"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {units.length === 0 && (
                      <div className="p-4 border border-border rounded-lg text-sm text-muted-foreground font-nunito">
                        No units added yet.
                      </div>
                    )}
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

              {apartment.rules_and_policies?.trim() && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-foreground font-montserrat mb-2">Rules</h2>
                    <p className="text-sm text-muted-foreground font-nunito whitespace-pre-wrap">
                      {apartment.rules_and_policies}
                    </p>
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

