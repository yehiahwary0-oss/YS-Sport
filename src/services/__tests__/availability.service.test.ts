import { describe, it, expect, vi, beforeEach } from 'vitest'
import { availabilityService } from '../availability.service'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

const { api } = await import('@/lib/api')

const slot = { uuid: 's1', starts_at: '2026-08-01T10:00:00Z', ends_at: '2026-08-01T11:00:00Z' }

describe('availabilityService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('list passes from/to and returns the raw envelope', async () => {
    const envelope = { data: { data: [slot] }, meta: { total: 1 } }
    vi.mocked(api.get).mockResolvedValue({ data: envelope })

    await expect(availabilityService.list('2026-08-01', '2026-08-31')).resolves.toEqual(envelope)
    expect(api.get).toHaveBeenCalledWith('/coach/availability', { params: { from: '2026-08-01', to: '2026-08-31' } })
  })

  it('list works without filters', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [] } })
    await availabilityService.list()
    expect(api.get).toHaveBeenCalledWith('/coach/availability', { params: { from: undefined, to: undefined } })
  })

  it('create POSTs the slot and unwraps', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: slot } })
    await expect(
      availabilityService.create({ starts_at: slot.starts_at, ends_at: slot.ends_at, timezone: 'UTC' })
    ).resolves.toEqual(slot)
    expect(api.post).toHaveBeenCalledWith('/coach/availability', {
      starts_at: slot.starts_at,
      ends_at: slot.ends_at,
      timezone: 'UTC',
    })
  })

  it('bulkCreate POSTs the slots array', async () => {
    const body = { data: { data: [slot], count: 1 } }
    vi.mocked(api.post).mockResolvedValue({ data: body })
    await expect(
      availabilityService.bulkCreate([{ starts_at: slot.starts_at, ends_at: slot.ends_at, timezone: 'UTC' }])
    ).resolves.toEqual(body)
    expect(api.post).toHaveBeenCalledWith('/coach/availability/bulk', {
      slots: [{ starts_at: slot.starts_at, ends_at: slot.ends_at, timezone: 'UTC' }],
    })
  })

  it('remove DELETEs the uuid', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: {} })
    await availabilityService.remove('s1')
    expect(api.delete).toHaveBeenCalledWith('/coach/availability/s1')
  })

  it('rejects on error', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('net'))
    await expect(availabilityService.list()).rejects.toThrow('net')
  })
})
