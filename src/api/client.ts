const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const AUTH_STORAGE_KEY = 'crownex_admin_auth'

export interface AdminInfo {
  id: number
  email: string
  full_name: string
}

export interface StoredAuth {
  access: string
  refresh: string
  admin: AdminInfo
}

export function getStoredAuth(): StoredAuth | null {
  const raw = sessionStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

export function setStoredAuth(auth: StoredAuth) {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export function clearStoredAuth() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
}

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  auth?: boolean
  params?: Record<string, string | number | undefined>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, params } = options

  let url = `${API_BASE_URL}${path}`
  if (params) {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') query.set(key, String(value))
    }
    const qs = query.toString()
    if (qs) url += `?${qs}`
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) {
    const stored = getStoredAuth()
    if (stored?.access) headers.Authorization = `Bearer ${stored.access}`
  }

  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0)
  }

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    const detail = isRecord(data) && typeof data.detail === 'string' ? data.detail : null
    const code = isRecord(data) && typeof data.code === 'string' ? data.code : undefined
    throw new ApiError(detail || `Request failed (${res.status}).`, res.status, code)
  }

  return data as T
}

export const apiClient = { request }
