import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LockedAchievements } from '../LockedAchievements'

describe('LockedAchievements', () => {
  it('should render section title and description', () => {
    render(<LockedAchievements />)

    expect(screen.getByText('lockedTitle')).toBeInTheDocument()
    expect(screen.getByText('lockedDescription')).toBeInTheDocument()
  })

  it('should render all four locked placeholder cards grayed out', () => {
    const { container } = render(<LockedAchievements />)

    expect(screen.getByText('locked.reach_level_10')).toBeInTheDocument()
    expect(screen.getByText('locked.earn_2500_xp')).toBeInTheDocument()
    expect(screen.getByText('locked.complete_25_sessions')).toBeInTheDocument()
    expect(screen.getByText('locked.try_3_sports')).toBeInTheDocument()

    const cards = container.querySelectorAll('.grayscale')
    expect(cards).toHaveLength(4)
  })
})
