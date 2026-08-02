import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CoachPayoutsPage from '../page'

vi.mock('@/hooks/useCoachPayouts', () => ({
  useCoachPayoutSummary: vi.fn(),
  useCoachPayouts: vi.fn(),
  useRequestPayout: vi.fn(),
}))

const { useCoachPayoutSummary, useCoachPayouts, useRequestPayout } = await import('@/hooks/useCoachPayouts')

const summary = {
  lifetime_earned: 1000,
  this_month_earned: 200,
  pending_payout: 50,
  total_commission: 100,
  available_balance: 850,
  withdrawn_total: 100,
  currency: 'USD',
}

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
]

const refetchSummary = vi.fn()
const refetchHistory = vi.fn()

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <CoachPayoutsPage />
    </QueryClientProvider>
  )
}

describe('CoachPayoutsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    refetchSummary.mockClear()
    refetchHistory.mockClear()

    vi.mocked(useCoachPayoutSummary).mockReturnValue({
      data: summary,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchSummary,
    } as never)
    vi.mocked(useCoachPayouts).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchHistory,
    } as never)
    vi.mocked(useRequestPayout).mockReturnValue({ mutate: vi.fn(), isPending: false } as never)
  })

  it('shows loading skeletons while queries are pending', () => {
    vi.mocked(useCoachPayoutSummary).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: refetchSummary,
    } as never)
    vi.mocked(useCoachPayouts).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: refetchHistory,
    } as never)

    const { container } = renderPage()

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(8)
  })

  it('shows an error state with retry for a failed summary', () => {
    vi.mocked(useCoachPayoutSummary).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('boom'),
      refetch: refetchSummary,
    } as never)

    renderPage()

    expect(screen.getByText('defaultError')).toBeInTheDocument()
    screen.getByRole('button', { name: 'retry' }).click()
    expect(refetchSummary).toHaveBeenCalled()
  })

  it('renders the earnings summary, history table and request button', () => {
    vi.mocked(useCoachPayouts).mockReturnValue({
      data: [{ ...payouts[0], status: 'sent' }],
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchHistory,
    } as never)

    renderPage()

    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('$850')).toBeInTheDocument()
    expect(screen.getByText('$1,000')).toBeInTheDocument()
    expect(screen.getByText('historyTitle')).toBeInTheDocument()
    expect(screen.getByText('PO-2026-0001')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'requestPayout' })).toBeEnabled()
  })

  it('disables the request button when balance is below the minimum', () => {
    vi.mocked(useCoachPayoutSummary).mockReturnValue({
      data: { ...summary, available_balance: 10 },
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchSummary,
    } as never)

    renderPage()

    expect(screen.getByRole('button', { name: 'requestPayout' })).toBeDisabled()
    expect(screen.getByText('belowMinimumNotice')).toBeInTheDocument()
  })

  it('disables the request button and shows a notice when a payout is being processed', () => {
    vi.mocked(useCoachPayouts).mockReturnValue({
      data: payouts,
      isLoading: false,
      isError: false,
      error: null,
      refetch: refetchHistory,
    } as never)

    renderPage()

    expect(screen.getByRole('button', { name: 'requestPayout' })).toBeDisabled()
    expect(screen.getByText('pendingRequestNotice')).toBeInTheDocument()
  })

  it('opens the request modal when the button is clicked', async () => {
    renderPage()

    screen.getByRole('button', { name: 'requestPayout' }).click()

    await waitFor(() => expect(screen.getByText('requestTitle')).toBeInTheDocument())
  })
})
