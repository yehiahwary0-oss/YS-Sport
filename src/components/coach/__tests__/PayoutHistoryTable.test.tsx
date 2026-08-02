import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PayoutHistoryTable, PayoutHistoryTableSkeleton } from '../PayoutHistoryTable'

const payouts = [
  {
    uuid: 'p1',
    payout_ref: 'PO-2026-0001',
    amount: 50,
    currency: 'USD',
    payout_method: 'bank_transfer',
    payout_reference: null,
    status: 'pending',
    requested_at: '2026-07-01T10:00:00Z',
    approved_at: null,
    sent_at: null,
    rejection_reason: null,
    failed_reason: null,
  },
  {
    uuid: 'p2',
    payout_ref: 'PO-2026-0002',
    amount: 100,
    currency: 'USD',
    payout_method: 'paypal',
    payout_reference: 'wallet-id',
    status: 'sent',
    requested_at: '2026-07-10T10:00:00Z',
    approved_at: '2026-07-11T10:00:00Z',
    sent_at: '2026-07-12T10:00:00Z',
    rejection_reason: null,
    failed_reason: null,
  },
]

describe('PayoutHistoryTable', () => {
  it('renders payout rows with formatted values', () => {
    render(<PayoutHistoryTable payouts={payouts} />)

    expect(screen.getByText('Jul 1, 2026')).toBeInTheDocument()
    expect(screen.getByText('$50')).toBeInTheDocument()
    expect(screen.getByText('method_bank_transfer')).toBeInTheDocument()
    expect(screen.getByText('status_pending')).toBeInTheDocument()
    expect(screen.getByText('PO-2026-0001')).toBeInTheDocument()

    expect(screen.getByText('Jul 10, 2026')).toBeInTheDocument()
    expect(screen.getByText('$100')).toBeInTheDocument()
    expect(screen.getByText('method_paypal')).toBeInTheDocument()
    expect(screen.getByText('status_sent')).toBeInTheDocument()
    expect(screen.getByText('PO-2026-0002')).toBeInTheDocument()
  })

  it('falls back to the raw method string for unknown payout methods', () => {
    const unknown = [{ ...payouts[0], payout_method: 'crypto_xrp' }]
    render(<PayoutHistoryTable payouts={unknown} />)
    expect(screen.getByText('crypto_xrp')).toBeInTheDocument()
  })

  it('shows the empty state when there are no payouts', () => {
    render(<PayoutHistoryTable payouts={[]} />)
    expect(screen.getByText('noPayouts')).toBeInTheDocument()
    expect(screen.getByText('noPayoutsDesc')).toBeInTheDocument()
  })
})

describe('PayoutHistoryTableSkeleton', () => {
  it('renders pulse placeholders', () => {
    const { container } = render(<PayoutHistoryTableSkeleton />)
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4)
  })
})
