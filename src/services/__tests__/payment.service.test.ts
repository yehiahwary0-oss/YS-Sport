import { describe, it, expect, vi, beforeEach } from 'vitest'
import { paymentService } from '../payment.service'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}))

const { api } = await import('@/lib/api')

const pageEnvelope = {
  data: { data: { data: [{ uuid: 'p1' }], current_page: 1, per_page: 15, last_page: 1, total: 1 } },
}

describe('paymentService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('listCoach paginates with status and page', async () => {
    vi.mocked(api.get).mockResolvedValue(pageEnvelope)
    const result = await paymentService.listCoach('paid', 2)
    expect(api.get).toHaveBeenCalledWith('/coach/payments', { params: { status: 'paid', page: 2 } })
    expect(result.meta.total).toBe(1)
    expect(result.data).toEqual([{ uuid: 'p1' }])
  })

  it('summary unwraps', async () => {
    const summary = { lifetime_earned: '100', currency: 'USD' }
    vi.mocked(api.get).mockResolvedValue({ data: { data: summary } })
    await expect(paymentService.summary()).resolves.toEqual(summary)
    expect(api.get).toHaveBeenCalledWith('/coach/payments/summary')
  })

  it('listAthlete paginates', async () => {
    vi.mocked(api.get).mockResolvedValue(pageEnvelope)
    await paymentService.listAthlete(3)
    expect(api.get).toHaveBeenCalledWith('/athlete/payments', { params: { page: 3 } })
  })

  it('createCheckout POSTs booking pay with URLs and promo', async () => {
    const session = { checkout_url: 'https://paymob/x' }
    vi.mocked(api.post).mockResolvedValue({ data: { data: session } })
    await expect(paymentService.createCheckout('b1', 'http://r', 'http://c', 'SUMMER')).resolves.toEqual(session)
    expect(api.post).toHaveBeenCalledWith('/bookings/b1/pay', {
      return_url: 'http://r',
      cancel_url: 'http://c',
      promo_code: 'SUMMER',
    })
  })

  it('createCheckout omits undefined optional URLs', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: {} } })
    await paymentService.createCheckout('b1')
    expect(api.post).toHaveBeenCalledWith('/bookings/b1/pay', {
      return_url: undefined,
      cancel_url: undefined,
      promo_code: undefined,
    })
  })

  it('confirmSuccess POSTs the success endpoint', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: { uuid: 'p1' } } })
    await expect(paymentService.confirmSuccess('b1')).resolves.toEqual({ uuid: 'p1' })
    expect(api.post).toHaveBeenCalledWith('/bookings/b1/pay/success')
  })

  it('confirmCancelled POSTs the cancel endpoint', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} })
    await paymentService.confirmCancelled('b1')
    expect(api.post).toHaveBeenCalledWith('/bookings/b1/pay/cancel')
  })

  it('markManualPaid POSTs reference, notes and promo', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} })
    await paymentService.markManualPaid('b1', 'ref-1', 'notes', 'PROMO')
    expect(api.post).toHaveBeenCalledWith('/bookings/b1/mark-paid', {
      external_reference: 'ref-1',
      notes: 'notes',
      promo_code: 'PROMO',
    })
  })

  it('validatePromoCode POSTs the code and unwraps', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: { valid: true, discount_amount: 10 } } })
    await expect(paymentService.validatePromoCode('b1', 'CODE')).resolves.toEqual({ valid: true, discount_amount: 10 })
    expect(api.post).toHaveBeenCalledWith('/bookings/b1/validate-promo', { code: 'CODE' })
  })

  it('rejects on API error', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('down'))
    await expect(paymentService.summary()).rejects.toThrow('down')
  })
})
