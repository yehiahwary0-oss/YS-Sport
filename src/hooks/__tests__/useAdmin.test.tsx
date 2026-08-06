import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useAdminMetrics,
  useAdminAuditLogs,
  usePendingCoaches,
  useAdminCoaches,
  useVerifyCoach,
  useRejectCoach,
  usePendingPayments,
  useAdminPayments,
  useAdminPayouts,
  useConfirmPayment,
  useRefundPayment,
  useAdminUsers,
  useSuspendUser,
  useReactivateUser,
  useAdminBookings,
  useForceCompleteBooking,
  useAdminReviews,
  useApproveReview,
  useRejectReview,
  useFeaturedCoachesAdmin,
  useCreateFeaturedCoach,
  useUpdateFeaturedCoach,
  useDeleteFeaturedCoach,
  usePromoCodesAdmin,
  useCreatePromoCode,
  useUpdatePromoCode,
  useTogglePromoCodeStatus,
  useCreateAchievement,
  useUpdateAchievement,
  useToggleAchievementStatus,
  useDeletePromoCode,
  useAdminAthletes,
  useAdminAthleteProgression,
  useAdminAthleteXpEvents,
  useGrantXp,
  useGrantAchievement,
} from '../useAdmin'

const toastFn = vi.hoisted(() => {
  const fn = vi.fn()
  fn.success = vi.fn()
  fn.error = vi.fn()
  return fn
})

vi.mock('react-hot-toast', () => ({ default: toastFn }))

vi.mock('@/services/admin.service', () => ({
  adminService: {
    metrics: vi.fn(),
    auditLogs: vi.fn(),
    pendingCoaches: vi.fn(),
    listCoaches: vi.fn(),
    verifyCoach: vi.fn(),
    rejectCoach: vi.fn(),
    pendingPayments: vi.fn(),
    allPayments: vi.fn(),
    listPayouts: vi.fn(),
    confirmPayment: vi.fn(),
    refundPayment: vi.fn(),
    listUsers: vi.fn(),
    suspendUser: vi.fn(),
    reactivateUser: vi.fn(),
    listBookings: vi.fn(),
    forceCompleteBooking: vi.fn(),
    listReviews: vi.fn(),
    approveReview: vi.fn(),
    rejectReview: vi.fn(),
    listFeaturedCoaches: vi.fn(),
    createFeaturedCoach: vi.fn(),
    updateFeaturedCoach: vi.fn(),
    deleteFeaturedCoach: vi.fn(),
    listPromoCodes: vi.fn(),
    createPromoCode: vi.fn(),
    updatePromoCode: vi.fn(),
    togglePromoCodeStatus: vi.fn(),
    createAchievement: vi.fn(),
    updateAchievement: vi.fn(),
    toggleAchievementStatus: vi.fn(),
    deletePromoCode: vi.fn(),
    listAthletes: vi.fn(),
    getAthleteProgression: vi.fn(),
    getAthleteXpEvents: vi.fn(),
    grantXp: vi.fn(),
    grantAchievement: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  getApiError: vi.fn((e: unknown) => (e as Error).message),
}))

vi.mock('@/lib/analytics', () => ({
  ANALYTICS_EVENTS: { coachVerificationApproved: 'a', coachVerificationRejected: 'r' },
  trackEvent: vi.fn(),
}))

const { adminService } = await import('@/services/admin.service')
const toast = (await import('react-hot-toast')).default
const { trackEvent } = await import('@/lib/analytics')

const page = { data: [{ uuid: 'x1' }], meta: { current_page: 1, per_page: 15, last_page: 1, total: 1 } }

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('admin query hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useAdminMetrics fetches the dashboard metrics', async () => {
    const metrics = { coaches: { pending_verification: 1 } }
    vi.mocked(adminService.metrics).mockResolvedValue(metrics as never)
    const { result } = renderHook(() => useAdminMetrics(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(metrics)
  })

  it('useAdminAuditLogs passes the limit', async () => {
    vi.mocked(adminService.auditLogs).mockResolvedValue([] as never)
    const { result } = renderHook(() => useAdminAuditLogs(5), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(adminService.auditLogs).toHaveBeenCalledWith(5)
  })

  it('usePendingCoaches fetches the pending list', async () => {
    vi.mocked(adminService.pendingCoaches).mockResolvedValue(page as never)
    const { result } = renderHook(() => usePendingCoaches(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(page)
  })

  it('useAdminCoaches passes the filters', async () => {
    vi.mocked(adminService.listCoaches).mockResolvedValue(page as never)
    const filters = { search: 'ali', page: 1 }
    const { result } = renderHook(() => useAdminCoaches(filters), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(adminService.listCoaches).toHaveBeenCalledWith(filters)
  })

  it('usePendingPayments fetches the pending payments', async () => {
    vi.mocked(adminService.pendingPayments).mockResolvedValue(page as never)
    const { result } = renderHook(() => usePendingPayments(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(page)
  })

  it('useAdminPayments passes the filters', async () => {
    vi.mocked(adminService.allPayments).mockResolvedValue(page as never)
    const filters = { status: 'pending', page: 2 }
    const { result } = renderHook(() => useAdminPayments(filters), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(adminService.allPayments).toHaveBeenCalledWith(filters)
  })

  it('useAdminPayouts passes the filters', async () => {
    vi.mocked(adminService.listPayouts).mockResolvedValue(page as never)
    const filters = { status: 'requested', page: 1 }
    const { result } = renderHook(() => useAdminPayouts(filters), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(adminService.listPayouts).toHaveBeenCalledWith(filters)
  })

  it('useAdminUsers passes the filters', async () => {
    vi.mocked(adminService.listUsers).mockResolvedValue(page as never)
    const filters = { role: 'coach', page: 1 }
    const { result } = renderHook(() => useAdminUsers(filters), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(adminService.listUsers).toHaveBeenCalledWith(filters)
  })

  it('useAdminBookings passes the filters', async () => {
    vi.mocked(adminService.listBookings).mockResolvedValue(page as never)
    const filters = { status: 'pending', page: 1 }
    const { result } = renderHook(() => useAdminBookings(filters), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(adminService.listBookings).toHaveBeenCalledWith(filters)
  })

  it('useAdminReviews passes the filters', async () => {
    vi.mocked(adminService.listReviews).mockResolvedValue(page as never)
    const filters = { status: 'pending', page: 1 }
    const { result } = renderHook(() => useAdminReviews(filters), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(adminService.listReviews).toHaveBeenCalledWith(filters)
  })

  it('useFeaturedCoachesAdmin fetches the featured list', async () => {
    vi.mocked(adminService.listFeaturedCoaches).mockResolvedValue([{ id: 1 }] as never)
    const { result } = renderHook(() => useFeaturedCoachesAdmin(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([{ id: 1 }])
  })

  it('usePromoCodesAdmin fetches the promo codes', async () => {
    vi.mocked(adminService.listPromoCodes).mockResolvedValue([{ id: 1, code: 'X' }] as never)
    const { result } = renderHook(() => usePromoCodesAdmin(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([{ id: 1, code: 'X' }])
  })

  it('useAdminAthletes passes the filters', async () => {
    vi.mocked(adminService.listAthletes).mockResolvedValue(page as never)
    const filters = { page: 1 }
    const { result } = renderHook(() => useAdminAthletes(filters), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(adminService.listAthletes).toHaveBeenCalledWith(filters)
  })

  it('useAdminAthleteProgression fetches and is disabled without uuid', async () => {
    vi.mocked(adminService.getAthleteProgression).mockResolvedValue({ level: 3 } as never)
    const { result } = renderHook(() => useAdminAthleteProgression('a1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(adminService.getAthleteProgression).toHaveBeenCalledWith('a1')

    vi.clearAllMocks()
    const disabled = renderHook(() => useAdminAthleteProgression(undefined), { wrapper: createWrapper() })
    expect(disabled.result.current.fetchStatus).toBe('idle')
    expect(adminService.getAthleteProgression).not.toHaveBeenCalled()
  })

  it('useAdminAthleteXpEvents fetches and is disabled without uuid', async () => {
    vi.mocked(adminService.getAthleteXpEvents).mockResolvedValue({ data: [], meta: {} } as never)
    const { result } = renderHook(() => useAdminAthleteXpEvents('a1', { page: 1 }), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(adminService.getAthleteXpEvents).toHaveBeenCalledWith('a1', { page: 1 })
  })

  it('reports the error state on failure', async () => {
    vi.mocked(adminService.metrics).mockRejectedValue(new Error('down'))
    const { result } = renderHook(() => useAdminMetrics(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('admin mutation hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useVerifyCoach verifies and tracks the event', async () => {
    vi.mocked(adminService.verifyCoach).mockResolvedValue({ status: 'verified' } as never)
    const { result } = renderHook(() => useVerifyCoach(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('c1')
    })
    expect(adminService.verifyCoach).toHaveBeenCalledWith('c1')
    expect(trackEvent).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Coach verified.')
  })

  it('useRejectCoach rejects with a reason', async () => {
    vi.mocked(adminService.rejectCoach).mockResolvedValue({ status: 'rejected' } as never)
    const { result } = renderHook(() => useRejectCoach(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ uuid: 'c1', reason: 'bad docs' })
    })
    expect(adminService.rejectCoach).toHaveBeenCalledWith('c1', 'bad docs')
    expect(trackEvent).toHaveBeenCalled()
  })

  it('useConfirmPayment confirms with an optional reference', async () => {
    vi.mocked(adminService.confirmPayment).mockResolvedValue({ status: 'paid' } as never)
    const { result } = renderHook(() => useConfirmPayment(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ uuid: 'p1', externalReference: 'ref-9' })
    })
    expect(adminService.confirmPayment).toHaveBeenCalledWith('p1', 'ref-9')
    expect(toast.success).toHaveBeenCalledWith('Payment confirmed.')
  })

  it('useRefundPayment uses the server message when present', async () => {
    vi.mocked(adminService.refundPayment).mockResolvedValue({ message: 'Refund processed.' } as never)
    const { result } = renderHook(() => useRefundPayment(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ uuid: 'p1', reason: 'double charge' })
    })
    expect(adminService.refundPayment).toHaveBeenCalledWith('p1', 'double charge')
    expect(toast.success).toHaveBeenCalledWith('Refund processed.')
  })

  it('useRefundPayment falls back to the default toast', async () => {
    vi.mocked(adminService.refundPayment).mockResolvedValue({} as never)
    const { result } = renderHook(() => useRefundPayment(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ uuid: 'p1', reason: 'x' })
    })
    expect(toast.success).toHaveBeenCalledWith('Payment refunded.')
  })

  it('useSuspendUser suspends and toasts', async () => {
    vi.mocked(adminService.suspendUser).mockResolvedValue({} as never)
    const { result } = renderHook(() => useSuspendUser(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ uuid: 'u1', reason: 'spam' })
    })
    expect(adminService.suspendUser).toHaveBeenCalledWith('u1', 'spam')
    expect(toast.success).toHaveBeenCalledWith('User suspended.')
  })

  it('useReactivateUser reactivates and toasts', async () => {
    vi.mocked(adminService.reactivateUser).mockResolvedValue({} as never)
    const { result } = renderHook(() => useReactivateUser(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('u1')
    })
    expect(toast.success).toHaveBeenCalledWith('User reactivated.')
  })

  it('useForceCompleteBooking completes and toasts', async () => {
    vi.mocked(adminService.forceCompleteBooking).mockResolvedValue({} as never)
    const { result } = renderHook(() => useForceCompleteBooking(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ uuid: 'b1', reason: 'no-show' })
    })
    expect(adminService.forceCompleteBooking).toHaveBeenCalledWith('b1', 'no-show')
  })

  it('useApproveReview approves and toasts', async () => {
    vi.mocked(adminService.approveReview).mockResolvedValue({} as never)
    const { result } = renderHook(() => useApproveReview(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('r1')
    })
    expect(toast.success).toHaveBeenCalledWith('Review approved.')
  })

  it('useRejectReview rejects with a reason', async () => {
    vi.mocked(adminService.rejectReview).mockResolvedValue({} as never)
    const { result } = renderHook(() => useRejectReview(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ uuid: 'r1', reason: 'spam' })
    })
    expect(adminService.rejectReview).toHaveBeenCalledWith('r1', 'spam')
  })

  it('useCreateFeaturedCoach creates and toasts', async () => {
    vi.mocked(adminService.createFeaturedCoach).mockResolvedValue({ id: 1 } as never)
    const { result } = renderHook(() => useCreateFeaturedCoach(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ coach_uuid: 'c1' } as never)
    })
    expect(toast.success).toHaveBeenCalledWith('Featured coach added.')
  })

  it('useUpdateFeaturedCoach separates the id from the payload', async () => {
    vi.mocked(adminService.updateFeaturedCoach).mockResolvedValue({ id: 1 } as never)
    const { result } = renderHook(() => useUpdateFeaturedCoach(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ id: 1, sort_order: 5 } as never)
    })
    expect(adminService.updateFeaturedCoach).toHaveBeenCalledWith(1, { sort_order: 5 })
  })

  it('useDeleteFeaturedCoach deletes and toasts', async () => {
    vi.mocked(adminService.deleteFeaturedCoach).mockResolvedValue({} as never)
    const { result } = renderHook(() => useDeleteFeaturedCoach(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate(3)
    })
    expect(toast.success).toHaveBeenCalledWith('Featured coach removed.')
  })

  it('useCreatePromoCode creates and toasts', async () => {
    vi.mocked(adminService.createPromoCode).mockResolvedValue({ id: 1 } as never)
    const { result } = renderHook(() => useCreatePromoCode(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ code: 'SAVE10' } as never)
    })
    expect(toast.success).toHaveBeenCalledWith('Promo code created.')
  })

  it('useUpdatePromoCode separates the id from the payload', async () => {
    vi.mocked(adminService.updatePromoCode).mockResolvedValue({ id: 1 } as never)
    const { result } = renderHook(() => useUpdatePromoCode(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ id: 1, discount_percent: 20 } as never)
    })
    expect(adminService.updatePromoCode).toHaveBeenCalledWith(1, { discount_percent: 20 })
  })

  it('useTogglePromoCodeStatus toggles and toasts', async () => {
    vi.mocked(adminService.togglePromoCodeStatus).mockResolvedValue({} as never)
    const { result } = renderHook(() => useTogglePromoCodeStatus(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate(2)
    })
    expect(toast.success).toHaveBeenCalledWith('Promo code status toggled.')
  })

  it('useCreateAchievement creates and toasts', async () => {
    vi.mocked(adminService.createAchievement).mockResolvedValue({ id: 1 } as never)
    const { result } = renderHook(() => useCreateAchievement(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ slug: 'first-win' } as never)
    })
    expect(toast.success).toHaveBeenCalledWith('Achievement created.')
  })

  it('useUpdateAchievement separates the id from the payload', async () => {
    vi.mocked(adminService.updateAchievement).mockResolvedValue({ id: 1 } as never)
    const { result } = renderHook(() => useUpdateAchievement(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ id: 1, name: 'Renamed' } as never)
    })
    expect(adminService.updateAchievement).toHaveBeenCalledWith(1, { name: 'Renamed' })
  })

  it('useToggleAchievementStatus toggles and toasts', async () => {
    vi.mocked(adminService.toggleAchievementStatus).mockResolvedValue({} as never)
    const { result } = renderHook(() => useToggleAchievementStatus(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate(4)
    })
    expect(toast.success).toHaveBeenCalledWith('Achievement status updated.')
  })

  it('useDeletePromoCode deletes and toasts', async () => {
    vi.mocked(adminService.deletePromoCode).mockResolvedValue({} as never)
    const { result } = renderHook(() => useDeletePromoCode(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate(7)
    })
    expect(toast.success).toHaveBeenCalledWith('Promo code deleted.')
  })

  it('useGrantXp toasts success when awarded', async () => {
    vi.mocked(adminService.grantXp).mockResolvedValue({ status: 'awarded' } as never)
    const { result } = renderHook(() => useGrantXp('a1'), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ xp: 50, reason: 'challenge' })
    })
    expect(adminService.grantXp).toHaveBeenCalledWith('a1', { xp: 50, reason: 'challenge' })
    expect(toast.success).toHaveBeenCalledWith('XP granted successfully.')
  })

  it('useGrantXp toasts the already-granted message otherwise', async () => {
    vi.mocked(adminService.grantXp).mockResolvedValue({ status: 'already_awarded' } as never)
    const { result } = renderHook(() => useGrantXp('a1'), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ xp: 50, reason: 'x' })
    })
    expect(toast).toHaveBeenCalledWith('XP already granted.')
  })

  it('useGrantAchievement toasts success when awarded', async () => {
    vi.mocked(adminService.grantAchievement).mockResolvedValue({ status: 'awarded' } as never)
    const { result } = renderHook(() => useGrantAchievement(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ achievementId: 1, athleteId: 42 })
    })
    expect(adminService.grantAchievement).toHaveBeenCalledWith(1, 42)
    expect(toast.success).toHaveBeenCalledWith('Achievement granted to athlete.')
  })

  it('useGrantAchievement toasts the already-earned message otherwise', async () => {
    vi.mocked(adminService.grantAchievement).mockResolvedValue({ status: 'already_earned' } as never)
    const { result } = renderHook(() => useGrantAchievement(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ achievementId: 1, athleteId: 42 })
    })
    expect(toast).toHaveBeenCalledWith('Athlete already earned this achievement.')
  })

  it('toasts the error message on failure', async () => {
    vi.mocked(adminService.verifyCoach).mockRejectedValue(new Error('denied'))
    const { result } = renderHook(() => useVerifyCoach(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('c1')
    })
    expect(toast.error).toHaveBeenCalledWith('denied')
  })
})


