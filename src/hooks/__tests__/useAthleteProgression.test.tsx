import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAthleteProgression } from '../useAthleteProgression'

const mockProgression = {
  data: {
    athlete: { uuid: 'u1', display_name: 'Test', avatar_url: null },
    summary: { total_xp: 100, total_sports: 2, primary_sport_id: 1 },
    sports: [],
    achievements: [],
  },
}

vi.mock('@/services/progression.service', () => ({
  progressionService: {
    getAthleteProgression: vi.fn(),
  },
}))

const { progressionService } = await import('@/services/progression.service')

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('useAthleteProgression', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return data on success', async () => {
    vi.mocked(progressionService.getAthleteProgression).mockResolvedValue(mockProgression)

    const { result } = renderHook(() => useAthleteProgression(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockProgression)
  })

  it('should return loading state initially', () => {
    vi.mocked(progressionService.getAthleteProgression).mockResolvedValue(mockProgression)

    const { result } = renderHook(() => useAthleteProgression(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
  })

  it('should return error on failure', async () => {
    vi.mocked(progressionService.getAthleteProgression).mockRejectedValue(new Error('API error'))

    const { result } = renderHook(() => useAthleteProgression(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })

  it('should refetch when refetch is called', async () => {
    vi.mocked(progressionService.getAthleteProgression).mockResolvedValue(mockProgression)

    const { result } = renderHook(() => useAthleteProgression(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    vi.mocked(progressionService.getAthleteProgression).mockResolvedValue({
      ...mockProgression,
      data: { ...mockProgression.data, summary: { ...mockProgression.data.summary, total_xp: 200 } },
    })

    result.current.refetch()
    await waitFor(() => {
      expect(progressionService.getAthleteProgression).toHaveBeenCalledTimes(2)
    })
  })
})
