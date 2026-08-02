import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  usePusherConversation,
  usePusherConnectionState,
  pusherMessageToMessage,
  type MessageSentPayload,
} from '../usePusherChannel'

const FLAT_PAYLOAD: MessageSentPayload = {
  uuid: 'msg-1',
  conversation_id: 'conv-1',
  sender_id: 'u-1',
  sender_uuid: 'u-1',
  sender_name: 'Test Sender',
  sender_avatar: null,
  body: 'hello there',
  is_system: false,
  read_at: null,
  created_at: '2026-01-01T00:00:00.000000Z',
}

type StateChangeHandler = (change: { current: string }) => void

function createFakePusher() {
  const channels = new Map<string, { bind: ReturnType<typeof vi.fn> }>()
  const stateHandlers = new Set<StateChangeHandler>()

  const fake = {
    subscribe: vi.fn((name: string) => {
      const channel = { bind: vi.fn() }
      channels.set(name, channel)
      return channel
    }),
    unsubscribe: vi.fn(),
    connection: {
      state: 'disconnected',
      bind: vi.fn((event: string, cb: StateChangeHandler) => {
        if (event === 'state_change') stateHandlers.add(cb)
      }),
      unbind: vi.fn((event: string, cb: StateChangeHandler) => {
        if (event === 'state_change') stateHandlers.delete(cb)
      }),
    },
    __emit(channelName: string, event: string, payload: unknown) {
      channels.get(channelName)?.bind.mock.calls
        .filter(([boundEvent]) => boundEvent === event)
        .forEach(([, cb]) => cb(payload))
    },
    __setState(state: string) {
      stateHandlers.forEach((cb) => cb({ current: state }))
    },
  }
  return fake
}

vi.mock('@/lib/pusher', () => ({
  getPusherClient: vi.fn(),
}))

const { getPusherClient } = await import('@/lib/pusher')

function createWrapper(qc: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('pusherMessageToMessage', () => {
  it('maps a flat broadcast payload to a Message', () => {
    const message = pusherMessageToMessage(FLAT_PAYLOAD)

    expect(message).toEqual({
      uuid: 'msg-1',
      conversation_id: 'conv-1',
      sender_id: 'u-1',
      body: 'hello there',
      is_system: false,
      read_at: null,
      created_at: '2026-01-01T00:00:00.000000Z',
      sender: { uuid: 'u-1', name: 'Test Sender', avatar: null },
    })
  })

  it('falls back to sender_id when sender_uuid is missing', () => {
    const message = pusherMessageToMessage({ ...FLAT_PAYLOAD, sender_uuid: null })

    expect(message.sender_id).toBe('u-1')
    expect(message.sender).toBeUndefined()
  })
})

describe('usePusherConversation', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-key'
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_PUSHER_KEY
  })

  it('appends an incoming broadcast message to the conversation cache', async () => {
    const fake = createFakePusher()
    vi.mocked(getPusherClient).mockReturnValue(fake as unknown as ReturnType<typeof getPusherClient>)

    const qc = new QueryClient()
    qc.setQueryData(['conversations', 'conv-1'], {
      conversation: {},
      messages: { data: [] },
    })

    renderHook(() => usePusherConversation('conv-1'), { wrapper: createWrapper(qc) })

    await waitFor(() =>
      expect(fake.subscribe).toHaveBeenCalledWith('private-conversation.conv-1')
    )

    act(() => {
      fake.__emit('private-conversation.conv-1', 'MessageSent', FLAT_PAYLOAD)
    })

    expect(qc.getQueryData(['conversations', 'conv-1'])).toEqual({
      conversation: {},
      messages: { data: [pusherMessageToMessage(FLAT_PAYLOAD)] },
    })
  })

  it('does not duplicate a message that is already in the cache', async () => {
    const fake = createFakePusher()
    vi.mocked(getPusherClient).mockReturnValue(fake as unknown as ReturnType<typeof getPusherClient>)

    const qc = new QueryClient()
    qc.setQueryData(['conversations', 'conv-1'], {
      conversation: {},
      messages: { data: [pusherMessageToMessage(FLAT_PAYLOAD)] },
    })

    renderHook(() => usePusherConversation('conv-1'), { wrapper: createWrapper(qc) })

    await waitFor(() =>
      expect(fake.subscribe).toHaveBeenCalledWith('private-conversation.conv-1')
    )

    act(() => {
      fake.__emit('private-conversation.conv-1', 'MessageSent', FLAT_PAYLOAD)
    })

    expect(qc.getQueryData(['conversations', 'conv-1'])).toEqual({
      conversation: {},
      messages: { data: [pusherMessageToMessage(FLAT_PAYLOAD)] },
    })
  })

  it('does not subscribe when no Pusher key is configured', () => {
    delete process.env.NEXT_PUBLIC_PUSHER_KEY
    const fake = createFakePusher()
    vi.mocked(getPusherClient).mockReturnValue(fake as unknown as ReturnType<typeof getPusherClient>)

    const qc = new QueryClient()
    renderHook(() => usePusherConversation('conv-1'), { wrapper: createWrapper(qc) })

    expect(fake.subscribe).not.toHaveBeenCalled()
  })

  it('unsubscribes from the channel on unmount', async () => {
    const fake = createFakePusher()
    vi.mocked(getPusherClient).mockReturnValue(fake as unknown as ReturnType<typeof getPusherClient>)

    const qc = new QueryClient()
    const { unmount } = renderHook(() => usePusherConversation('conv-1'), {
      wrapper: createWrapper(qc),
    })

    await waitFor(() =>
      expect(fake.subscribe).toHaveBeenCalledWith('private-conversation.conv-1')
    )

    unmount()

    expect(fake.unsubscribe).toHaveBeenCalledWith('private-conversation.conv-1')
  })
})

describe('usePusherConnectionState', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_PUSHER_KEY = 'test-key'
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_PUSHER_KEY
  })

  it('starts with the client state and follows state_change events', () => {
    const fake = createFakePusher()
    vi.mocked(getPusherClient).mockReturnValue(fake as unknown as ReturnType<typeof getPusherClient>)

    const qc = new QueryClient()
    const { result } = renderHook(() => usePusherConnectionState(), {
      wrapper: createWrapper(qc),
    })

    expect(result.current).toBe('disconnected')

    act(() => {
      fake.__setState('connected')
    })

    expect(result.current).toBe('connected')

    act(() => {
      fake.__setState('failed')
    })

    expect(result.current).toBe('failed')
  })

  it('does not track state when Pusher is not configured', () => {
    delete process.env.NEXT_PUBLIC_PUSHER_KEY
    const fake = createFakePusher()
    vi.mocked(getPusherClient).mockReturnValue(fake as unknown as ReturnType<typeof getPusherClient>)

    const qc = new QueryClient()
    const { result } = renderHook(() => usePusherConnectionState(), {
      wrapper: createWrapper(qc),
    })

    expect(result.current).toBe('initialized')
    expect(fake.connection.bind).not.toHaveBeenCalled()
  })
})
