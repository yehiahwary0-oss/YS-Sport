import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressionHeader } from '../ProgressionHeader'

describe('ProgressionHeader', () => {
  it('should render the display name', () => {
    render(<ProgressionHeader uuid="u1" displayName="John Doe" avatarUrl={null} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should render the initials fallback when no avatar', () => {
    render(<ProgressionHeader uuid="u1" displayName="John Doe" avatarUrl={null} />)

    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('should render the title translation from useTranslations', () => {
    render(<ProgressionHeader uuid="u1" displayName="John Doe" avatarUrl={null} />)

    expect(screen.getByText('title')).toBeInTheDocument()
  })

  it('should render bio when provided', () => {
    render(
      <ProgressionHeader
        uuid="u1"
        displayName="John Doe"
        avatarUrl={null}
        bio="Professional footballer"
      />,
    )

    expect(screen.getByText('Professional footballer')).toBeInTheDocument()
  })

  it('should render member since date when joined_at is provided', () => {
    render(
      <ProgressionHeader
        uuid="u1"
        displayName="John Doe"
        avatarUrl={null}
        joinedAt="2024-03-15T00:00:00Z"
      />,
    )

    expect(screen.getByText('member_since')).toBeInTheDocument()
    const time = screen.getByText('member_since').closest('time')
    expect(time).toHaveAttribute('datetime', '2024-03-15T00:00:00Z')
  })

  it('should not render bio or member since when not provided', () => {
    render(<ProgressionHeader uuid="u1" displayName="John Doe" avatarUrl={null} />)

    expect(screen.queryByText('member_since')).not.toBeInTheDocument()
  })

  it('should render an online indicator when online is true', () => {
    render(<ProgressionHeader uuid="u1" displayName="John Doe" avatarUrl={null} online />)

    expect(screen.getByLabelText('online')).toBeInTheDocument()
  })

  it('should not render an online indicator when online is false', () => {
    render(<ProgressionHeader uuid="u1" displayName="John Doe" avatarUrl={null} />)

    expect(screen.queryByLabelText('online')).not.toBeInTheDocument()
  })

  it('should not render sensitive fields like uuid or email', () => {
    render(<ProgressionHeader uuid="u1" displayName="John Doe" avatarUrl={null} />)

    expect(screen.queryByText('u1')).not.toBeInTheDocument()
    expect(screen.queryByText('user@email.com')).not.toBeInTheDocument()
  })
})
