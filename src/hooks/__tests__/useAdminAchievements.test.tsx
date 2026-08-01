import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useAdminAchievements,
  useCreateAchievement,
  useUpdateAchievement,
  useToggleAchievementStatus,
} from '../useAdmin'

vi.mock('@/services/admin.service', () => ({
  adminService: {
    listAchievements: vi.fn(),
    createAchievement: vi.fn(),
    updateAchievement: vi.fn(),
    toggleAchievementStatus: vi.fn(),
  },
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

const { adminService } = await import('@/services/admin.service')
const toast = (await import('react-hot-toast')).default

const mockAchievement = {
  id: 1,
  uuid: 'uuid-1',
  slug: 'first-session',
  name: 'First Session',
  description: null,
  icon: null,
  category: null,
  sport_id: null,
  criteria: { type: 'session_count', operator: 'gte', value: 1 },
  xp_reward: 50,
  sort_order: 0,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
}

const paginated = {
  data: [mockAchievement],
  meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
}

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('useAdminAchievements', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns data on success', async () => {
    vi.mocked(adminService.listAchievements).mockResolvedValue(paginated)

    const { result } = renderHook(() => useAdminAchievements({ page: 1 }), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(paginated)
  })

  it('returns loading state initially', () => {
    vi.mocked(adminService.listAchievements).mockResolvedValue(paginated)

    const { result } = renderHook(() => useAdminAchievements({}), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
  })

  it('returns error on failure', async () => {
    vi.mocked(adminService.listAchievements).mockRejectedValue(new Error('API error'))

    const { result } = renderHook(() => useAdminAchievements({}), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

describe('useCreateAchievement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls service and invalidates query on success', async () => {
    vi.mocked(adminService.createAchievement).mockResolvedValue(mockAchievement)

    const { result } = renderHook(() => useCreateAchievement(), { wrapper: createWrapper() })

    result.current.mutate({ slug: 'test', name: 'Test', criteria_type: 'session_count' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(adminService.createAchievement).toHaveBeenCalledOnce()
    expect(toast.success).toHaveBeenCalled()
  })

  it('shows error toast on failure', async () => {
    vi.mocked(adminService.createAchievement).mockRejectedValue(new Error('Validation error'))

    const { result } = renderHook(() => useCreateAchievement(), { wrapper: createWrapper() })

    result.current.mutate({ slug: 'test', name: 'Test', criteria_type: 'session_count' })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).toHaveBeenCalled()
  })
})

describe('useUpdateAchievement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls service with id and payload on success', async () => {
    vi.mocked(adminService.updateAchievement).mockResolvedValue(mockAchievement)

    const { result } = renderHook(() => useUpdateAchievement(), { wrapper: createWrapper() })

    result.current.mutate({ id: 1, name: 'Updated' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(adminService.updateAchievement).toHaveBeenCalledWith(1, { name: 'Updated' })
    expect(toast.success).toHaveBeenCalled()
  })
})

describe('useToggleAchievementStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls service and invalidates on success', async () => {
    vi.mocked(adminService.toggleAchievementStatus).mockResolvedValue({ ...mockAchievement, is_active: false })

    const { result } = renderHook(() => useToggleAchievementStatus(), { wrapper: createWrapper() })

    result.current.mutate(1)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(adminService.toggleAchievementStatus).toHaveBeenCalledWith(1)
    expect(toast.success).toHaveBeenCalled()
  })
})
