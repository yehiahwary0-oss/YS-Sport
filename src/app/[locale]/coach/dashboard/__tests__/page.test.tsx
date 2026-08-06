import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import CoachDashboardPage from '../page'

vi.mock('@/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))

vi.mock('@/components/shared/ServiceRequestCard', () => ({
  ServiceRequestCard: () => <div data-testid="request-card" />,
  ServiceRequestCardSkeleton: () => <div data-testid="request-skeleton" />,
}))

vi.mock('@/hooks/useProfile', () => ({ useCoachProfileSelf: vi.fn() }))
vi.mock('@/hooks/useServiceRequest', () => ({ useCoachServiceRequests: vi.fn() }))
vi.mock('@/hooks/useBookings', () => ({ useCoachBookings: vi.fn() }))
vi.mock('@/hooks/useEarnings', () => ({ useEarningsSummary: vi.fn() }))

const { useCoachProfileSelf } = await import('@/hooks/useProfile')
const { useCoachServiceRequests } = await import('@/hooks/useServiceRequest')
const { useCoachBookings } = await import('@/hooks/useBookings')
const { useEarningsSummary } = await import('@/hooks/useEarnings')

function baseProfile(overrides: Record<string, unknown>) {
  return {
    uuid: 'coach-1',
    display_name: 'Coach One',
    profile_completion: 80,
    avg_rating: '4.5',
    rejection_reason: null,
    ...overrides,
  }
}

function renderPage(profile: Record<string, unknown>) {
  vi.mocked(useCoachProfileSelf).mockReturnValue({ data: baseProfile(profile) } as never)
  vi.mocked(useCoachServiceRequests).mockReturnValue({
    data: { data: [], meta: { total: 0 } },
    isLoading: false,
    isError: false,
  } as never)
  vi.mocked(useCoachBookings).mockReturnValue({ data: { meta: { total: 0 } } } as never)
  vi.mocked(useEarningsSummary).mockReturnValue({ data: { this_month_earned: '100', currency: 'USD' } } as never)

  return render(<CoachDashboardPage />)
}

describe('CoachDashboardPage verification badge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a verified badge for verified coaches', () => {
    renderPage({ verification_status: 'verified' })
    expect(screen.getByText('verifiedLabel')).toBeInTheDocument()
    expect(screen.getByText('verifiedHint')).toBeInTheDocument()
  })

  it('shows the under-review badge with a wait hint for pending', () => {
    renderPage({ verification_status: 'pending' })
    expect(screen.getByText('pendingLabel')).toBeInTheDocument()
    expect(screen.getByText('pendingHint')).toBeInTheDocument()
  })

  it('shows the rejection reason and a re-submit link for rejected coaches', () => {
    renderPage({
      verification_status: 'rejected',
      rejection_reason: 'Certificate was not legible.',
    })

    expect(screen.getByText('rejectedLabel')).toBeInTheDocument()
    expect(screen.getByText(/Certificate was not legible/)).toBeInTheDocument()

    const resubmit = screen.getByRole('link', { name: /resubmit/ })
    expect(resubmit).toHaveAttribute('href', '/coach/profile')
  })

  it('shows a get-verified CTA for unverified coaches', () => {
    renderPage({ verification_status: 'unverified' })
    expect(screen.getByText('unverifiedLabel')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /getVerified/ })).toHaveAttribute('href', '/coach/profile')
  })

  it('renders the profile completion banner for incomplete profiles', () => {
    renderPage({ verification_status: 'pending', profile_completion: 80 })
    expect(screen.getByText('profileCompletion', { exact: true })).toBeInTheDocument()
  })
})