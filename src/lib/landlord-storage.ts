export type LandlordPropertyUnit = {
  id: string
  unitNumber: string
  category: string
  type: string
  bedrooms: number
  bathrooms: number
  size: number
  rent: number
  deposit: number
  status: "vacant" | "occupied"
  imageNames: string[]
  imageUrls?: string[]
}

export type LandlordProperty = {
  id: string
  name: string
  propertyType: string
  description: string
  rules?: string
  county: string
  area: string
  street: string
  distanceToRoad?: string
  distanceToSchool?: string
  distanceToMarket?: string
  amenities: string[]
  customAmenities?: string
  imageNames: string[]
  imageUrls?: string[]
  leaseAgreementName?: string
  units: LandlordPropertyUnit[]
  createdAt: string
  updatedAt: string
}

export type BookingStatus = "pending" | "approved" | "declined"

export type LandlordBooking = {
  id: string
  tenant: string
  propertyId: string
  propertyName: string
  unit: string
  moveInDate: string
  amount: number
  status: BookingStatus
  submittedDate: string
}

export type LandlordProfile = {
  fullName: string
  email: string
  phone: string
  idNumber: string
  address: string
  bankName: string
  accountNumber: string
  accountName: string
  branchCode?: string
  idDocumentName: string
  proofOfOwnershipName: string
  kraPinName?: string
  createdAt: string
}

const KEYS = {
  PROPERTIES: "tyrent_landlord_properties_v1",
  BOOKINGS: "tyrent_landlord_bookings_v1",
  PROFILE: "tyrent_landlord_profile_v1",
} as const

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export function generateId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export function getLandlordProperties(): LandlordProperty[] {
  if (!isBrowser()) return []
  const parsed = safeParseJson<LandlordProperty[]>(window.localStorage.getItem(KEYS.PROPERTIES))
  return Array.isArray(parsed) ? parsed : []
}

export function saveLandlordProperties(properties: LandlordProperty[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(KEYS.PROPERTIES, JSON.stringify(properties))
}

export function upsertLandlordProperty(property: LandlordProperty) {
  const existing = getLandlordProperties()
  const idx = existing.findIndex((p) => p.id === property.id)
  const next =
    idx >= 0 ? [...existing.slice(0, idx), property, ...existing.slice(idx + 1)] : [property, ...existing]
  saveLandlordProperties(next)
  return next
}

export function getLandlordPropertyById(propertyId: string): LandlordProperty | null {
  const existing = getLandlordProperties()
  return existing.find((p) => p.id === propertyId) ?? null
}

export function getLandlordBookings(): LandlordBooking[] {
  if (!isBrowser()) return []
  const parsed = safeParseJson<LandlordBooking[]>(window.localStorage.getItem(KEYS.BOOKINGS))
  return Array.isArray(parsed) ? parsed : []
}

export function saveLandlordBookings(bookings: LandlordBooking[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings))
}

export function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const existing = getLandlordBookings()
  const next = existing.map((b) => (b.id === bookingId ? { ...b, status } : b))
  saveLandlordBookings(next)
  return next
}

export function getLandlordProfile(): LandlordProfile | null {
  if (!isBrowser()) return null
  const parsed = safeParseJson<LandlordProfile>(window.localStorage.getItem(KEYS.PROFILE))
  return parsed ?? null
}

export function saveLandlordProfile(profile: LandlordProfile) {
  if (!isBrowser()) return
  window.localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile))
}

export function seedLandlordDemoDataIfEmpty() {
  if (!isBrowser()) return

  const properties = getLandlordProperties()
  const bookings = getLandlordBookings()

  if (properties.length === 0) {
    const now = new Date().toISOString()
    const demo: LandlordProperty[] = [
      {
        id: "demo_property_1",
        name: "Sunrise Apartments",
        propertyType: "apartment",
        description: "Modern apartments in a quiet neighborhood.",
        rules: "",
        county: "Nairobi",
        area: "Kilimani",
        street: "Kilimani Road",
        distanceToRoad: "500m",
        distanceToSchool: "1km",
        distanceToMarket: "2km",
        amenities: ["WiFi", "Parking", "24/7 Security"],
        customAmenities: "",
        imageNames: ["modern-apartment-living-room.png"],
        imageUrls: [
          "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
        ],
        leaseAgreementName: "",
        units: [
          {
            id: "demo_unit_1",
            unitNumber: "A101",
            category: "living",
            type: "2bedroom",
            bedrooms: 2,
            bathrooms: 1,
            size: 900,
            rent: 65000,
            deposit: 65000,
            status: "occupied",
            imageNames: ["unit-a101.jpg"],
            imageUrls: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80"],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "demo_property_2",
        name: "Westlands Heights",
        propertyType: "apartment",
        description: "Central Westlands living with great amenities.",
        rules: "",
        county: "Nairobi",
        area: "Westlands",
        street: "Woodvale Grove",
        distanceToRoad: "200m",
        distanceToSchool: "1.5km",
        distanceToMarket: "700m",
        amenities: ["Parking", "Backup Generator", "Water Supply"],
        customAmenities: "",
        imageNames: ["luxury-penthouse-living-room.png"],
        imageUrls: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80"],
        leaseAgreementName: "",
        units: [
          {
            id: "demo_unit_2",
            unitNumber: "B205",
            category: "living",
            type: "1bedroom",
            bedrooms: 1,
            bathrooms: 1,
            size: 650,
            rent: 80000,
            deposit: 80000,
            status: "vacant",
            imageNames: ["unit-b205.jpg"],
            imageUrls: ["https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1600&q=80"],
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
    ]
    saveLandlordProperties(demo)
  }
  // Upgrade previously-seeded demo data to include internet image URLs.
  else {
    let changed = false
    const upgraded = properties.map((p) => {
      if (p.id === "demo_property_1") {
        const next: LandlordProperty = {
          ...p,
          imageUrls:
            p.imageUrls && p.imageUrls.length > 0
              ? p.imageUrls
              : [
                  "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1600&q=80",
                  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
                ],
          units: (p.units ?? []).map((u) => ({
            ...u,
            imageUrls:
              u.imageUrls && u.imageUrls.length > 0
                ? u.imageUrls
                : [
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
                  ],
          })),
        }
        if (JSON.stringify(next) !== JSON.stringify(p)) changed = true
        return next
      }

      if (p.id === "demo_property_2") {
        const next: LandlordProperty = {
          ...p,
          imageUrls:
            p.imageUrls && p.imageUrls.length > 0
              ? p.imageUrls
              : ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80"],
          units: (p.units ?? []).map((u) => ({
            ...u,
            imageUrls:
              u.imageUrls && u.imageUrls.length > 0
                ? u.imageUrls
                : ["https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1600&q=80"],
          })),
        }
        if (JSON.stringify(next) !== JSON.stringify(p)) changed = true
        return next
      }

      return p
    })

    if (changed) {
      saveLandlordProperties(upgraded)
    }
  }

  if (bookings.length === 0) {
    const demoProps = getLandlordProperties()
    const p1 = demoProps.find((p) => p.id === "demo_property_1")
    const p2 = demoProps.find((p) => p.id === "demo_property_2")
    const demoBookings: LandlordBooking[] = [
      {
        id: "demo_booking_1",
        tenant: "Jane Wanjiru",
        propertyId: p1?.id ?? "demo_property_1",
        propertyName: p1?.name ?? "Sunrise Apartments",
        unit: "A101",
        moveInDate: "2025-03-01",
        amount: 200000,
        status: "pending",
        submittedDate: "2025-02-15",
      },
      {
        id: "demo_booking_2",
        tenant: "Peter Omondi",
        propertyId: p2?.id ?? "demo_property_2",
        propertyName: p2?.name ?? "Westlands Heights",
        unit: "B205",
        moveInDate: "2025-03-15",
        amount: 180000,
        status: "pending",
        submittedDate: "2025-02-16",
      },
    ]
    saveLandlordBookings(demoBookings)
  }
}

