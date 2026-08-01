import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

// ── Axios instance ─────────────────────────────────────────────

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,   // send HttpOnly refresh token cookie
})

// ── Token storage (in-memory only — never localStorage) ────────

let accessToken: string | null = null

export const tokenStore = {
  get: () => accessToken,
  set: (token: string) => { accessToken = token },
  clear: () => { accessToken = null },
}

// ── Request interceptor — attach access token ──────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor — handle 401 + refresh ───────────────

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token!)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // 401 on a non-refresh endpoint — attempt token refresh
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const { data } = await api.post('/auth/refresh')
        const newToken = data.data.access_token
        tokenStore.set(newToken)
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        tokenStore.clear()

        // Redirect to login WITHOUT a full page reload.
        // window.location.href here was causing an infinite reload loop:
        // reload → Providers re-mounts → fetchUser() → 401 → refresh fails
        // → reload again. Dispatching a custom event lets the auth store
        // (already mounted, already knows it failed) handle the redirect
        // exactly once via Next.js's client-side router instead.
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/login')) {
          window.dispatchEvent(new Event('auth:logout'))
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ── Error helper ───────────────────────────────────────────────

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined
    if (data?.error?.message) return data.error.message
    if (error.message) return error.message
  }
  return 'Something went wrong. Please try again.'
}

export function getValidationErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined
    if (data?.error?.errors) {
      return Object.fromEntries(
        Object.entries(data.error.errors).map(([k, v]) => [k, v[0]])
      )
    }
  }
  return {}
}
