import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SportProgressionCard, SportProgressionCardSkeleton } from '../SportProgressionCard'

const baseSport = {
  sport: { id: 1, name: 'Football', slug: 'football' },
  xp: 500,
  level: 5,
  tier: 'gold' as const,
  xp_to_next_level: 200,
  is_primary: false,
}

describe('SportProgressionCard', () => {
  it('should render sport name, level, XP, and XP to next level', () => {
    render(<SportProgressionCard sport={baseSport} />)

    expect(screen.getByText('Football')).toBeInTheDocument()
    expect(screen.getByText('Level 5')).toBeInTheDocument()
    expect(screen.getByText('500 XP')).toBeInTheDocument()
    expect(screen.getByText('200 XP to next level')).toBeInTheDocument()
  })

  it('should show tier badge', () => {
    render(<SportProgressionCard sport={baseSport} />)

    expect(screen.getByText('tiers.gold')).toBeInTheDocument()
  })

  it('should show primary indicator when is_primary is true', () => {
    render(<SportProgressionCard sport={{ ...baseSport, is_primary: true }} />)

    expect(screen.getByLabelText('primary')).toBeInTheDocument()
  })

  it('should not show primary indicator when is_primary is false', () => {
    render(<SportProgressionCard sport={baseSport} />)

    expect(screen.queryByLabelText('primary')).not.toBeInTheDocument()
  })

  it('should handle long sport names without overflow', () => {
    const longName = 'Supercalifragilisticexpialidocious Basketball Association'
    render(<SportProgressionCard sport={{ ...baseSport, sport: { ...baseSport.sport, name: longName } }} />)

    expect(screen.getByText(longName)).toBeInTheDocument()
  })
})

describe('SportProgressionCardSkeleton', () => {
  it('should render with animate-pulse class', () => {
    const { container } = render(<SportProgressionCardSkeleton />)

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
