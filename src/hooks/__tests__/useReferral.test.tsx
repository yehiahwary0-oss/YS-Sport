import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useReferralInfo, useRegenerateCode } from '../useReferral'

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/services/referral.service', () => ({
  referralService: {
    getReferralInfo: vi.fn(),
    regenerateCode: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  getApiError: vi.fn((e: unknown) => (e as Error).message),
}))

const { referralService } = await import('@/services/referral.service')
const toast = (await import('react-hot-toast')).default

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('referral hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useReferralInfo fetches the referral info', async () => {
    const info = { code: 'ABC123', share_url: 'https://x/ABC123', total_referrals: 2, earned_credit: '10.00' }
    vi.mocked(referralService.getReferralInfo).mockResolvedValue(info as never)
    const { result } = renderHook(() => useReferralInfo(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(info)
  })

  it('useReferralInfo reports the error state', async () => {
    vi.mocked(referralService.getReferralInfo).mockRejectedValue(new Error('down'))
    const { result } = renderHook(() => useReferralInfo(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('useRegenerateCode regenerates and toasts', async () => {
    vi.mocked(referralService.regenerateCode).mockResolvedValue({ code: 'NEW1', share_url: 'https://x/NEW1' } as never)
    const { result } = renderHook(() => useRegenerateCode(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate()
    })
    expect(referralService.regenerateCode).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Referral code regenerated!')
  })

  it('useRegenerateCode toasts the error on failure', async () => {
    vi.mocked(referralService.regenerateCode).mockRejectedValue(new Error('nope'))
    const { result } = renderHook(() => useRegenerateCode(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate()
    })
    expect(toast.error).toHaveBeenCalledWith('nope')
  })
})
