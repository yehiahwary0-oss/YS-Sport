import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminAthletesPage from '../page'

const mockAthletes = [
  {
    uuid: 'user-uuid-1',
    email: 'alice@test.com',
    status: 'active',
    display_name: 'Alice Smith',
    avatar_url: null,
    athlete_uuid: 'ath-uuid-1',
    sports_count: 2,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    uuid: 'user-uuid-2',
    email: 'bob@test.com',
    status: 'suspended',
    display_name: 'Bob Jones',
    avatar_url: null,
    athlete_uuid: 'ath-uuid-2',
    sports_count: 1,
    created_at: '2026-01-15T00:00:00Z',
  },
]

const singlePageResponse = {
  data: mockAthletes,
  meta: { current_page: 1, last_page: 1, per_page: 20, total: 2 },
}

const multiPageResponse = {
  data: mockAthletes,
  meta: { current_page: 1, last_page: 3, per_page: 20, total: 45 },
}

vi.mock('@/navigation', () => ({
  Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

vi.mock('@/hooks/useAdmin', () => ({
  useAdminAthletes: vi.fn(),
}))

const { useAdminAthletes } = await import('@/hooks/useAdmin')

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <AdminAthletesPage />
    </QueryClientProvider>,
  )
}

describe('AdminAthletesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAdminAthletes).mockReturnValue({
      data: multiPageResponse,
      isLoading: false,
      isError: false,
    } as any)
  })

  // ── Loading state ──

  it('shows loading skeleton', () => {
    vi.mocked(useAdminAthletes).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any)

    renderPage()
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  // ── Error state ──

  it('shows error state with retry', () => {
    vi.mocked(useAdminAthletes).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('API error'),
    } as any)

    renderPage()
    expect(screen.getByText('defaultError')).toBeInTheDocument()
  })

  // ── Empty state — no athletes ──

  it('shows empty state when no athletes', () => {
    vi.mocked(useAdminAthletes).mockReturnValue({
      data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 } },
      isLoading: false,
      isError: false,
    } as any)

    renderPage()
    expect(screen.getByText('noAthletes')).toBeInTheDocument()
    expect(screen.getByText('noAthletesDesc')).toBeInTheDocument()
  })

  // ── Empty state — no search results ──

  it('shows no search results message when search has no match', () => {
    vi.useFakeTimers()
    vi.mocked(useAdminAthletes).mockReturnValue({
      data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 } },
      isLoading: false,
      isError: false,
    } as any)

    renderPage()
    const searchInput = screen.getByPlaceholderText('searchPlaceholder')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    act(() => { vi.advanceTimersByTime(300) })
    expect(screen.getByText('noSearchResults')).toBeInTheDocument()
    vi.useRealTimers()
  })

  // ── Search input ──

  it('search input renders with placeholder and aria-label', () => {
    vi.mocked(useAdminAthletes).mockReturnValue({
      data: singlePageResponse,
      isLoading: false,
      isError: false,
    } as any)

    renderPage()
    const searchInput = screen.getByPlaceholderText('searchPlaceholder')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('aria-label', 'searchPlaceholder')
  })

  it('search input can be typed into', () => {
    vi.mocked(useAdminAthletes).mockReturnValue({
      data: singlePageResponse,
      isLoading: false,
      isError: false,
    } as any)

    renderPage()
    const searchInput = screen.getByPlaceholderText('searchPlaceholder') as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'Alice' } })
    expect(searchInput).toHaveValue('Alice')
  })

  // ── Status filter ──

  it('status filter renders with aria-label', () => {
    vi.mocked(useAdminAthletes).mockReturnValue({
      data: singlePageResponse,
      isLoading: false,
      isError: false,
    } as any)

    renderPage()
    const select = screen.getByDisplayValue('allStatuses') as HTMLSelectElement
    expect(select).toBeInTheDocument()
    expect(select).toHaveAttribute('aria-label', 'status')
  })

  it('status filter can change value', () => {
    vi.mocked(useAdminAthletes).mockReturnValue({
      data: singlePageResponse,
      isLoading: false,
      isError: false,
    } as any)

    renderPage()
    const select = screen.getByDisplayValue('allStatuses') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'suspended' } })
    expect(select.value).toBe('suspended')
  })

  // ── Pagination ──

  it('pagination has accessible navigation role', () => {
    renderPage()
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'paginationLabel')
  })

  it('pagination previous/next buttons have accessible labels', () => {
    renderPage()
    expect(screen.getByLabelText('previous')).toBeInTheDocument()
    expect(screen.getByLabelText('next')).toBeInTheDocument()
  })

  it('page number buttons have accessible labels', () => {
    renderPage()
    expect(screen.getAllByLabelText(/^pageLabel/)).toHaveLength(3)
  })

  it('current page button has aria-current', () => {
    renderPage()
    const pageBtns = screen.getAllByLabelText(/^pageLabel/)
    const currentBtn = pageBtns.find(b => b.getAttribute('aria-current') === 'page')
    expect(currentBtn).toBeTruthy()
    expect(currentBtn).toHaveTextContent('1')
  })

  it('previous is disabled on page 1', () => {
    renderPage()
    expect(screen.getByLabelText('previous')).toBeDisabled()
  })

  it('next is enabled when not on last page', () => {
    renderPage()
    expect(screen.getByLabelText('next')).toBeEnabled()
  })

  it('does not show pagination for single page', () => {
    vi.mocked(useAdminAthletes).mockReturnValue({
      data: singlePageResponse,
      isLoading: false,
      isError: false,
    } as any)

    renderPage()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('clicking next button does not error', () => {
    renderPage()
    const nextBtn = screen.getByLabelText('next')
    fireEvent.click(nextBtn)
    expect(screen.getByLabelText('next')).toBeEnabled()
  })

  it('clicking previous button does not error', () => {
    renderPage()
    fireEvent.click(screen.getByLabelText('previous'))
    expect(screen.getByLabelText('previous')).toBeDisabled()
  })

  // ── Renders athlete data ──

  it('renders athlete names and emails', () => {
    renderPage()
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getByText('alice@test.com')).toBeInTheDocument()
    expect(screen.getByText('bob@test.com')).toBeInTheDocument()
  })

  it('renders progression links for each athlete', () => {
    renderPage()
    expect(screen.getAllByText('viewProgression')).toHaveLength(2)
  })

  it('renders status badges for each athlete', () => {
    renderPage()
    const badges = screen.getAllByText(/^(active|suspended)$/).filter(el => el.closest('span'))
    expect(badges).toHaveLength(2)
  })
})
