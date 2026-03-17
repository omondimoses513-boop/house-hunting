export type TenantLandlordContact = {
  name: string
  phone: string
  email: string
  verified: boolean
}

export type TenantLease = {
  id: string
  propertyId: string
  property: string
  unit: string
  location: string
  landlord: TenantLandlordContact
  rent: number
  deposit: number
  leaseStart: string
  leaseEnd: string
  nextPaymentDue: string
  imageUrl?: string
}

export type PaymentStatus = "paid" | "pending" | "failed"
export type PaymentMethod = "M-Pesa" | "Card" | "Bank"

export type TenantPayment = {
  id: string
  date: string
  amount: number
  status: PaymentStatus
  method: PaymentMethod
  reference: string
  note?: string
}

export type MaintenanceStatus = "pending" | "in-progress" | "resolved"
export type MaintenancePriority = "low" | "medium" | "high"

export type TenantMaintenanceRequest = {
  id: string
  title: string
  description: string
  status: MaintenanceStatus
  priority: MaintenancePriority
  submittedDate: string
  category: string
}

export type TenantDocument = {
  id: string
  name: string
  type: "PDF" | "TXT"
  size: string
  uploadedDate: string
  content?: string
}

export type TenantMessage = {
  id: string
  createdAt: string
  to: "landlord"
  subject: string
  body: string
}

const KEYS = {
  LEASE: "tyrent_tenant_lease_v1",
  PAYMENTS: "tyrent_tenant_payments_v1",
  MAINTENANCE: "tyrent_tenant_maintenance_v1",
  DOCUMENTS: "tyrent_tenant_documents_v1",
  MESSAGES: "tyrent_tenant_messages_v1",
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

export function getTenantLease(): TenantLease | null {
  if (!isBrowser()) return null
  return safeParseJson<TenantLease>(window.localStorage.getItem(KEYS.LEASE))
}

export function saveTenantLease(lease: TenantLease) {
  if (!isBrowser()) return
  window.localStorage.setItem(KEYS.LEASE, JSON.stringify(lease))
}

export function getTenantPayments(): TenantPayment[] {
  if (!isBrowser()) return []
  const parsed = safeParseJson<TenantPayment[]>(window.localStorage.getItem(KEYS.PAYMENTS))
  return Array.isArray(parsed) ? parsed : []
}

export function saveTenantPayments(payments: TenantPayment[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(payments))
}

export function addTenantPayment(payment: TenantPayment) {
  const existing = getTenantPayments()
  const next = [payment, ...existing]
  saveTenantPayments(next)
  return next
}

export function getTenantMaintenanceRequests(): TenantMaintenanceRequest[] {
  if (!isBrowser()) return []
  const parsed = safeParseJson<TenantMaintenanceRequest[]>(window.localStorage.getItem(KEYS.MAINTENANCE))
  return Array.isArray(parsed) ? parsed : []
}

export function saveTenantMaintenanceRequests(requests: TenantMaintenanceRequest[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(KEYS.MAINTENANCE, JSON.stringify(requests))
}

export function addTenantMaintenanceRequest(req: TenantMaintenanceRequest) {
  const existing = getTenantMaintenanceRequests()
  const next = [req, ...existing]
  saveTenantMaintenanceRequests(next)
  return next
}

export function updateTenantMaintenanceStatus(id: string, status: MaintenanceStatus) {
  const existing = getTenantMaintenanceRequests()
  const next = existing.map((r) => (r.id === id ? { ...r, status } : r))
  saveTenantMaintenanceRequests(next)
  return next
}

export function getTenantDocuments(): TenantDocument[] {
  if (!isBrowser()) return []
  const parsed = safeParseJson<TenantDocument[]>(window.localStorage.getItem(KEYS.DOCUMENTS))
  return Array.isArray(parsed) ? parsed : []
}

export function saveTenantDocuments(docs: TenantDocument[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(docs))
}

export function getTenantMessages(): TenantMessage[] {
  if (!isBrowser()) return []
  const parsed = safeParseJson<TenantMessage[]>(window.localStorage.getItem(KEYS.MESSAGES))
  return Array.isArray(parsed) ? parsed : []
}

export function saveTenantMessages(messages: TenantMessage[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages))
}

export function addTenantMessage(message: TenantMessage) {
  const existing = getTenantMessages()
  const next = [message, ...existing]
  saveTenantMessages(next)
  return next
}

export function seedTenantDemoDataIfEmpty() {
  if (!isBrowser()) return

  const lease = getTenantLease()
  const payments = getTenantPayments()
  const maintenance = getTenantMaintenanceRequests()
  const documents = getTenantDocuments()

  if (!lease) {
    saveTenantLease({
      id: "demo_lease_1",
      propertyId: "demo_property_1",
      property: "Modern 2BR Apartment in Kilimani",
      unit: "A101",
      location: "Kilimani, Nairobi",
      landlord: {
        name: "John Kamau",
        phone: "+254 700 000 000",
        email: "john@example.com",
        verified: true,
      },
      rent: 65000,
      deposit: 130000,
      leaseStart: "2025-01-01",
      leaseEnd: "2025-12-31",
      nextPaymentDue: "2025-03-01",
      imageUrl:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
    })
  }

  if (payments.length === 0) {
    saveTenantPayments([
      { id: "pay_1", date: "2025-02-01", amount: 65000, status: "paid", method: "M-Pesa", reference: "TYR-PAY-001" },
      { id: "pay_2", date: "2025-01-01", amount: 195000, status: "paid", method: "M-Pesa", reference: "TYR-PAY-002" },
    ])
  }

  if (maintenance.length === 0) {
    saveTenantMaintenanceRequests([
      {
        id: "mnt_1",
        title: "Leaking kitchen faucet",
        description: "The kitchen faucet has been leaking for 2 days",
        status: "in-progress",
        priority: "medium",
        submittedDate: "2025-02-10",
        category: "Plumbing",
      },
      {
        id: "mnt_2",
        title: "Broken window lock",
        description: "Window lock in bedroom needs replacement",
        status: "pending",
        priority: "high",
        submittedDate: "2025-02-15",
        category: "Security",
      },
    ])
  }

  if (documents.length === 0) {
    saveTenantDocuments([
      {
        id: "doc_1",
        name: "Lease Agreement",
        type: "PDF",
        size: "2.4 MB",
        uploadedDate: "2025-01-01",
        content: "Demo lease agreement placeholder.",
      },
      {
        id: "doc_2",
        name: "Move-in Inspection Report",
        type: "PDF",
        size: "1.8 MB",
        uploadedDate: "2025-01-01",
        content: "Demo inspection report placeholder.",
      },
      {
        id: "doc_3",
        name: "Payment Receipt - Feb 2025",
        type: "PDF",
        size: "156 KB",
        uploadedDate: "2025-02-01",
        content: "Demo receipt placeholder.",
      },
    ])
  }
}

