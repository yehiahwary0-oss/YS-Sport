import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SummaryCards } from '../SummaryCards'

describe('SummaryCards', () => {
  it('should render total XP, total sports, and primary sport', () => {
    render(<SummaryCards totalXp={1500} totalSports={3} primarySport="Football" />)

    expect(screen.getByText('1500 Total XP')).toBeInTheDocument()
    expect(screen.getByText('3 Sports')).toBeInTheDocument()
    expect(screen.getByText('Football')).toBeInTheDocument()
  })

  it('should show em dash when primarySport is null', () => {
    render(<SummaryCards totalXp={0} totalSports={0} primarySport={null} />)

    expect(screen.getByText('0 Total XP')).toBeInTheDocument()
    expect(screen.getByText('0 Sports')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('should render with zero values', () => {
    render(<SummaryCards totalXp={0} totalSports={0} primarySport={null} />)

    expect(screen.getByText('0 Total XP')).toBeInTheDocument()
    expect(screen.getByText('0 Sports')).toBeInTheDocument()
  })
})
