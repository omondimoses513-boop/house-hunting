export type UserRole = "tenant" | "landlord" | "admin"

export type AuthUser = {
  id: string
  fullName: string
  email: string
  role: UserRole
  createdAt: string
}

export type AuthSession = {
  user: AuthUser
  token: string
  createdAt: string
}

type StoredUser = AuthUser & { passwordHash: string }

const KEYS = {
  USERS: "tyrent_auth_users_v1",
  SESSION: "tyrent_auth_session_v1",
} as const
const AUTH_CHANGED_EVENT = "tyrent-auth-changed"

const ADMIN_INVITE_CODE =
  // Optional: configure at build time for staging/prod
  (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_ADMIN_INVITE_CODE) ||
  // Default (change before real launch)
  "TYRENT-ADMIN-INVITE"

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function emitAuthChanged() {
  if (!isBrowser()) return
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
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

// NOTE: This is a frontend-only placeholder. Replace with real hashing server-side.
function pseudoHash(password: string) {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    hash = (hash * 31 + password.charCodeAt(i)) >>> 0
  }
  return `h_${hash.toString(16)}_${password.length}`
}

function getStoredUsers(): StoredUser[] {
  if (!isBrowser()) return []
  const parsed = safeParseJson<StoredUser[]>(window.localStorage.getItem(KEYS.USERS))
  return Array.isArray(parsed) ? parsed : []
}

function saveStoredUsers(users: StoredUser[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(KEYS.USERS, JSON.stringify(users))
}

export function getSession(): AuthSession | null {
  if (!isBrowser()) return null
  return safeParseJson<AuthSession>(window.localStorage.getItem(KEYS.SESSION))
}

export function saveSession(session: AuthSession) {
  if (!isBrowser()) return
  window.localStorage.setItem(KEYS.SESSION, JSON.stringify(session))
  emitAuthChanged()
}

export function signOut() {
  if (!isBrowser()) return
  window.localStorage.removeItem(KEYS.SESSION)
  emitAuthChanged()
}

export function registerUser(input: {
  fullName: string
  email: string
  password: string
  role: UserRole
  adminInviteCode?: string
}) {
  const email = input.email.trim().toLowerCase()
  const fullName = input.fullName.trim()
  if (!fullName) throw new Error("Full name is required.")
  if (!email || !email.includes("@")) throw new Error("A valid email is required.")
  if (input.password.length < 8) throw new Error("Password must be at least 8 characters.")

  if (input.role === "admin") {
    const provided = (input.adminInviteCode ?? "").trim()
    if (!provided || provided !== ADMIN_INVITE_CODE) {
      throw new Error("Admin registration is invite-only.")
    }
  }

  const existing = getStoredUsers()
  if (existing.some((u) => u.email === email)) throw new Error("An account with this email already exists.")

  const user: AuthUser = {
    id: generateId("user"),
    fullName,
    email,
    role: input.role,
    createdAt: new Date().toISOString(),
  }

  saveStoredUsers([{ ...user, passwordHash: pseudoHash(input.password) }, ...existing])

  const session: AuthSession = {
    user,
    token: generateId("token"),
    createdAt: new Date().toISOString(),
  }
  saveSession(session)
  return session
}

export function loginUser(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase()
  if (!email || !email.includes("@")) throw new Error("A valid email is required.")
  if (!input.password) throw new Error("Password is required.")

  const existing = getStoredUsers()
  const user = existing.find((u) => u.email === email)
  if (!user) throw new Error("No account found with that email.")

  if (user.passwordHash !== pseudoHash(input.password)) throw new Error("Incorrect password.")

  const session: AuthSession = {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    token: generateId("token"),
    createdAt: new Date().toISOString(),
  }
  saveSession(session)
  return session
}

export { AUTH_CHANGED_EVENT }

