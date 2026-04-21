import { apiRequest } from "@/lib/api/client"

export type BackendAmenity = {
  id: string
  name: string
  icon_url?: string | null
}

export type BackendUnit = {
  id: string
  apartment: string
  unit_number_or_id: string
  category?: string
  type?: string
  size_sqft?: string | number | null
  price_per_month?: string | number | null
  status?: string
  interior_images?: unknown
  exterior_images?: unknown
  description?: string | null
  last_status_updated?: string
  created_at?: string
  updated_at?: string
}

export type BackendLeaseAgreement = {
  id: string
  apartment: string
  document?: string
  file_hash?: string
  version?: number
  created_at?: string
  updated_at?: string
  file_size?: number | null
}

export type BackendAmenityDistance = {
  id: string
  amenity_type: string
  amenity_type_display?: string
  distance_km: string | number
  nearest_name?: string
}

export type BackendApartment = {
  id: string
  landlord?: string
  landlord_info?: {
    id?: string
    username?: string
    full_name?: string
    email?: string
    phone_number?: string
    role?: string
  }
  name: string
  address?: string
  latitude?: string | number | null
  longitude?: string | number | null
  overview_description?: string
  exterior_image?: string | null
  exterior_image_url?: string | null
  virtual_tour_url?: string | null
  lease_agreement?: BackendLeaseAgreement | null
  rules_and_policies?: string | null
  amenities?: BackendAmenity[]
  units?: BackendUnit[]
  amenity_distances?: BackendAmenityDistance[]
  verification_status?: string
  total_units?: number
  occupied_units?: number
  created_at?: string
  updated_at?: string
  average_rating?: number | null
  review_count?: number
}

export type CreateApartmentPayload = {
  name: string
  address?: string
  latitude?: string | number | null
  longitude?: string | number | null
  overview_description?: string
  exterior_image_url?: string
  virtual_tour_url?: string
  rules_and_policies?: string
  amenity_ids?: string[]
}

export function backendListApartments() {
  return apiRequest<BackendApartment[]>({
    path: "/api/properties/apartments/",
    method: "GET",
  })
}

export function backendFeaturedApartments() {
  return apiRequest<BackendApartment[]>({
    path: "/api/properties/apartments/featured/",
    method: "GET",
  })
}

export function backendListAmenities() {
  return apiRequest<BackendAmenity[]>({
    path: "/api/properties/amenities/",
    method: "GET",
  })
}

export function backendSearchApartments(params: {
  name?: string
  verification_status?: string
  min_price?: string | number
  max_price?: string | number
  beds?: string | number
  property_type?: string
  location?: string
}) {
  const qs = new URLSearchParams()
  if (params.name) qs.set("name", String(params.name))
  if (params.verification_status) qs.set("verification_status", String(params.verification_status))
  if (typeof params.min_price !== "undefined") qs.set("min_price", String(params.min_price))
  if (typeof params.max_price !== "undefined") qs.set("max_price", String(params.max_price))
  if (typeof params.beds !== "undefined") qs.set("beds", String(params.beds))
  if (params.property_type) qs.set("property_type", String(params.property_type))
  if (params.location) qs.set("location", String(params.location))
  const suffix = qs.toString() ? `?${qs.toString()}` : ""
  return apiRequest<BackendApartment[]>({
    path: `/api/properties/apartments/search/${suffix}`,
    method: "GET",
  })
}

export function backendGetApartment(apartmentId: string) {
  return apiRequest<BackendApartment>({
    path: `/api/properties/apartments/${encodeURIComponent(apartmentId)}/`,
    method: "GET",
  })
}

export function backendCreateApartment(payload: CreateApartmentPayload) {
  return apiRequest<BackendApartment>({
    path: "/api/properties/apartments/",
    method: "POST",
    body: payload,
  })
}

export function backendCreateApartmentForm(formData: FormData) {
  return apiRequest<BackendApartment>({
    path: "/api/properties/apartments/",
    method: "POST",
    formData,
  })
}

export function backendUpdateApartment(apartmentId: string, payload: Partial<CreateApartmentPayload & { verification_status?: string }>) {
  return apiRequest<BackendApartment>({
    path: `/api/properties/apartments/${encodeURIComponent(apartmentId)}/`,
    method: "PATCH",
    body: payload,
  })
}

export function backendUpdateApartmentForm(apartmentId: string, formData: FormData) {
  return apiRequest<BackendApartment>({
    path: `/api/properties/apartments/${encodeURIComponent(apartmentId)}/`,
    method: "PATCH",
    formData,
  })
}

export function backendDeleteApartment(apartmentId: string) {
  return apiRequest<unknown>({
    path: `/api/properties/apartments/${encodeURIComponent(apartmentId)}/`,
    method: "DELETE",
  })
}

export function backendUploadApartmentImage(apartmentId: string, image: File) {
  const fd = new FormData()
  fd.append("image", image)
  return apiRequest<{ message?: string; image_url?: string }>({
    path: `/api/properties/apartments/${encodeURIComponent(apartmentId)}/upload-image/`,
    method: "POST",
    formData: fd,
  })
}

export function backendSetApartmentVirtualTour(apartmentId: string, virtual_tour_url: string) {
  return apiRequest<{ message?: string }>({
    path: `/api/properties/apartments/${encodeURIComponent(apartmentId)}/set-virtual-tour/`,
    method: "POST",
    body: { virtual_tour_url },
  })
}

export function backendListAmenityDistances(apartmentId: string) {
  return apiRequest<BackendAmenityDistance[]>({
    path: `/api/properties/apartments/${encodeURIComponent(apartmentId)}/amenity-distances/`,
    method: "GET",
  })
}

export function backendSetAmenityDistances(
  apartmentId: string,
  items: Array<{ amenity_type: string; distance_km: string | number; nearest_name?: string }>,
) {
  return apiRequest<BackendAmenityDistance[]>({
    path: `/api/properties/apartments/${encodeURIComponent(apartmentId)}/set-amenity-distances/`,
    method: "POST",
    body: items,
  })
}

export function backendListUnits(params?: { apartment?: string }) {
  const qs = new URLSearchParams()
  if (params?.apartment) qs.set("apartment", params.apartment)
  const suffix = qs.toString() ? `?${qs.toString()}` : ""
  return apiRequest<BackendUnit[]>({
    path: `/api/properties/units/${suffix}`,
    method: "GET",
  })
}

export function backendCreateUnit(payload: {
  apartment: string
  unit_number_or_id: string
  category?: string
  type?: string
  size_sqft?: string | number | null
  price_per_month?: string | number | null
  status?: string
  description?: string
}) {
  return apiRequest<BackendUnit>({
    path: "/api/properties/units/",
    method: "POST",
    body: payload,
  })
}

export function backendUpdateUnit(unitId: string, payload: Partial<Omit<Parameters<typeof backendCreateUnit>[0], "apartment">>) {
  return apiRequest<BackendUnit>({
    path: `/api/properties/units/${encodeURIComponent(unitId)}/`,
    method: "PATCH",
    body: payload,
  })
}

export function backendDeleteUnit(unitId: string) {
  return apiRequest<unknown>({
    path: `/api/properties/units/${encodeURIComponent(unitId)}/`,
    method: "DELETE",
  })
}

export function backendUploadUnitImages(unitId: string, images: File[], imageType: "interior" | "exterior" = "interior") {
  const fd = new FormData()
  fd.append("image_type", imageType)
  for (const image of images) fd.append("images", image)
  return apiRequest<{
    message?: string
    image_type?: "interior" | "exterior"
    interior_images?: string[]
    exterior_images?: string[]
    uploaded?: string[]
  }>({
    path: `/api/properties/units/${encodeURIComponent(unitId)}/upload-images/`,
    method: "POST",
    formData: fd,
  })
}

export function backendUploadLeaseAgreement(apartmentId: string, document: File) {
  const fd = new FormData()
  fd.append("document", document)
  return apiRequest<BackendLeaseAgreement>({
    path: `/api/properties/lease-agreements/upload/?apartment_id=${encodeURIComponent(apartmentId)}`,
    method: "POST",
    formData: fd,
  })
}

// Admin-only endpoints (if enabled on backend)
export function backendVerifyApartment(apartmentId: string) {
  return apiRequest<unknown>({
    path: `/api/properties/apartments/${encodeURIComponent(apartmentId)}/verify/`,
    method: "POST",
  })
}

export function backendRejectApartment(apartmentId: string) {
  return apiRequest<unknown>({
    path: `/api/properties/apartments/${encodeURIComponent(apartmentId)}/reject/`,
    method: "POST",
  })
}

