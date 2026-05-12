type ApiErrorShape = {
  error?: unknown
  detail?: unknown
  message?: unknown
  [k: string]: unknown
}

export class ApiError extends Error {
  status: number
  data?: unknown
  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/+$/, "")
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v)
}

function pickErrorMessage(data: unknown, fallback: string) {
  if (!isPlainObject(data)) return fallback
  const obj = data as ApiErrorShape
  if (typeof obj.error === "string" && obj.error.trim()) return obj.error
  if (typeof obj.detail === "string" && obj.detail.trim()) return obj.detail
  if (typeof obj.message === "string" && obj.message.trim()) return obj.message

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) return `${key}: ${value[0]}`
    if (typeof value === "string" && value.trim()) return `${key}: ${value}`
  }
  return fallback
}

async function readResponseBody(res: Response) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function getAuthToken() {
  if (typeof window === "undefined") return null
  try {
    // Try multiple sources for token, in order of preference
    // 1. Legacy token key
    const direct = localStorage.getItem("token")
    if (direct && direct.trim()) return direct.trim()
    
    // 2. Session key
    const rawSession = localStorage.getItem("tyrent_auth_session_v1")
    if (rawSession) {
      const parsed = JSON.parse(rawSession) as { token?: unknown }
      const sessionToken = typeof parsed?.token === "string" ? parsed.token.trim() : ""
      if (sessionToken) return sessionToken
    }
    
    // 3. Dedicated token key
    const dedicatedToken = localStorage.getItem("tyrent_auth_token_v1")
    if (dedicatedToken && dedicatedToken.trim()) return dedicatedToken.trim()
    
    return null
  } catch {
    return null
  }
}

export async function apiRequest<T>(input: {
  path: string
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  formData?: FormData
  token?: string | null
  headers?: Record<string, string>
}): Promise<T> {
  const url = `${getBaseUrl()}${input.path.startsWith("/") ? "" : "/"}${input.path}`
  const method = input.method ?? "GET"

  const token = input.token ?? getAuthToken()
  const headers: Record<string, string> = { ...(input.headers ?? {}) }

  let body: BodyInit | undefined
  if (input.formData) {
    body = input.formData
  } else if (typeof input.body !== "undefined") {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json"
    body = JSON.stringify(input.body)
  }

  if (token) {
    const raw = token.trim()
    const normalized = raw.toLowerCase().startsWith("token ")
      ? raw
      : raw.toLowerCase().startsWith("bearer ")
        ? `Token ${raw.slice(7).trim()}`
        : `Token ${raw}`
    headers.Authorization = headers.Authorization ?? normalized
  }

  const res = await fetch(url, { method, headers, body })
  const data = await readResponseBody(res)

  if (!res.ok) {
    throw new ApiError(pickErrorMessage(data, "Request failed"), res.status, data)
  }

  return data as T
}

