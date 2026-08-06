import { describe, it, expect, vi, beforeEach } from 'vitest'
import { serviceRequestService } from '../service-request.service'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const { api } = await import('@/lib/api')

const request = { uuid: 'r1', status: 'pending' }
const pageEnvelope = {
  data: { data: [request], current_page: 1, per_page: 15, last_page: 1, total: 1 },
}

describe('serviceRequestService — athlete', () => {
  beforeEach(() => vi.clearAllMocks())

  it('create POSTs the payload', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: request } })
    const payload = { coach_uuid: 'c1', package_uuid: 'p1', message: 'Hi' }
    await expect(serviceRequestService.create(payload)).resolves.toEqual(request)
    expect(api.post).toHaveBeenCalledWith('/service-requests', payload)
  })

  it('create works without a message', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: request } })
    await serviceRequestService.create({ coach_uuid: 'c1', package_uuid: 'p1' })
    expect(api.post).toHaveBeenCalledWith('/service-requests', { coach_uuid: 'c1', package_uuid: 'p1', message: undefined })
  })

  it('listAthlete paginates', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: pageEnvelope })
    const result = await serviceRequestService.listAthlete('pending', 2)
    expect(api.get).toHaveBeenCalledWith('/athlete/service-requests', { params: { status: 'pending', page: 2 } })
    expect(result.meta.total).toBe(1)
  })

  it('getAthlete unwraps', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: request } })
    await expect(serviceRequestService.getAthlete('r1')).resolves.toEqual(request)
    expect(api.get).toHaveBeenCalledWith('/athlete/service-requests/r1')
  })

  it('cancel DELETEs the uuid', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { data: request } })
    await serviceRequestService.cancel('r1')
    expect(api.delete).toHaveBeenCalledWith('/athlete/service-requests/r1/cancel')
  })
})

describe('serviceRequestService — coach', () => {
  beforeEach(() => vi.clearAllMocks())

  it('listCoach paginates', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: pageEnvelope })
    await serviceRequestService.listCoach('accepted')
    expect(api.get).toHaveBeenCalledWith('/coach/service-requests', { params: { status: 'accepted', page: 1 } })
  })

  it('getCoach unwraps', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: request } })
    await expect(serviceRequestService.getCoach('r1')).resolves.toEqual(request)
    expect(api.get).toHaveBeenCalledWith('/coach/service-requests/r1')
  })

  it('accept PUTs the accept endpoint', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: request } })
    await serviceRequestService.accept('r1')
    expect(api.put).toHaveBeenCalledWith('/coach/service-requests/r1/accept')
  })

  it('reject PUTs the reason', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: request } })
    await serviceRequestService.reject('r1', 'busy')
    expect(api.put).toHaveBeenCalledWith('/coach/service-requests/r1/reject', { reason: 'busy' })
  })

  it('reject works without a reason', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: request } })
    await serviceRequestService.reject('r1')
    expect(api.put).toHaveBeenCalledWith('/coach/service-requests/r1/reject', { reason: undefined })
  })

  it('rejects on error', async () => {
    vi.mocked(api.put).mockRejectedValue(new Error('boom'))
    await expect(serviceRequestService.accept('r1')).rejects.toThrow('boom')
  })
})
