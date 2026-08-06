import { describe, it, expect, vi, beforeEach } from 'vitest'
import { bookingService } from '../booking.service'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const { api } = await import('@/lib/api')

const pageEnvelope = {
  data: { data: { data: [{ uuid: 'b1' }], current_page: 1, per_page: 15, last_page: 1, total: 1 } },
}
const booking = { uuid: 'b1', status: 'confirmed' }

describe('bookingService — athlete', () => {
  beforeEach(() => vi.clearAllMocks())

  it('listAthlete paginates', async () => {
    vi.mocked(api.get).mockResolvedValue(pageEnvelope)
    const result = await bookingService.listAthlete('confirmed', 2)
    expect(api.get).toHaveBeenCalledWith('/athlete/bookings', { params: { status: 'confirmed', page: 2 } })
    expect(result.meta.total).toBe(1)
  })

  it('getAthlete unwraps', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: booking } })
    await expect(bookingService.getAthlete('b1')).resolves.toEqual(booking)
    expect(api.get).toHaveBeenCalledWith('/athlete/bookings/b1')
  })

  it('cancelAthlete DELETEs with the reason param', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { data: booking } })
    await bookingService.cancelAthlete('b1', 'changed my mind')
    expect(api.delete).toHaveBeenCalledWith('/athlete/bookings/b1/cancel', { params: { reason: 'changed my mind' } })
  })

  it('cancelAthlete omits the reason param when not provided', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { data: booking } })
    await bookingService.cancelAthlete('b1')
    expect(api.delete).toHaveBeenCalledWith('/athlete/bookings/b1/cancel', { params: {} })
  })
})

describe('bookingService — coach', () => {
  beforeEach(() => vi.clearAllMocks())

  it('listCoach paginates', async () => {
    vi.mocked(api.get).mockResolvedValue(pageEnvelope)
    await bookingService.listCoach('upcoming')
    expect(api.get).toHaveBeenCalledWith('/coach/bookings', { params: { status: 'upcoming', page: 1 } })
  })

  it('getCoach unwraps', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: booking } })
    await expect(bookingService.getCoach('b1')).resolves.toEqual(booking)
    expect(api.get).toHaveBeenCalledWith('/coach/bookings/b1')
  })

  it('complete PUTs session notes', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: booking } })
    await bookingService.complete('b1', 'great session')
    expect(api.put).toHaveBeenCalledWith('/coach/bookings/b1/complete', { session_notes: 'great session' })
  })

  it('complete PUTs null notes when omitted', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: booking } })
    await bookingService.complete('b1')
    expect(api.put).toHaveBeenCalledWith('/coach/bookings/b1/complete', { session_notes: undefined })
  })

  it('markNoShow PUTs the no-show endpoint', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: booking } })
    await bookingService.markNoShow('b1')
    expect(api.put).toHaveBeenCalledWith('/coach/bookings/b1/no-show')
  })

  it('cancelCoach PUTs the reason', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: booking } })
    await bookingService.cancelCoach('b1', 'no show')
    expect(api.put).toHaveBeenCalledWith('/coach/bookings/b1/cancel', { reason: 'no show' })
  })

  it('setSessionLink PUTs the link', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: booking } })
    await bookingService.setSessionLink('b1', 'https://meet/xyz')
    expect(api.put).toHaveBeenCalledWith('/coach/bookings/b1/session-link', { link: 'https://meet/xyz' })
  })

  it('assignSlot PUTs the slot uuid', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: booking } })
    await bookingService.assignSlot('b1', 's1')
    expect(api.put).toHaveBeenCalledWith('/coach/bookings/b1/assign-slot', { slot_uuid: 's1' })
  })

  it('rejects on error', async () => {
    vi.mocked(api.put).mockRejectedValue(new Error('boom'))
    await expect(bookingService.assignSlot('b1', 's1')).rejects.toThrow('boom')
  })
})
