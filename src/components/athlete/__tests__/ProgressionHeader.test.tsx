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

  it('should not render sensitive fields like uuid or email', () => {
    render(<ProgressionHeader uuid="u1" displayName="John Doe" avatarUrl={null} />)

    expect(screen.queryByText('u1')).not.toBeInTheDocument()
    expect(screen.queryByText('user@email.com')).not.toBeInTheDocument()
  })
})
