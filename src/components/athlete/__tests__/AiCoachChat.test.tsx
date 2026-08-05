import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AiCoachChat } from '../AiCoachChat'

vi.mock('@/hooks/useAiCoach', () => ({
  useAiChat: vi.fn(),
}))

const { useAiChat } = await import('@/hooks/useAiCoach')

function renderChat() {
  return render(<AiCoachChat />)
}

describe('AiCoachChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAiChat).mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    })
  })

  it('should show empty state with title and description', () => {
    renderChat()
    expect(screen.getByText('emptyTitle')).toBeInTheDocument()
    expect(screen.getByText('emptyDesc')).toBeInTheDocument()
  })

  it('should send a message when the send button is clicked', async () => {
    const mutate = vi.fn()
    vi.mocked(useAiChat).mockReturnValue({ isPending: false, mutate })

    renderChat()

    fireEvent.change(screen.getByPlaceholderText('inputPlaceholder'), {
      target: { value: 'How do I book a session?' },
    })
    fireEvent.click(screen.getByLabelText('sendButton'))

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        { message: 'How do I book a session?', conversationId: undefined, lang: 'en' },
        expect.any(Object),
      )
    })
  })

  it('should render initial history messages when provided', () => {
    render(
      <AiCoachChat
        history={[
          { role: 'assistant', content: 'Welcome!', timestamp: '2026-01-01T00:00:00Z' },
        ]}
      />,
    )
    expect(screen.getByText('Welcome!')).toBeInTheDocument()
  })

  it('should not send when input is empty', () => {
    const mutate = vi.fn()
    vi.mocked(useAiChat).mockReturnValue({ isPending: false, mutate })

    renderChat()
    fireEvent.click(screen.getByLabelText('sendButton'))

    expect(mutate).not.toHaveBeenCalled()
  })
})

