import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EarningsSummaryCard, EarningsSummaryCardSkeleton } from '../EarningsSummaryCard'

const summary = {
  lifetime_earned: 1200.5,
  this_month_earned: 100,
  pending_payout: 200,
  total_commission: 120,
  available_balance: 950.75,
  withdrawn_total: 49.75,
  currency: 'USD',
}

describe('EarningsSummaryCard', () => {
  it('renders all four metrics formatted as currency', () => {
    render(<EarningsSummaryCard summary={summary} />)

    expect(screen.getByText('totalEarned')).toBeInTheDocument()
    expect(screen.getByText('$1,200.5')).toBeInTheDocument()

    expect(screen.getByText('availableBalance')).toBeInTheDocument()
    expect(screen.getByText('$950.75')).toBeInTheDocument()

    expect(screen.getByText('pendingAmount')).toBeInTheDocument()
    expect(screen.getByText('$200')).toBeInTheDocument()

    expect(screen.getByText('totalWithdrawn')).toBeInTheDocument()
    expect(screen.getByText('$49.75')).toBeInTheDocument()
  })

  it('renders placeholders when summary is undefined', () => {
    render(<EarningsSummaryCard />)
    expect(screen.getAllByText('—')).toHaveLength(4)
  })
})

describe('EarningsSummaryCardSkeleton', () => {
  it('renders four pulse placeholders', () => {
    const { container } = render(<EarningsSummaryCardSkeleton />)
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4)
  })
})
