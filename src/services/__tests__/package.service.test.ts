import { describe, it, expect, vi, beforeEach } from 'vitest'
import { packageService } from '../package.service'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const { api } = await import('@/lib/api')

const pkg = { uuid: 'p1', name: 'Starter' }

const payload = {
  name: 'Starter',
  session_count: 4,
  session_duration_minutes: 60,
  delivery_mode: 'online',
  price_amount: 100,
  price_currency: 'USD',
}

describe('packageService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('list returns the flat array', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [pkg] } })
    await expect(packageService.list()).resolves.toEqual([pkg])
    expect(api.get).toHaveBeenCalledWith('/coach/packages')
  })

  it('create POSTs the payload', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: pkg } })
    await expect(packageService.create(payload)).resolves.toEqual(pkg)
    expect(api.post).toHaveBeenCalledWith('/coach/packages', payload)
  })

  it('update PUTs partial payload', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: pkg } })
    await packageService.update('p1', { price_amount: 120 })
    expect(api.put).toHaveBeenCalledWith('/coach/packages/p1', { price_amount: 120 })
  })

  it('toggle PUTs the toggle endpoint', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: { ...pkg, is_active: false } } })
    await packageService.toggle('p1')
    expect(api.put).toHaveBeenCalledWith('/coach/packages/p1/toggle')
  })

  it('remove DELETEs the uuid', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: {} })
    await packageService.remove('p1')
    expect(api.delete).toHaveBeenCalledWith('/coach/packages/p1')
  })

  it('rejects on error', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('down'))
    await expect(packageService.list()).rejects.toThrow('down')
  })
})
