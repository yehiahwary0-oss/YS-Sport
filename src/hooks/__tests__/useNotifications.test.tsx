import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '../useNotifications'

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn() },
}))

vi.mock('@/services/notification.service', () => ({
  notificationService: {
    list: vi.fn(),
    unreadCount: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  getApiError: vi.fn((e: unknown) => (e as Error).message),
}))

const { notificationService } = await import('@/services/notification.service')
const toast = (await import('react-hot-toast')).default

const page = { data: [{ id: 1 }], meta: { current_page: 1, per_page: 15, last_page: 1, total: 1 } }

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('notification hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useNotifications fetches with the given filters', async () => {
    vi.mocked(notificationService.list).mockResolvedValue(page as never)
    const { result } = renderHook(() => useNotifications({ read: false }), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(notificationService.list).toHaveBeenCalledWith({ read: false })
    expect(result.current.data).toEqual(page)
  })

  it('useNotifications fetches without filters', async () => {
    vi.mocked(notificationService.list).mockResolvedValue(page as never)
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(notificationService.list).toHaveBeenCalledWith(undefined)
  })

  it('useUnreadNotificationCount fetches the count', async () => {
    vi.mocked(notificationService.unreadCount).mockResolvedValue(5)
    const { result } = renderHook(() => useUnreadNotificationCount(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBe(5)
  })

  it('useMarkNotificationRead marks a single notification', async () => {
    vi.mocked(notificationService.markRead).mockResolvedValue({} as never)
    const { result } = renderHook(() => useMarkNotificationRead(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('n1')
    })
    expect(notificationService.markRead).toHaveBeenCalledWith('n1')
  })

  it('useMarkAllNotificationsRead marks all', async () => {
    vi.mocked(notificationService.markAllRead).mockResolvedValue({} as never)
    const { result } = renderHook(() => useMarkAllNotificationsRead(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate()
    })
    expect(notificationService.markAllRead).toHaveBeenCalled()
  })

  it('toasts the error message on failure', async () => {
    vi.mocked(notificationService.markRead).mockRejectedValue(new Error('gone'))
    const { result } = renderHook(() => useMarkNotificationRead(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('n1')
    })
    expect(toast.error).toHaveBeenCalledWith('gone')
  })

  it('toasts the error message when marking all fails', async () => {
    vi.mocked(notificationService.markAllRead).mockRejectedValue(new Error('server down'))
    const { result } = renderHook(() => useMarkAllNotificationsRead(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate()
    })
    expect(toast.error).toHaveBeenCalledWith('server down')
  })
})
