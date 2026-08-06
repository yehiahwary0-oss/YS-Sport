import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useConversations,
  useFindBookingConversation,
  useConversationDetail,
  useSendMessage,
} from '../useConversation'

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn() },
}))

vi.mock('@/services/conversation.service', () => ({
  conversationService: {
    list: vi.fn(),
    findByBookingUuid: vi.fn(),
    get: vi.fn(),
    sendMessage: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  getApiError: vi.fn((e: unknown) => (e as Error).message),
}))

const { conversationService } = await import('@/services/conversation.service')
const toast = (await import('react-hot-toast')).default

const conversation = { uuid: 'cv1', subject: 'Session' }
const page = { data: [conversation], meta: { current_page: 1, per_page: 15, last_page: 1, total: 1 } }

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('conversation hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useConversations fetches the list', async () => {
    vi.mocked(conversationService.list).mockResolvedValue(page as never)
    const { result } = renderHook(() => useConversations(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(page)
  })

  it('useFindBookingConversation fetches by booking uuid', async () => {
    vi.mocked(conversationService.findByBookingUuid).mockResolvedValue(conversation as never)
    const { result } = renderHook(() => useFindBookingConversation('b1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(conversationService.findByBookingUuid).toHaveBeenCalledWith('b1')
    expect(result.current.data).toEqual(conversation)
  })

  it('useFindBookingConversation is disabled without uuid', () => {
    const { result } = renderHook(() => useFindBookingConversation(undefined), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(conversationService.findByBookingUuid).not.toHaveBeenCalled()
  })

  it('useConversationDetail fetches the conversation', async () => {
    vi.mocked(conversationService.get).mockResolvedValue(conversation as never)
    const { result } = renderHook(() => useConversationDetail('cv1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(conversationService.get).toHaveBeenCalledWith('cv1')
  })

  it('useConversationDetail works with a Pusher key configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_PUSHER_KEY', 'k')
    vi.mocked(conversationService.get).mockResolvedValue(conversation as never)
    const { result } = renderHook(() => useConversationDetail('cv1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(conversation)
    vi.unstubAllEnvs()
  })

  it('useSendMessage sends and invalidates', async () => {
    vi.mocked(conversationService.sendMessage).mockResolvedValue({ id: 1 } as never)
    const { result } = renderHook(() => useSendMessage(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ uuid: 'cv1', body: 'hello' })
    })
    expect(conversationService.sendMessage).toHaveBeenCalledWith('cv1', 'hello')
  })

  it('useSendMessage toasts the error on failure', async () => {
    vi.mocked(conversationService.sendMessage).mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => useSendMessage(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ uuid: 'cv1', body: 'hello' })
    })
    expect(toast.error).toHaveBeenCalledWith('offline')
  })
})
