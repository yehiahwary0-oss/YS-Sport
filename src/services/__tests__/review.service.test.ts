import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reviewService } from '../review.service'

vi.mock('@/lib/api', () => ({
  api: { post: vi.fn(), put: vi.fn() },
}))

const { api } = await import('@/lib/api')

const review = { uuid: 'r1', rating: 5 }

describe('reviewService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('submit POSTs the booking, rating and comment', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: review } })
    await expect(reviewService.submit({ booking_uuid: 'b1', rating: 5, comment: 'Great!' })).resolves.toEqual(review)
    expect(api.post).toHaveBeenCalledWith('/reviews', { booking_uuid: 'b1', rating: 5, comment: 'Great!' })
  })

  it('submit works without a comment', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: review } })
    await reviewService.submit({ booking_uuid: 'b1', rating: 3 })
    expect(api.post).toHaveBeenCalledWith('/reviews', { booking_uuid: 'b1', rating: 3, comment: undefined })
  })

  it('reply PUTs the reply text', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: review } })
    await expect(reviewService.reply('r1', 'Thanks!')).resolves.toEqual(review)
    expect(api.put).toHaveBeenCalledWith('/reviews/r1/reply', { reply: 'Thanks!' })
  })

  it('report POSTs the report endpoint', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} })
    await reviewService.report('r1')
    expect(api.post).toHaveBeenCalledWith('/reviews/r1/report')
  })

  it('rejects on error', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('boom'))
    await expect(reviewService.submit({ booking_uuid: 'b1', rating: 1 })).rejects.toThrow('boom')
  })
})
