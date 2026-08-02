import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PaymentCancelledPage from '../page'

const confirm = {
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  isSuccess: false,
}

vi.mock('@/navigation', () => ({
  Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ uuid: 'b1' })),
}))

vi.mock('@/hooks/usePayments', () => ({
  useConfirmPaymentCancelled: vi.fn(() => confirm),
}))

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <PaymentCancelledPage />
    </QueryClientProvider>
  )
}

describe('PaymentCancelledPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(confirm, { isPending: false, isError: false, isSuccess: false })
  })

  it('confirms the cancellation on mount', () => {
    renderPage()
    expect(confirm.mutate).toHaveBeenCalledWith('b1')
  })

  it('shows the cancelled state with a link back to the booking', () => {
    renderPage()
    expect(screen.getByText('cancelledTitle')).toBeInTheDocument()
    expect(screen.getByText('cancelledDesc')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'backToBooking' })).toBeInTheDocument()
  })
})
