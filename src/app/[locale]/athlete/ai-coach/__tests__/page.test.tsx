import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import AthleteAiCoachPage from '../page'

vi.mock('@/hooks/useAiCoach', () => ({
  useAiChat: vi.fn(),
}))

const { useAiChat } = await import('@/hooks/useAiCoach')

describe('AthleteAiCoachPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAiChat).mockReturnValue({ isPending: false, mutate: vi.fn() })
  })

  it('should render the AI coach chat', () => {
    render(<AthleteAiCoachPage />)
    expect(screen.getByText('emptyTitle')).toBeInTheDocument()
    expect(screen.getByLabelText('sendButton')).toBeInTheDocument()
  })
})
