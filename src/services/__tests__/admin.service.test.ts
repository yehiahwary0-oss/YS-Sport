import { describe, it, expect, vi, beforeEach } from 'vitest'
import { adminService } from '../admin.service'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const { api } = await import('@/lib/api')

const paginatedEnvelope = {
  data: { data: { data: [{ uuid: 'x1' }], current_page: 1, per_page: 15, last_page: 1, total: 1 } },
}

describe('adminService.metrics', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls GET /admin/metrics and unwraps the envelope', async () => {
    const metrics = { coaches: { pending_verification: 1 } }
    vi.mocked(api.get).mockResolvedValue({ data: { data: metrics } })

    await expect(adminService.metrics()).resolves.toEqual(metrics)
    expect(api.get).toHaveBeenCalledWith('/admin/metrics')
  })

  it('rejects on API error', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('boom'))
    await expect(adminService.metrics()).rejects.toThrow('boom')
  })
})

describe('adminService.auditLogs', () => {
  beforeEach(() => vi.clearAllMocks())

  it('passes the limit param and returns the flat array', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [{ id: 1 }] } })

    await expect(adminService.auditLogs(5)).resolves.toEqual([{ id: 1 }])
    expect(api.get).toHaveBeenCalledWith('/admin/audit-logs', { params: { limit: 5 } })
  })

  it('defaults the limit to 10', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [] } })
    await adminService.auditLogs()
    expect(api.get).toHaveBeenCalledWith('/admin/audit-logs', { params: { limit: 10 } })
  })
})

describe('adminService coach verification', () => {
  beforeEach(() => vi.clearAllMocks())

  it('pendingCoaches GETs and paginates the envelope', async () => {
    vi.mocked(api.get).mockResolvedValue(paginatedEnvelope)

    const result = await adminService.pendingCoaches(2)

    expect(api.get).toHaveBeenCalledWith('/admin/coaches/pending-verification', { params: { page: 2 } })
    expect(result.data).toEqual([{ uuid: 'x1' }])
    expect(result.meta.total).toBe(1)
  })

  it('listCoaches passes filters through', async () => {
    vi.mocked(api.get).mockResolvedValue(paginatedEnvelope)
    const filters = { search: 'ali', verification_status: 'pending', page: 3 }

    await adminService.listCoaches(filters)

    expect(api.get).toHaveBeenCalledWith('/admin/coaches', { params: filters })
  })

  it('verifyCoach PUTs to the uuid endpoint', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })
    await adminService.verifyCoach('c1')
    expect(api.put).toHaveBeenCalledWith('/admin/coaches/c1/verify')
  })

  it('rejectCoach PUTs the reason', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })
    await adminService.rejectCoach('c1', 'not legible')
    expect(api.put).toHaveBeenCalledWith('/admin/coaches/c1/reject', { reason: 'not legible' })
  })
})

describe('adminService payments', () => {
  beforeEach(() => vi.clearAllMocks())

  it('pendingPayments paginates', async () => {
    vi.mocked(api.get).mockResolvedValue(paginatedEnvelope)
    const result = await adminService.pendingPayments()
    expect(api.get).toHaveBeenCalledWith('/admin/payments/pending', { params: { page: 1 } })
    expect(result.meta.total).toBe(1)
  })

  it('allPayments passes filters', async () => {
    vi.mocked(api.get).mockResolvedValue(paginatedEnvelope)
    await adminService.allPayments({ method: 'card', page: 1 })
    expect(api.get).toHaveBeenCalledWith('/admin/payments', { params: { method: 'card', page: 1 } })
  })

  it('confirmPayment sends the external reference', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })
    await adminService.confirmPayment('p1', 'ref-123')
    expect(api.put).toHaveBeenCalledWith('/admin/payments/p1/confirm', { external_reference: 'ref-123' })
  })

  it('refundPayment returns the server message', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { message: 'Refunded' } })
    await expect(adminService.refundPayment('p1', 'too expensive')).resolves.toEqual({ message: 'Refunded' })
    expect(api.put).toHaveBeenCalledWith('/admin/payments/p1/refund', { reason: 'too expensive' })
  })
})

describe('adminService payouts & users', () => {
  beforeEach(() => vi.clearAllMocks())

  it('listPayouts paginates', async () => {
    vi.mocked(api.get).mockResolvedValue(paginatedEnvelope)
    const result = await adminService.listPayouts({ status: 'pending' })
    expect(api.get).toHaveBeenCalledWith('/admin/payouts', { params: { status: 'pending' } })
    expect(result.data).toEqual([{ uuid: 'x1' }])
  })

  it('listUsers passes role filters', async () => {
    vi.mocked(api.get).mockResolvedValue(paginatedEnvelope)
    await adminService.listUsers({ role: 'coach' })
    expect(api.get).toHaveBeenCalledWith('/admin/users', { params: { role: 'coach' } })
  })

  it('suspendUser PUTs the reason', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })
    await adminService.suspendUser('u1', 'spam')
    expect(api.put).toHaveBeenCalledWith('/admin/users/u1/suspend', { reason: 'spam' })
  })

  it('reactivateUser PUTs without a body', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })
    await adminService.reactivateUser('u1')
    expect(api.put).toHaveBeenCalledWith('/admin/users/u1/reactivate')
  })
})

describe('adminService bookings & reviews', () => {
  beforeEach(() => vi.clearAllMocks())

  it('listBookings passes filters', async () => {
    vi.mocked(api.get).mockResolvedValue(paginatedEnvelope)
    await adminService.listBookings({ status: 'active' })
    expect(api.get).toHaveBeenCalledWith('/admin/bookings', { params: { status: 'active' } })
  })

  it('forceCompleteBooking sends the reason', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })
    await adminService.forceCompleteBooking('b1', 'manual')
    expect(api.put).toHaveBeenCalledWith('/admin/bookings/b1/force-complete', { reason: 'manual' })
  })

  it('listReviews passes filters', async () => {
    vi.mocked(api.get).mockResolvedValue(paginatedEnvelope)
    await adminService.listReviews({ rating: 5 })
    expect(api.get).toHaveBeenCalledWith('/admin/reviews', { params: { rating: 5 } })
  })

  it('approveReview PUTs the uuid endpoint', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })
    await adminService.approveReview('r1')
    expect(api.put).toHaveBeenCalledWith('/admin/reviews/r1/approve')
  })

  it('rejectReview sends the reason', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })
    await adminService.rejectReview('r1', 'abusive')
    expect(api.put).toHaveBeenCalledWith('/admin/reviews/r1/reject', { reason: 'abusive' })
  })
})

describe('adminService featured coaches', () => {
  beforeEach(() => vi.clearAllMocks())

  it('listFeaturedCoaches GETs the flat array', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [{ id: 1 }] } })
    await expect(adminService.listFeaturedCoaches()).resolves.toEqual([{ id: 1 }])
    expect(api.get).toHaveBeenCalledWith('/admin/featured-coaches')
  })

  it('createFeaturedCoach POSTs the payload', async () => {
    const payload = { coach_id: 1, position: 1, starts_at: '2026-01-01T00:00:00Z' }
    vi.mocked(api.post).mockResolvedValue({ data: { data: { id: 1 } } })
    await expect(adminService.createFeaturedCoach(payload)).resolves.toEqual({ id: 1 })
    expect(api.post).toHaveBeenCalledWith('/admin/featured-coaches', payload)
  })

  it('updateFeaturedCoach PUTs the id', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: { id: 1 } } })
    await adminService.updateFeaturedCoach(1, { position: 2 })
    expect(api.put).toHaveBeenCalledWith('/admin/featured-coaches/1', { position: 2 })
  })

  it('deleteFeaturedCoach DELETEs the id', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: {} })
    await adminService.deleteFeaturedCoach(1)
    expect(api.delete).toHaveBeenCalledWith('/admin/featured-coaches/1')
  })
})

describe('adminService promo codes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('listPromoCodes GETs the flat array', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [{ code: 'SUMMER' }] } })
    await expect(adminService.listPromoCodes()).resolves.toEqual([{ code: 'SUMMER' }])
    expect(api.get).toHaveBeenCalledWith('/admin/promo-codes')
  })

  it('createPromoCode POSTs the payload', async () => {
    const payload = { code: 'SUMMER', discount_type: 'percent', discount_value: 10 }
    vi.mocked(api.post).mockResolvedValue({ data: { data: payload } })
    await adminService.createPromoCode(payload as never)
    expect(api.post).toHaveBeenCalledWith('/admin/promo-codes', payload)
  })

  it('updatePromoCode PUTs partial payload', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: {} } })
    await adminService.updatePromoCode(1, { discount_value: 20 })
    expect(api.put).toHaveBeenCalledWith('/admin/promo-codes/1', { discount_value: 20 })
  })

  it('togglePromoCodeStatus PUTs the toggle endpoint', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: { is_active: false } } })
    await adminService.togglePromoCodeStatus(1)
    expect(api.put).toHaveBeenCalledWith('/admin/promo-codes/1/toggle-status')
  })

  it('deletePromoCode DELETEs the id', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: {} })
    await adminService.deletePromoCode(1)
    expect(api.delete).toHaveBeenCalledWith('/admin/promo-codes/1')
  })
})

describe('adminService achievements', () => {
  beforeEach(() => vi.clearAllMocks())

  it('listAchievements returns the raw envelope', async () => {
    const metaEnvelope = { data: { data: [{ uuid: 'x1' }], meta: { current_page: 1, per_page: 15, last_page: 1, total: 1 } } }
    vi.mocked(api.get).mockResolvedValue(metaEnvelope)
    const result = await adminService.listAchievements({ page: 1 })
    expect(api.get).toHaveBeenCalledWith('/admin/achievements', { params: { page: 1 } })
    expect(result.meta.total).toBe(1)
  })

  it('getAchievement unwraps', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: { id: 1 } } })
    await expect(adminService.getAchievement(1)).resolves.toEqual({ id: 1 })
    expect(api.get).toHaveBeenCalledWith('/admin/achievements/1')
  })

  it('createAchievement POSTs', async () => {
    const payload = { slug: 'first-win', name: 'First Win', criteria_type: 'win_count' }
    vi.mocked(api.post).mockResolvedValue({ data: { data: { id: 1 } } })
    await adminService.createAchievement(payload as never)
    expect(api.post).toHaveBeenCalledWith('/admin/achievements', payload)
  })

  it('updateAchievement PUTs', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: { id: 1 } } })
    await adminService.updateAchievement(1, { name: 'Renamed' })
    expect(api.put).toHaveBeenCalledWith('/admin/achievements/1', { name: 'Renamed' })
  })

  it('toggleAchievementStatus PATCHes', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: { data: { id: 1 } } })
    await adminService.toggleAchievementStatus(1)
    expect(api.patch).toHaveBeenCalledWith('/admin/achievements/1/status')
  })

  it('grantAchievement POSTs athlete_id', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: { status: 'granted' } } })
    await expect(adminService.grantAchievement(1, 42)).resolves.toEqual({ status: 'granted' })
    expect(api.post).toHaveBeenCalledWith('/admin/achievements/1/grant', { athlete_id: 42 })
  })
})

describe('adminService athletes & progression', () => {
  beforeEach(() => vi.clearAllMocks())

  it('listAthletes paginates', async () => {
    vi.mocked(api.get).mockResolvedValue(paginatedEnvelope)
    const result = await adminService.listAthletes({ page: 1 })
    expect(api.get).toHaveBeenCalledWith('/admin/athletes', { params: { page: 1 } })
    expect(result.data).toEqual([{ uuid: 'x1' }])
  })

  it('getAthleteProgression unwraps', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: { level: 3 } } })
    await expect(adminService.getAthleteProgression('a1')).resolves.toEqual({ level: 3 })
    expect(api.get).toHaveBeenCalledWith('/admin/athletes/a1/progression')
  })

  it('getAthleteXpEvents returns the raw envelope', async () => {
    const metaEnvelope = { data: { data: [{ id: 1 }], meta: { current_page: 1, per_page: 15, last_page: 1, total: 1 } } }
    vi.mocked(api.get).mockResolvedValue(metaEnvelope)
    const result = await adminService.getAthleteXpEvents('a1', { page: 2, per_page: 10 })
    expect(api.get).toHaveBeenCalledWith('/admin/athletes/a1/progression/xp-events', {
      params: { page: 2, per_page: 10 },
    })
    expect(result.meta.total).toBe(1)
  })

  it('getAthleteXpEvents defaults params to empty', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [], meta: {} } })
    await adminService.getAthleteXpEvents('a1')
    expect(api.get).toHaveBeenCalledWith('/admin/athletes/a1/progression/xp-events', { params: {} })
  })

  it('grantXp POSTs the payload', async () => {
    const payload = { xp: 50, reason: 'challenge' }
    vi.mocked(api.post).mockResolvedValue({ data: { data: { new_total_xp: 150 } } })
    await expect(adminService.grantXp('a1', payload)).resolves.toEqual({ new_total_xp: 150 })
    expect(api.post).toHaveBeenCalledWith('/admin/athletes/a1/progression/award-xp', payload)
  })
})
