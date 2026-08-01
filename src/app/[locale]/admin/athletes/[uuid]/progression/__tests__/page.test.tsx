import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminAthleteProgressionPage from '../page'

const mockProgression = {
  athlete: {
    uuid: 'ath-uuid-1',
    display_name: 'Alice Smith',
    avatar_url: null,
    bio: null,
    joined_at: '2026-01-01T00:00:00Z',
  },
  summary: {
    total_xp: 1500,
    total_sports: 2,
    total_achievements: 3,
    total_xp_events: 25,
  },
  sports: [
    { sport: { id: 1, name: 'Football', slug: 'football' }, is_primary: true, level: 5, xp: 800, tier: 'gold', xp_to_next_level: 200 },
  ],
  achievements: [
    { uuid: 'ach-1', name: 'First Goal', description: 'Score your first goal', earned_at: '2026-02-01T00:00:00Z' },
  ],
}

const mockXpEvents = [
  { uuid: 'xp-1', sport_id: 1, xp_amount: 50, source_type: 'booking', source_id: 1, reason: 'Completed session', source: null, created_at: '2026-03-01T00:00:00Z' },
  { uuid: 'xp-2', sport_id: 1, xp_amount: 100, source_type: 'achievement', source_id: 1, reason: 'Earned achievement', source: null, created_at: '2026-02-15T00:00:00Z' },
]

const xpMultiPageResponse = {
  data: mockXpEvents,
  meta: { current_page: 1, last_page: 3, per_page: 10, total: 25 },
}

const xpSinglePageResponse = {
  data: mockXpEvents,
  meta: { current_page: 1, last_page: 1, per_page: 10, total: 2 },
}

const mockMutate = vi.fn()

vi.mock('@/navigation', () => ({
  Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

vi.mock('@/hooks/useAdmin', () => ({
  useAdminAthleteProgression: vi.fn(),
  useAdminAthleteXpEvents: vi.fn(),
  useGrantXp: vi.fn(() => ({ mutate: mockMutate, isPending: false })),
}))

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ uuid: 'ath-uuid-1' })),
}))

const { useAdminAthleteProgression, useAdminAthleteXpEvents, useGrantXp } = await import('@/hooks/useAdmin')

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <AdminAthleteProgressionPage />
    </QueryClientProvider>,
  )
}

function withinDialog() {
  return within(screen.getByRole('dialog'))
}

describe('AdminAthleteProgressionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAdminAthleteProgression).mockReturnValue({
      data: mockProgression,
      isLoading: false,
      isError: false,
    } as any)
    vi.mocked(useAdminAthleteXpEvents).mockReturnValue({
      data: xpMultiPageResponse,
      isLoading: false,
      isError: false,
    } as any)
    vi.mocked(useGrantXp).mockReturnValue({ mutate: mockMutate, isPending: false } as any)
  })

  // ── Loading state ──

  it('shows loading skeleton when progression loading', () => {
    vi.mocked(useAdminAthleteProgression).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any)

    renderPage()
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  // ── Error state ──

  it('shows error state when progression fails', () => {
    vi.mocked(useAdminAthleteProgression).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('API error'),
    } as any)

    renderPage()
    expect(screen.getByText('defaultError')).toBeInTheDocument()
    expect(screen.getByText('retry')).toBeInTheDocument()
  })

  // ── Empty states ──

  it('shows empty state when no XP events', () => {
    vi.mocked(useAdminAthleteXpEvents).mockReturnValue({
      data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 } },
      isLoading: false,
      isError: false,
    } as any)

    renderPage()
    expect(screen.getByText('noXpEvents')).toBeInTheDocument()
  })

  // ── XP events list ──

  it('renders XP events with reasons and amounts', () => {
    renderPage()
    expect(screen.getByText('Completed session')).toBeInTheDocument()
    expect(screen.getByText('Earned achievement')).toBeInTheDocument()
    expect(screen.getByText('+50')).toBeInTheDocument()
    expect(screen.getByText('+100')).toBeInTheDocument()
  })

  it('renders XP event source badges', () => {
    renderPage()
    expect(screen.getByText('booking')).toBeInTheDocument()
    expect(screen.getByText('achievement')).toBeInTheDocument()
  })

  // ── XP events pagination ──

  it('pagination renders when multiple pages', () => {
    renderPage()
    expect(screen.getByLabelText('previous')).toBeInTheDocument()
    expect(screen.getByLabelText('next')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/^pageLabel/)).toHaveLength(3)
  })

  it('pagination has accessible navigation role', () => {
    renderPage()
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'paginationLabel')
  })

  it('current page button has aria-current', () => {
    renderPage()
    const pageBtns = screen.getAllByLabelText(/^pageLabel/)
    const currentBtn = pageBtns.find(b => b.getAttribute('aria-current') === 'page')
    expect(currentBtn).toBeTruthy()
    expect(currentBtn).toHaveTextContent('1')
  })

  it('first page disables previous', () => {
    renderPage()
    expect(screen.getByLabelText('previous')).toBeDisabled()
  })

  it('does not show pagination for single page', () => {
    vi.mocked(useAdminAthleteXpEvents).mockReturnValue({
      data: xpSinglePageResponse,
      isLoading: false,
      isError: false,
    } as any)

    renderPage()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('clicking next does not error', () => {
    renderPage()
    fireEvent.click(screen.getByLabelText('next'))
    expect(screen.getByLabelText('next')).toBeEnabled()
  })

  it('clicking previous does not error', () => {
    renderPage()
    fireEvent.click(screen.getByLabelText('previous'))
    expect(screen.getByLabelText('previous')).toBeDisabled()
  })

  // ── Progression summary renders ──

  it('renders progression athlete name', () => {
    renderPage()
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
  })

  it('renders summary stat values', () => {
    renderPage()
    expect(screen.getByText('1500')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1)
  })

  // ── Grant XP Dialog ──

  it('renders Grant XP button', () => {
    renderPage()
    expect(screen.getByText('grantXpButton')).toBeInTheDocument()
  })

  it('opens dialog when Grant XP button is clicked', () => {
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('dialog displays athlete name in title', () => {
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    expect(withinDialog().getByText('grantXpTitle')).toBeInTheDocument()
  })

  it('dialog renders XP amount input', () => {
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    expect(withinDialog().getByLabelText('xpAmountLabel')).toBeInTheDocument()
  })

  it('dialog renders reason textarea', () => {
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    expect(withinDialog().getByLabelText('reasonLabel')).toBeInTheDocument()
  })

  it('dialog renders sport selector', () => {
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    expect(withinDialog().getByText('Football')).toBeInTheDocument()
  })

  it('shows validation error for empty XP amount on Next', () => {
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    fireEvent.click(withinDialog().getByText('next'))
    expect(withinDialog().getByText('xpAmountInvalid')).toBeInTheDocument()
  })

  it('accepts empty reason and proceeds to confirmation', () => {
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    const xpInput = withinDialog().getByLabelText('xpAmountLabel')
    fireEvent.change(xpInput, { target: { value: '50' } })
    fireEvent.click(withinDialog().getByText('next'))
    expect(withinDialog().getByText('grantingTo')).toBeInTheDocument()
  })

  it('proceeds to confirmation step with valid inputs', () => {
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    const xpInput = withinDialog().getByLabelText('xpAmountLabel')
    fireEvent.change(xpInput, { target: { value: '50' } })
    const reasonInput = withinDialog().getByLabelText('reasonLabel')
    fireEvent.change(reasonInput, { target: { value: 'Bonus XP' } })
    fireEvent.click(withinDialog().getByText('next'))
    expect(withinDialog().getByText('grantingTo')).toBeInTheDocument()
  })

  it('confirmation step shows XP amount', () => {
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    const xpInput = withinDialog().getByLabelText('xpAmountLabel')
    fireEvent.change(xpInput, { target: { value: '50' } })
    const reasonInput = withinDialog().getByLabelText('reasonLabel')
    fireEvent.change(reasonInput, { target: { value: 'Bonus XP' } })
    fireEvent.click(withinDialog().getByText('next'))
    expect(withinDialog().getByText('xpAmountSummary')).toBeInTheDocument()
  })

  it('confirmation step shows reason', () => {
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    const xpInput = withinDialog().getByLabelText('xpAmountLabel')
    fireEvent.change(xpInput, { target: { value: '50' } })
    const reasonInput = withinDialog().getByLabelText('reasonLabel')
    fireEvent.change(reasonInput, { target: { value: 'Bonus XP' } })
    fireEvent.click(withinDialog().getByText('next'))
    expect(withinDialog().getByText('reasonSummary')).toBeInTheDocument()
  })

  it('confirmation step shows permanent ledger warning', () => {
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    const xpInput = withinDialog().getByLabelText('xpAmountLabel')
    fireEvent.change(xpInput, { target: { value: '50' } })
    const reasonInput = withinDialog().getByLabelText('reasonLabel')
    fireEvent.change(reasonInput, { target: { value: 'Bonus XP' } })
    fireEvent.click(withinDialog().getByText('next'))
    expect(withinDialog().getByText('permanentLedgerEvent')).toBeInTheDocument()
  })

  it('submits mutation on confirm with correct payload', () => {
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    const xpInput = withinDialog().getByLabelText('xpAmountLabel')
    fireEvent.change(xpInput, { target: { value: '50' } })
    const reasonInput = withinDialog().getByLabelText('reasonLabel')
    fireEvent.change(reasonInput, { target: { value: 'Bonus XP' } })
    fireEvent.click(withinDialog().getByText('next'))
    fireEvent.click(withinDialog().getByText('grantXpConfirm'))
    expect(mockMutate).toHaveBeenCalledWith(
      { sport_id: 1, xp_amount: 50, reason: 'Bonus XP' },
      expect.any(Object),
    )
  })

  it('submits mutation without reason when omitted', () => {
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    const xpInput = withinDialog().getByLabelText('xpAmountLabel')
    fireEvent.change(xpInput, { target: { value: '25' } })
    fireEvent.click(withinDialog().getByText('next'))
    fireEvent.click(withinDialog().getByText('grantXpConfirm'))
    expect(mockMutate).toHaveBeenCalledWith(
      { sport_id: 1, xp_amount: 25, reason: undefined },
      expect.any(Object),
    )
  })

  it('submit button is disabled while pending', () => {
    vi.mocked(useGrantXp).mockReturnValue({ mutate: mockMutate, isPending: true } as any)
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    const xpInput = withinDialog().getByLabelText('xpAmountLabel')
    fireEvent.change(xpInput, { target: { value: '50' } })
    const reasonInput = withinDialog().getByLabelText('reasonLabel')
    fireEvent.change(reasonInput, { target: { value: 'Bonus XP' } })
    fireEvent.click(withinDialog().getByText('next'))
    expect(withinDialog().getByText('grantingXp')).toBeInTheDocument()
  })

  it('dialog closes after successful grant', async () => {
    mockMutate.mockImplementation((_payload, { onSuccess }: any) => {
      onSuccess({ status: 'awarded', xp: 50, level: 1, previous_level: null })
    })
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    const xpInput = withinDialog().getByLabelText('xpAmountLabel')
    fireEvent.change(xpInput, { target: { value: '50' } })
    const reasonInput = withinDialog().getByLabelText('reasonLabel')
    fireEvent.change(reasonInput, { target: { value: 'Bonus XP' } })
    fireEvent.click(withinDialog().getByText('next'))
    fireEvent.click(withinDialog().getByText('grantXpConfirm'))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('shows already processed message when grant is duplicate', async () => {
    mockMutate.mockImplementation((_payload, { onSuccess }: any) => {
      onSuccess({ status: 'already_processed', xp: 50, level: 1, previous_level: null })
    })
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    const xpInput = withinDialog().getByLabelText('xpAmountLabel')
    fireEvent.change(xpInput, { target: { value: '50' } })
    const reasonInput = withinDialog().getByLabelText('reasonLabel')
    fireEvent.change(reasonInput, { target: { value: 'Bonus XP' } })
    fireEvent.click(withinDialog().getByText('next'))
    fireEvent.click(withinDialog().getByText('grantXpConfirm'))
    await waitFor(() => {
      expect(withinDialog().getByText('grantXpAlreadyProcessed')).toBeInTheDocument()
    })
  })

  it('shows error message on mutation failure', async () => {
    mockMutate.mockImplementation((_payload, { onError }: any) => {
      onError(new Error('API error'))
    })
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    const xpInput = withinDialog().getByLabelText('xpAmountLabel')
    fireEvent.change(xpInput, { target: { value: '50' } })
    const reasonInput = withinDialog().getByLabelText('reasonLabel')
    fireEvent.change(reasonInput, { target: { value: 'Bonus XP' } })
    fireEvent.click(withinDialog().getByText('next'))
    fireEvent.click(withinDialog().getByText('grantXpConfirm'))
    await waitFor(() => {
      expect(withinDialog().getByText('grantXpError')).toBeInTheDocument()
    })
  })

  it('back button returns to form from confirmation', () => {
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    const xpInput = withinDialog().getByLabelText('xpAmountLabel')
    fireEvent.change(xpInput, { target: { value: '50' } })
    const reasonInput = withinDialog().getByLabelText('reasonLabel')
    fireEvent.change(reasonInput, { target: { value: 'Bonus XP' } })
    fireEvent.click(withinDialog().getByText('next'))
    fireEvent.click(withinDialog().getByText('back'))
    expect(withinDialog().getByText('xpAmountLabel')).toBeInTheDocument()
  })

  it('dialog can be closed with cancel button', () => {
    renderPage()
    fireEvent.click(screen.getByText('grantXpButton'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(withinDialog().getByText('cancel'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
