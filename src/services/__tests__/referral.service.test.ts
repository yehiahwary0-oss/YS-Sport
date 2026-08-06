import { describe, it, expect, vi, beforeEach } from 'vitest'
import { referralService } from '../referral.service'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}))

const { api } = await import('@/lib/api')

describe('referralService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getReferralInfo unwraps the full payload', async () => {
    const info = {
      code: 'ALI123',
      share_url: 'http://localhost:3000/r/ALI123',
      stats: { total: 2, pending: 1, qualified: 1, total_reward: 50 },
      history: [{ id: 1, referee_email: 'x@y.z', status: 'pending', reward_amount: 0, qualified_at: null, created_at: '2026-01-01' }],
    }
    vi.mocked(api.get).mockResolvedValue({ data: { data: info } })

    await expect(referralService.getReferralInfo()).resolves.toEqual(info)
    expect(api.get).toHaveBeenCalledWith('/referral')
  })

  it('regenerateCode POSTs and unwraps', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: { code: 'NEW', share_url: 'http://x' } } })
    await expect(referralService.regenerateCode()).resolves.toEqual({ code: 'NEW', share_url: 'http://x' })
    expect(api.post).toHaveBeenCalledWith('/referral/generate-code')
  })

  it('rejects on error', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('net'))
    await expect(referralService.getReferralInfo()).rejects.toThrow('net')
  })
})
