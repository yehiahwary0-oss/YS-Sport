import { describe, it, expect, vi, beforeEach } from 'vitest'
import { aiCoachService } from '../ai-coach.service'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}))

const { api } = await import('@/lib/api')

describe('aiCoachService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chat POSTs message, conversation id and default lang', async () => {
    const reply = { reply: 'Hello!' }
    vi.mocked(api.post).mockResolvedValue({ data: reply })

    await expect(aiCoachService.chat('Hi')).resolves.toEqual(reply)
    expect(api.post).toHaveBeenCalledWith('/athlete/ai-coach/chat', {
      message: 'Hi',
      conversation_id: undefined,
      lang: 'en',
    })
  })

  it('chat passes the conversation id and language', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} })
    await aiCoachService.chat('مرحبا', 'cv1', 'ar')
    expect(api.post).toHaveBeenCalledWith('/athlete/ai-coach/chat', {
      message: 'مرحبا',
      conversation_id: 'cv1',
      lang: 'ar',
    })
  })

  it('listConversations returns the flat array', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [{ uuid: 'cv1' }] } })
    await expect(aiCoachService.listConversations()).resolves.toEqual([{ uuid: 'cv1' }])
    expect(api.get).toHaveBeenCalledWith('/athlete/ai-coach/conversations')
  })

  it('getConversation unwraps by uuid', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: { uuid: 'cv1' } } })
    await expect(aiCoachService.getConversation('cv1')).resolves.toEqual({ uuid: 'cv1' })
    expect(api.get).toHaveBeenCalledWith('/athlete/ai-coach/conversations/cv1')
  })

  it('rejects on error', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('boom'))
    await expect(aiCoachService.chat('Hi')).rejects.toThrow('boom')
  })
})
