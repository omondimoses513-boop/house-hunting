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
  TOKEN: "tyrent_auth_token_v1",
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

// Write session to both localStorage and a data attribute for better persistence
function writeSessionToDOM(session: AuthSession | null) {
  if (!isBrowser()) return
  if (session) {
    // Store in localStorage
    window.localStorage.setItem(KEYS.SESSION, JSON.stringify(session))
    // Also store token separately for API requests
    window.localStorage.setItem(KEYS.TOKEN, session.token)
    // Write to HTML element for SSR/hydration purposes
    document.documentElement.setAttribute("data-auth-token", session.token)
    document.documentElement.setAttribute("data-auth-user", session.user.role)
  } else {
    window.localStorage.removeItem(KEYS.SESSION)
    window.localStorage.removeItem(KEYS.TOKEN)
    window.localStorage.removeItem("token") // Clean up legacy token key
    document.documentElement.removeAttribute("data-auth-token")
    document.documentElement.removeAttribute("data-auth-user")
  }
}

// Read session from localStorage with fallback to DOM attributes
function readSessionFromDOM(): AuthSession | null {
  if (!isBrowser()) return null
  
  try {
    // Try to read from localStorage first
    const rawSession = window.localStorage.getItem(KEYS.SESSION)
    if (rawSession) {
      const parsed = JSON.parse(rawSession) as AuthSession
      return parsed
    }
    
    // Fallback: check for token in any storage location and reconstruct if possible
    const token = window.localStorage.getItem(KEYS.TOKEN) || window.localStorage.getItem("token")
    const domToken = document.documentElement.getAttribute("data-auth-token")
    const domRole = document.documentElement.getAttribute("data-auth-user")
    
    if ((token || domToken) && domRole) {
      // Reconstruct session from available data
      return {
        token: token || domToken || "",
        createdAt: new Date().toISOString(),
        user: {
          id: "unknown",
          fullName: "User",
          email: "unknown",
          role: (domRole as any) || "TENANT",
          createdAt: new Date().toISOString(),
        },
      }
    }
  } catch {
    // Fall back to nothing if parse fails
  }
  
  return null
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
  const session = readSessionFromDOM()
  return session
}

export function saveSession(session: AuthSession) {
  if (!isBrowser()) return
  writeSessionToDOM(session)
  // Also store token in legacy location for backward compatibility
  window.localStorage.setItem("token", session.token)
  emitAuthChanged()
}

export function signOut() {
  if (!isBrowser()) return
  writeSessionToDOM(null)
  // Clear cookies used by middleware for authentication
  document.cookie = "token=; path=/; max-age=0; SameSite=Lax"
  document.cookie = "role=; path=/; max-age=0; SameSite=Lax"
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

