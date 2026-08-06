import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAiConversations, useAiConversation, useAiChat } from '../useAiCoach'

vi.mock('@/services/ai-coach.service', () => ({
  aiCoachService: {
    listConversations: vi.fn(),
    getConversation: vi.fn(),
    chat: vi.fn(),
  },
}))

const { aiCoachService } = await import('@/services/ai-coach.service')

const conversation = { uuid: 'cv1', title: 'Week 1' }

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('ai coach hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useAiConversations fetches the conversation list', async () => {
    vi.mocked(aiCoachService.listConversations).mockResolvedValue([conversation] as never)
    const { result } = renderHook(() => useAiConversations(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([conversation])
  })

  it('useAiConversation fetches a single conversation', async () => {
    vi.mocked(aiCoachService.getConversation).mockResolvedValue(conversation as never)
    const { result } = renderHook(() => useAiConversation('cv1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(aiCoachService.getConversation).toHaveBeenCalledWith('cv1')
  })

  it('useAiConversation is disabled without uuid', () => {
    const { result } = renderHook(() => useAiConversation(undefined), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(aiCoachService.getConversation).not.toHaveBeenCalled()
  })

  it('useAiChat sends the message with optional conversation and lang', async () => {
    vi.mocked(aiCoachService.chat).mockResolvedValue({ reply: 'ok' } as never)
    const { result } = renderHook(() => useAiChat(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ message: 'train me', conversationId: 'cv1', lang: 'ar' })
    })
    expect(aiCoachService.chat).toHaveBeenCalledWith('train me', 'cv1', 'ar')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('useAiChat sends without conversation id', async () => {
    vi.mocked(aiCoachService.chat).mockResolvedValue({ reply: 'ok' } as never)
    const { result } = renderHook(() => useAiChat(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ message: 'hello' })
    })
    expect(aiCoachService.chat).toHaveBeenCalledWith('hello', undefined, undefined)
  })
})
