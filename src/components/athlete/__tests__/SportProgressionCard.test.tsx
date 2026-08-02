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
  it('should render sport name, big level number, XP, and XP to next level', () => {
    render(<SportProgressionCard sport={baseSport} />)

    expect(screen.getByText('Football')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('level_caption')).toBeInTheDocument()
    expect(screen.getByText('500 XP')).toBeInTheDocument()
    expect(screen.getByText('200 XP to next level')).toBeInTheDocument()
  })

  it('should show tier badge', () => {
    render(<SportProgressionCard sport={baseSport} />)

    expect(screen.getByText('tiers.gold')).toBeInTheDocument()
  })

  it('should render an accessible progress bar with the derived percentage', () => {
    const { container } = render(<SportProgressionCard sport={baseSport} />)

    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '71')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
    expect(container.querySelector('.bg-emerald-500')).toHaveStyle({ width: '71%' })
  })

  it('should render zero-width progress when there is no XP data', () => {
    render(<SportProgressionCard sport={{ ...baseSport, xp: 0, xp_to_next_level: 0 }} />)

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('should highlight the primary sport card with a glow ring and badge', () => {
    const { container } = render(<SportProgressionCard sport={{ ...baseSport, is_primary: true }} />)

    expect(screen.getByLabelText('primary')).toBeInTheDocument()
    expect(screen.getByText('primary')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('ring-1')
    expect(container.firstChild).toHaveClass('border-emerald-400/40')
  })

  it('should not highlight non-primary sport cards', () => {
    const { container } = render(<SportProgressionCard sport={baseSport} />)

    expect(screen.queryByLabelText('primary')).not.toBeInTheDocument()
    expect(container.firstChild).not.toHaveClass('ring-1')
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
