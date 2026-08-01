import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AthleteProgressionPage from '../page'

const mockUser = { uuid: 'athlete-1', email: 'john@example.com', display_name: 'John Doe' }

const mockData = {
  data: {
    athlete: { uuid: 'athlete-1', display_name: 'John Doe', avatar_url: null },
    summary: { total_xp: 1500, total_sports: 3, primary_sport_id: 1 },
    sports: [
      {
        sport: { id: 1, name: 'Football', slug: 'football' },
        xp: 500,
        level: 5,
        tier: 'gold' as const,
        xp_to_next_level: 200,
        is_primary: true,
      },
      {
        sport: { id: 2, name: 'Swimming', slug: 'swimming' },
        xp: 300,
        level: 3,
        tier: 'silver' as const,
        xp_to_next_level: 100,
        is_primary: false,
      },
    ],
    achievements: [
      {
        uuid: 'ach-1',
        slug: 'first_session',
        name: 'First Session',
        description: 'Completed your first session',
        icon: null,
        category: 'milestone' as const,
        sport_id: null,
        earned_at: '2026-01-01T00:00:00Z',
      },
    ],
  },
}

vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn((selector: any) => {
    const state = { user: mockUser }
    return selector(state)
  }),
}))

vi.mock('@/hooks/useAthleteProgression', () => ({
  useAthleteProgression: vi.fn(),
}))

const { useAthleteProgression } = await import('@/hooks/useAthleteProgression')

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <AthleteProgressionPage />
    </QueryClientProvider>,
  )
}

describe('AthleteProgressionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state with skeleton', () => {
    vi.mocked(useAthleteProgression).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    renderPage()

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should render athlete name and data when loaded', () => {
    vi.mocked(useAthleteProgression).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    renderPage()

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getAllByText('Football')).toHaveLength(2)
    expect(screen.getByText('Swimming')).toBeInTheDocument()
    expect(screen.getByText('First Session')).toBeInTheDocument()
  })

  it('should show empty sports state when sports array is empty', () => {
    vi.mocked(useAthleteProgression).mockReturnValue({
      data: {
        ...mockData,
        data: {
          ...mockData.data,
          sports: [],
          summary: { total_xp: 0, total_sports: 0, primary_sport_id: null },
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    renderPage()

    expect(screen.getByText('no_sports')).toBeInTheDocument()
    expect(screen.getByText('no_sports_desc')).toBeInTheDocument()
  })

  it('should show empty achievements state when achievements array is empty', () => {
    vi.mocked(useAthleteProgression).mockReturnValue({
      data: {
        ...mockData,
        data: { ...mockData.data, achievements: [] },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    renderPage()

    expect(screen.getByText('noAchievements')).toBeInTheDocument()
  })

  it('should show error state with retry button', () => {
    const refetch = vi.fn()
    vi.mocked(useAthleteProgression).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('API error'),
      refetch,
    })

    renderPage()

    expect(screen.getByText('error')).toBeInTheDocument()
    expect(screen.getByText('retry')).toBeInTheDocument()
  })

  it('should show FullPageSpinner when data is null (not loading, not error)', () => {
    vi.mocked(useAthleteProgression).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    renderPage()

    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })
})
