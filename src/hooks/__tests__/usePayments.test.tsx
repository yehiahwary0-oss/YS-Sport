import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useAthletePayments,
  useCreateCheckout,
  useConfirmPaymentSuccess,
  useConfirmPaymentCancelled,
  useMarkManualPaid,
  useValidatePromoCode,
} from '../usePayments'

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/services/payment.service', () => ({
  paymentService: {
    listAthlete: vi.fn(),
    createCheckout: vi.fn(),
    confirmSuccess: vi.fn(),
    confirmCancelled: vi.fn(),
    markManualPaid: vi.fn(),
    validatePromoCode: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  getApiError: vi.fn((e: unknown) => (e as Error).message),
}))

const { paymentService } = await import('@/services/payment.service')
const toast = (await import('react-hot-toast')).default

const page = { data: [], meta: { current_page: 1, per_page: 15, last_page: 1, total: 0 } }

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('payment hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useAthletePayments fetches with the page', async () => {
    vi.mocked(paymentService.listAthlete).mockResolvedValue(page as never)
    const { result } = renderHook(() => useAthletePayments(2), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(paymentService.listAthlete).toHaveBeenCalledWith(2)
  })

  it('useCreateCheckout creates a checkout session', async () => {
    vi.mocked(paymentService.createCheckout).mockResolvedValue({ checkout_url: 'https://pay/x' } as never)
    const { result } = renderHook(() => useCreateCheckout(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ bookingUuid: 'b1', returnUrl: 'https://ret', cancelUrl: 'https://can', promoCode: 'SAVE10' })
    })
    expect(paymentService.createCheckout).toHaveBeenCalledWith('b1', 'https://ret', 'https://can', 'SAVE10')
  })

  it('useConfirmPaymentSuccess confirms and toasts', async () => {
    vi.mocked(paymentService.confirmSuccess).mockResolvedValue({ status: 'paid' } as never)
    const { result } = renderHook(() => useConfirmPaymentSuccess(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('b1')
    })
    expect(paymentService.confirmSuccess).toHaveBeenCalledWith('b1')
    expect(toast.success).toHaveBeenCalledWith('Payment verified!')
  })

  it('useConfirmPaymentCancelled confirms the cancellation', async () => {
    vi.mocked(paymentService.confirmCancelled).mockResolvedValue({ status: 'cancelled' } as never)
    const { result } = renderHook(() => useConfirmPaymentCancelled(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('b1')
    })
    expect(paymentService.confirmCancelled).toHaveBeenCalledWith('b1')
  })

  it('useMarkManualPaid submits the reference and toasts', async () => {
    vi.mocked(paymentService.markManualPaid).mockResolvedValue({ status: 'pending' } as never)
    const { result } = renderHook(() => useMarkManualPaid(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ bookingUuid: 'b1', externalReference: 'ref-1', notes: 'bank transfer', promoCode: 'X' })
    })
    expect(paymentService.markManualPaid).toHaveBeenCalledWith('b1', 'ref-1', 'bank transfer', 'X')
    expect(toast.success).toHaveBeenCalled()
  })

  it('useValidatePromoCode validates the code', async () => {
    vi.mocked(paymentService.validatePromoCode).mockResolvedValue({ valid: true, discount: '10' } as never)
    const { result } = renderHook(() => useValidatePromoCode(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ bookingUuid: 'b1', code: 'SAVE10' })
    })
    expect(paymentService.validatePromoCode).toHaveBeenCalledWith('b1', 'SAVE10')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('useCreateCheckout toasts the error on failure', async () => {
    vi.mocked(paymentService.createCheckout).mockRejectedValue(new Error('gateway down'))
    const { result } = renderHook(() => useCreateCheckout(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ bookingUuid: 'b1' })
    })
    expect(toast.error).toHaveBeenCalledWith('gateway down')
  })
})
