export type SavedSearch = {
  id: string
  createdAt: string
  label: string
  query: {
    area?: string
    bedrooms?: string
    maxPrice?: number
    amenities?: string[]
  }
}

const KEYS = {
  FAVORITES: "tyrent_favorites_v1",
  SAVED_SEARCHES: "tyrent_saved_searches_v1",
  REPORTS: "tyrent_reports_v1",
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

export function getFavorites(): string[] {
  if (!isBrowser()) return []
  const parsed = safeParseJson<string[]>(window.localStorage.getItem(KEYS.FAVORITES))
  return Array.isArray(parsed) ? parsed : []
}

export function setFavorites(next: string[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(KEYS.FAVORITES, JSON.stringify(next))
}

export function toggleFavorite(propertyId: string) {
  const existing = getFavorites()
  const next = existing.includes(propertyId) ? existing.filter((id) => id !== propertyId) : [propertyId, ...existing]
  setFavorites(next)
  return next
}

export function getSavedSearches(): SavedSearch[] {
  if (!isBrowser()) return []
  const parsed = safeParseJson<SavedSearch[]>(window.localStorage.getItem(KEYS.SAVED_SEARCHES))
  return Array.isArray(parsed) ? parsed : []
}

export function saveSearch(search: Omit<SavedSearch, "id" | "createdAt">) {
  const existing = getSavedSearches()
  const next: SavedSearch = { ...search, id: generateId("search"), createdAt: new Date().toISOString() }
  const updated = [next, ...existing].slice(0, 25)
  if (isBrowser()) window.localStorage.setItem(KEYS.SAVED_SEARCHES, JSON.stringify(updated))
  return updated
}

export type ListingReport = {
  id: string
  createdAt: string
  propertyId: string
  propertyTitle: string
  reason: string
  details?: string
  contactEmail?: string
}

export function getReports(): ListingReport[] {
  if (!isBrowser()) return []
  const parsed = safeParseJson<ListingReport[]>(window.localStorage.getItem(KEYS.REPORTS))
  return Array.isArray(parsed) ? parsed : []
}

export function submitReport(report: Omit<ListingReport, "id" | "createdAt">) {
  const existing = getReports()
  const next: ListingReport = { ...report, id: generateId("report"), createdAt: new Date().toISOString() }
  const updated = [next, ...existing].slice(0, 200)
  if (isBrowser()) window.localStorage.setItem(KEYS.REPORTS, JSON.stringify(updated))
  return updated
}

