import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminAchievementsPage from '../page'

const mockAchievements = [
  {
    id: 1,
    uuid: 'uuid-1',
    slug: 'first-session',
    name: 'First Session',
    description: 'Complete your first session',
    icon: null,
    category: 'milestone',
    sport_id: null,
    sport: null,
    criteria: { type: 'session_count', operator: 'gte', value: 1 },
    xp_reward: 50,
    sort_order: 0,
    is_active: true,
    athlete_achievements_count: 3,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    uuid: 'uuid-2',
    slug: 'level-10',
    name: 'Level 10',
    description: 'Reach level 10',
    icon: '⭐',
    category: 'progression',
    sport_id: null,
    sport: null,
    criteria: { type: 'level_reached', operator: 'gte', value: 10 },
    xp_reward: 200,
    sort_order: 1,
    is_active: false,
    athlete_achievements_count: 0,
    created_at: '2026-01-02T00:00:00Z',
  },
]

const paginatedResponse = {
  data: mockAchievements,
  meta: { current_page: 1, last_page: 2, per_page: 20, total: 25 },
}

vi.mock('@/hooks/useAdmin', () => ({
  useAdminAchievements: vi.fn(),
  useCreateAchievement: vi.fn(),
  useUpdateAchievement: vi.fn(),
  useToggleAchievementStatus: vi.fn(),
  useGrantAchievement: vi.fn(),
}))

vi.mock('@/hooks/useMarketplace', () => ({
  useSports: vi.fn(),
}))

const { useAdminAchievements, useCreateAchievement, useUpdateAchievement, useToggleAchievementStatus, useGrantAchievement } =
  await import('@/hooks/useAdmin')
const { useSports } = await import('@/hooks/useMarketplace')

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <AdminAchievementsPage />
    </QueryClientProvider>,
  )
}

describe('AdminAchievementsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useCreateAchievement).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(useUpdateAchievement).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(useToggleAchievementStatus).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(useSports).mockReturnValue({
      data: [{ id: 1, name: 'Football', slug: 'football' }],
    } as any)
  })

  // ── Loading state ──

  it('shows loading skeleton', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any)

    renderPage()
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  // ── Error state ──

  it('shows error state with retry', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('API error'),
    } as any)

    renderPage()
    expect(document.querySelector('button')).toBeInTheDocument()
  })

  // ── Empty state ──

  it('shows empty state when no achievements', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 } },
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderPage()
    expect(screen.getByText('empty')).toBeInTheDocument()
    expect(screen.getByText('emptyDesc')).toBeInTheDocument()
  })

  // ── Renders list ──

  it('renders heading and achievements', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderPage()

    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('First Session')).toBeInTheDocument()
    expect(screen.getByText('Level 10')).toBeInTheDocument()
    expect(screen.getByText('(first-session)')).toBeInTheDocument()
    expect(screen.getByText('(level-10)')).toBeInTheDocument()
  })

  // ── Active/inactive badge ──

  it('shows active and inactive badges', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderPage()
    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('inactive')).toBeInTheDocument()
  })

  // ── Search input ──

  it('search input renders and can be typed into', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderPage()
    const searchInput = screen.getByPlaceholderText('Search slug / name…')
    expect(searchInput).toBeInTheDocument()

    fireEvent.change(searchInput, { target: { value: 'first' } })
    expect(searchInput).toHaveValue('first')
  })

  // ── Status filter ──

  it('status filter changes', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderPage()
    const statusSelect = screen.getByDisplayValue('All Status') as HTMLSelectElement
    expect(statusSelect).toBeInTheDocument()

    fireEvent.change(statusSelect, { target: { value: 'true' } })
    expect(statusSelect.value).toBe('true')
  })

  // ── Criteria type filter ──

  it('criteria type filter changes', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderPage()
    const typeSelect = screen.getByDisplayValue('All Types') as HTMLSelectElement
    expect(typeSelect).toBeInTheDocument()

    fireEvent.change(typeSelect, { target: { value: 'session_count' } })
    expect(typeSelect.value).toBe('session_count')
  })

  // ── Sort dropdown ──

  it('sort dropdown works', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderPage()
    const sortSelect = screen.getByDisplayValue('Sort Order ↑') as HTMLSelectElement
    expect(sortSelect).toBeInTheDocument()

    fireEvent.change(sortSelect, { target: { value: 'name:desc' } })
    expect(sortSelect.value).toBe('name:desc')
  })

  // ── Pagination ──

  it('shows pagination when multiple pages', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderPage()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('does not show pagination for single page', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: {
        data: mockAchievements,
        meta: { current_page: 1, last_page: 1, per_page: 20, total: 2 },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderPage()
    expect(screen.queryByText('2')).not.toBeInTheDocument()
  })

  // ── Create modal ──

  it('opens create modal', () => {
    const mockMutate = vi.fn()
    vi.mocked(useCreateAchievement).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any)
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderPage()
    fireEvent.click(screen.getByText('createButton'))
    expect(screen.getByText('createTitle')).toBeInTheDocument()
    expect(screen.getByText('slug')).toBeInTheDocument()
    expect(screen.getByText('name')).toBeInTheDocument()
  })

  // ── Edit modal ──

  it('opens edit modal with existing values', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderPage()
    const editButtons = screen.getAllByText('edit')
    fireEvent.click(editButtons[0])
    expect(screen.getByText('editTitle')).toBeInTheDocument()
  })

  // ── Status toggle ──

  it('calls toggle mutation on status button click', () => {
    const mockToggle = vi.fn()
    vi.mocked(useToggleAchievementStatus).mockReturnValue({
      mutate: mockToggle,
      isPending: false,
    } as any)
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderPage()
    const buttons = screen.getAllByRole('button')
    const editBtns = screen.getAllByText('edit')
    const firstEditBtn = editBtns[0].closest('button')!
    const editIdx = buttons.indexOf(firstEditBtn)
    const toggleBtn = buttons[editIdx - 1]
    fireEvent.click(toggleBtn)

    expect(mockToggle).toHaveBeenCalledWith(1)
  })

  // ── Create mutation ──

  it('calls create achievement mutation on save', async () => {
    const mockMutate = vi.fn()
    vi.mocked(useCreateAchievement).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any)
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderPage()
    fireEvent.click(screen.getByText('createButton'))

    const slugInput = screen.getByPlaceholderText('first-session')
    const nameInput = screen.getByPlaceholderText('First Session')

    fireEvent.change(slugInput, { target: { value: 'new-ach' } })
    fireEvent.change(nameInput, { target: { value: 'New Achievement' } })

    fireEvent.click(screen.getByText('save'))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled()
    })
  })

  // ── Save disabled when slug/name empty ──

  it('save button is disabled when slug or name empty', () => {
    vi.mocked(useCreateAchievement).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 } },
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderPage()
    fireEvent.click(screen.getByText('createButton'))

    const saveButton = screen.getByText('save').closest('button')
    expect(saveButton).toBeDisabled()
  })

  // ── Sport select shown for sport-dependent criteria types ──

  it('shows sport select for session_count criteria', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 } },
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderPage()
    fireEvent.click(screen.getByText('createButton'))
    expect(screen.getByText('noSport')).toBeInTheDocument()
  })

  // ── Cancel button closes modal ──

  it('cancel button closes create modal', () => {
    vi.mocked(useCreateAchievement).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any)
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 } },
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderPage()
    fireEvent.click(screen.getByText('createButton'))
    expect(screen.getByText('createTitle')).toBeInTheDocument()

    fireEvent.click(screen.getByText('cancel'))
    expect(screen.queryByText('createTitle')).not.toBeInTheDocument()
  })

  // ── Create button opens modal ──

  it('create button is visible', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderPage()
    expect(screen.getByText('createButton')).toBeInTheDocument()
  })

  // ── Correct number of rows rendered ──

  it('renders correct number of achievement rows', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    renderPage()
    expect(screen.getByText('First Session')).toBeInTheDocument()
    expect(screen.getByText('Level 10')).toBeInTheDocument()
  })

  // ── Grant button renders ──

  it('shows grant button for each achievement', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any)
    vi.mocked(useGrantAchievement).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      data: undefined,
    } as any)

    renderPage()
    const grantButtons = screen.getAllByText('grantButton')
    expect(grantButtons).toHaveLength(2)
  })

  // ── Grant dialog opens on click ──

  it('opens grant dialog on grant button click', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any)
    vi.mocked(useGrantAchievement).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      data: undefined,
    } as any)

    renderPage()
    fireEvent.click(screen.getAllByText('grantButton')[0])
    expect(screen.getByText('grantTitle')).toBeInTheDocument()
    expect(screen.getByText('grantDescription')).toBeInTheDocument()
  })

  // ── Grant confirm step after athlete ID entered ──

  it('shows confirm step after entering athlete id', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any)
    vi.mocked(useGrantAchievement).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      data: undefined,
    } as any)

    renderPage()
    fireEvent.click(screen.getAllByText('grantButton')[0])
    const input = screen.getByLabelText('athleteIdLabel') as HTMLInputElement
    fireEvent.change(input, { target: { value: '42' } })
    fireEvent.click(screen.getByText('grantNext'))
    expect(screen.getByText('grantConfirmWarning')).toBeInTheDocument()
    expect(screen.getByText('grantConfirm')).toBeInTheDocument()
  })

  // ── Grant mutation called on confirm ──

  it('calls grant mutation on confirm', () => {
    const mockMutate = vi.fn()
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any)
    vi.mocked(useGrantAchievement).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
      data: undefined,
    } as any)

    renderPage()
    fireEvent.click(screen.getAllByText('grantButton')[0])
    const input = screen.getByLabelText('athleteIdLabel') as HTMLInputElement
    fireEvent.change(input, { target: { value: '42' } })
    fireEvent.click(screen.getByText('grantNext'))
    fireEvent.click(screen.getByText('grantConfirm'))

    expect(mockMutate).toHaveBeenCalledWith({ achievementId: 1, athleteId: 42 })
  })

  // ── Grant success state ──

  it('shows success message after grant', () => {
    vi.mocked(useAdminAchievements).mockReturnValue({
      data: paginatedResponse,
      isLoading: false,
      isError: false,
      error: null,
    } as any)
    vi.mocked(useGrantAchievement).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      data: { status: 'awarded' } as any,
    } as any)

    renderPage()
    fireEvent.click(screen.getAllByText('grantButton')[0])
    const input = screen.getByLabelText('athleteIdLabel') as HTMLInputElement
    fireEvent.change(input, { target: { value: '42' } })
    fireEvent.click(screen.getByText('grantNext'))
    expect(screen.getByText('grantSuccess')).toBeInTheDocument()
  })
})
