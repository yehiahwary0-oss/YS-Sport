import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PaymentSuccessPage from '../page'

const booking = {
  uuid: 'b1',
  status: 'pending',
  payment: { status: 'pending', amount: '50', currency: 'USD' },
}

const confirm = {
  mutate: vi.fn(),
  isPending: false,
  isIdle: false,
  isError: false,
  isSuccess: false,
  data: undefined as never,
  error: null as never,
}

const poll = { data: undefined as never, timedOut: false }

vi.mock('@/navigation', () => ({
  Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ uuid: 'b1' })),
}))

vi.mock('@/hooks/usePayments', () => ({
  useConfirmPaymentSuccess: vi.fn(() => confirm),
}))

vi.mock('@/hooks/useBookings', () => ({
  useAthleteBookingDetail: vi.fn(() => ({ data: booking, isLoading: false, isError: false })),
}))

vi.mock('@/hooks/useBookingPayment', () => ({
  useBookingPayment: vi.fn(() => poll),
}))

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <PaymentSuccessPage />
    </QueryClientProvider>
  )
}

describe('PaymentSuccessPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(confirm, {
      isPending: false,
      isIdle: false,
      isError: false,
      isSuccess: false,
      data: undefined,
      error: null,
    })
    Object.assign(poll, { data: undefined, timedOut: false })
  })

  it('confirms the payment on mount', () => {
    renderPage()
    expect(confirm.mutate).toHaveBeenCalledWith('b1')
  })

  it('shows a confirming state while the verification request is pending', () => {
    confirm.isPending = true
    renderPage()
    expect(screen.getByText('confirmingTitle')).toBeInTheDocument()
    expect(screen.getByText('confirmingDesc')).toBeInTheDocument()
  })

  it('shows an error state when verification fails', () => {
    confirm.isError = true
    renderPage()
    expect(screen.getByText('errorTitle')).toBeInTheDocument()
    expect(screen.getByText('errorDesc')).toBeInTheDocument()
  })

  it('shows the success state once the payment is confirmed', () => {
    confirm.isSuccess = true
    confirm.data = { status: 'paid', amount: '50', currency: 'USD' } as never
    renderPage()
    expect(screen.getByText('successTitle')).toBeInTheDocument()
    expect(screen.getByText('successDesc')).toBeInTheDocument()
    expect(screen.getByText('$50')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'backToBooking' })).toBeInTheDocument()
  })

  it('shows the waiting state while the payment is still pending', () => {
    confirm.isSuccess = true
    confirm.data = { status: 'pending', amount: '50', currency: 'USD' } as never
    poll.data = { payment: { status: 'pending' } } as never
    renderPage()
    expect(screen.getByText('waitingTitle')).toBeInTheDocument()
    expect(screen.getByText('waitingDesc')).toBeInTheDocument()
    expect(screen.getByText('$50')).toBeInTheDocument()
  })

  it('flips to success once polling picks up the settled payment', () => {
    confirm.isSuccess = true
    confirm.data = { status: 'pending', amount: '50', currency: 'USD' } as never
    poll.data = { payment: { status: 'paid', amount: '50', currency: 'USD' } } as never
    renderPage()
    expect(screen.getByText('successTitle')).toBeInTheDocument()
  })

  it('shows the still-pending message once polling times out', () => {
    confirm.isSuccess = true
    confirm.data = { status: 'pending', amount: '50', currency: 'USD' } as never
    poll.data = { payment: { status: 'pending' } } as never
    poll.timedOut = true
    renderPage()
    expect(screen.getByText('stillPending')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'backToBooking' })).toBeInTheDocument()
  })
})
