import { describe, it, expect, vi, beforeEach } from 'vitest'
import { conversationService } from '../conversation.service'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const { api } = await import('@/lib/api')

const conversation = { uuid: 'cv1', subject: 'Session' }
const message = { uuid: 'm1', body: 'Hello' }
const pageEnvelope = {
  data: { data: { data: [conversation], current_page: 1, per_page: 15, last_page: 1, total: 1 } },
}

describe('conversationService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('list paginates', async () => {
    vi.mocked(api.get).mockResolvedValue(pageEnvelope)
    const result = await conversationService.list(2)
    expect(api.get).toHaveBeenCalledWith('/conversations', { params: { page: 2 } })
    expect(result.meta.total).toBe(1)
  })

  it('findByBookingUuid returns the first conversation', async () => {
    vi.mocked(api.get).mockResolvedValue(pageEnvelope)
    await expect(conversationService.findByBookingUuid('b1')).resolves.toEqual(conversation)
    expect(api.get).toHaveBeenCalledWith('/conversations', { params: { booking_uuid: 'b1' } })
  })

  it('findByBookingUuid returns undefined for an empty list', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: { data: [], current_page: 1, per_page: 15, last_page: 1, total: 0 } } })
    await expect(conversationService.findByBookingUuid('b1')).resolves.toBeUndefined()
  })

  it('get unwraps conversation and messages', async () => {
    const payload = { conversation, messages: { data: [message], meta: { total: 1 } } }
    vi.mocked(api.get).mockResolvedValue({ data: { data: payload } })
    await expect(conversationService.get('cv1')).resolves.toEqual(payload)
    expect(api.get).toHaveBeenCalledWith('/conversations/cv1')
  })

  it('sendMessage POSTs the body', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: message } })
    await expect(conversationService.sendMessage('cv1', 'Hello')).resolves.toEqual(message)
    expect(api.post).toHaveBeenCalledWith('/conversations/cv1/messages', { body: 'Hello' })
  })

  it('markRead PUTs the read endpoint', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: {} })
    await conversationService.markRead('cv1')
    expect(api.put).toHaveBeenCalledWith('/conversations/cv1/read')
  })

  it('rejects on error', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('net'))
    await expect(conversationService.list()).rejects.toThrow('net')
  })
})
