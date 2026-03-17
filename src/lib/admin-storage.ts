export type AdminUserType = "tenant" | "landlord"
export type AdminUserStatus = "active" | "pending" | "suspended"

export type AdminUser = {
  id: string
  name: string
  email: string
  type: AdminUserType
  status: AdminUserStatus
  joinedDate: string
  verified: boolean
}

export type VerificationStatus = "pending" | "under-review" | "approved" | "rejected"

export type AdminVerification = {
  id: string
  landlord: string
  property: string
  submittedDate: string
  documents: string[]
  status: VerificationStatus
  notes?: string
}

export type DisputePriority = "high" | "medium" | "low"
export type DisputeStatus = "open" | "investigating" | "resolved"

export type AdminDispute = {
  id: string
  tenant: string
  landlord: string
  property: string
  issue: string
  priority: DisputePriority
  status: DisputeStatus
  submittedDate: string
  resolution?: string
}

export type AdminStats = {
  totalUsers: number
  totalLandlords: number
  totalTenants: number
  totalProperties: number
  totalUnits: number
  occupancyRate: number
  totalRevenue: number
  revenueGrowth: number
}

const KEYS = {
  USERS: "tyrent_admin_users_v1",
  VERIFICATIONS: "tyrent_admin_verifications_v1",
  DISPUTES: "tyrent_admin_disputes_v1",
  STATS: "tyrent_admin_stats_v1",
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

export function getAdminUsers(): AdminUser[] {
  if (!isBrowser()) return []
  const parsed = safeParseJson<AdminUser[]>(window.localStorage.getItem(KEYS.USERS))
  return Array.isArray(parsed) ? parsed : []
}

export function saveAdminUsers(users: AdminUser[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(KEYS.USERS, JSON.stringify(users))
}

export function updateAdminUser(userId: string, patch: Partial<AdminUser>) {
  const users = getAdminUsers()
  const next = users.map((u) => (u.id === userId ? { ...u, ...patch } : u))
  saveAdminUsers(next)
  return next
}

export function getAdminVerifications(): AdminVerification[] {
  if (!isBrowser()) return []
  const parsed = safeParseJson<AdminVerification[]>(window.localStorage.getItem(KEYS.VERIFICATIONS))
  return Array.isArray(parsed) ? parsed : []
}

export function saveAdminVerifications(items: AdminVerification[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(KEYS.VERIFICATIONS, JSON.stringify(items))
}

export function updateAdminVerification(id: string, patch: Partial<AdminVerification>) {
  const items = getAdminVerifications()
  const next = items.map((v) => (v.id === id ? { ...v, ...patch } : v))
  saveAdminVerifications(next)
  return next
}

export function getAdminDisputes(): AdminDispute[] {
  if (!isBrowser()) return []
  const parsed = safeParseJson<AdminDispute[]>(window.localStorage.getItem(KEYS.DISPUTES))
  return Array.isArray(parsed) ? parsed : []
}

export function saveAdminDisputes(items: AdminDispute[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(KEYS.DISPUTES, JSON.stringify(items))
}

export function updateAdminDispute(id: string, patch: Partial<AdminDispute>) {
  const items = getAdminDisputes()
  const next = items.map((d) => (d.id === id ? { ...d, ...patch } : d))
  saveAdminDisputes(next)
  return next
}

export function getAdminStats(): AdminStats | null {
  if (!isBrowser()) return null
  return safeParseJson<AdminStats>(window.localStorage.getItem(KEYS.STATS))
}

export function saveAdminStats(stats: AdminStats) {
  if (!isBrowser()) return
  window.localStorage.setItem(KEYS.STATS, JSON.stringify(stats))
}

export function seedAdminDemoDataIfEmpty() {
  if (!isBrowser()) return

  const users = getAdminUsers()
  const verifications = getAdminVerifications()
  const disputes = getAdminDisputes()
  const stats = getAdminStats()

  if (users.length === 0) {
    saveAdminUsers([
      {
        id: "usr_1",
        name: "Jane Wanjiru",
        email: "jane@example.com",
        type: "tenant",
        status: "active",
        joinedDate: "2025-02-15",
        verified: true,
      },
      {
        id: "usr_2",
        name: "Peter Omondi",
        email: "peter@example.com",
        type: "landlord",
        status: "pending",
        joinedDate: "2025-02-16",
        verified: false,
      },
      {
        id: "usr_3",
        name: "Mary Njeri",
        email: "mary@example.com",
        type: "tenant",
        status: "active",
        joinedDate: "2025-02-14",
        verified: true,
      },
    ])
  }

  if (verifications.length === 0) {
    saveAdminVerifications([
      {
        id: "ver_1",
        landlord: "John Kamau",
        property: "Sunrise Apartments",
        submittedDate: "2025-02-10",
        documents: ["ID", "Title Deed", "KRA PIN"],
        status: "pending",
      },
      {
        id: "ver_2",
        landlord: "Sarah Wanjiku",
        property: "Westlands Heights",
        submittedDate: "2025-02-12",
        documents: ["ID", "Title Deed"],
        status: "under-review",
      },
    ])
  }

  if (disputes.length === 0) {
    saveAdminDisputes([
      {
        id: "dsp_1",
        tenant: "Jane Wanjiru",
        landlord: "John Kamau",
        property: "Sunrise Apartments - A101",
        issue: "Deposit refund dispute",
        priority: "high",
        status: "open",
        submittedDate: "2025-02-14",
      },
      {
        id: "dsp_2",
        tenant: "Peter Omondi",
        landlord: "Sarah Wanjiku",
        property: "Westlands Heights - B205",
        issue: "Maintenance not addressed",
        priority: "medium",
        status: "investigating",
        submittedDate: "2025-02-15",
      },
    ])
  }

  if (!stats) {
    saveAdminStats({
      totalUsers: 1247,
      totalLandlords: 342,
      totalTenants: 905,
      totalProperties: 856,
      totalUnits: 3421,
      occupancyRate: 87.5,
      totalRevenue: 45600000,
      revenueGrowth: 18.3,
    })
  }
}

