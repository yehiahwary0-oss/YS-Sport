import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AthleteTrainingPlansPage from '../page'

vi.mock('@/hooks/useMarketplace', () => ({
  useSports: vi.fn(),
}))

vi.mock('@/hooks/useTrainingPlans', () => ({
  useTrainingTemplates: vi.fn(),
}))

const { useSports } = await import('@/hooks/useMarketplace')
const { useTrainingTemplates } = await import('@/hooks/useTrainingPlans')

describe('AthleteTrainingPlansPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSports).mockReturnValue({
      data: [{ id: 1, name: 'Football', slug: 'football', icon: 'soccer' }],
      isLoading: false,
    })
    vi.mocked(useTrainingTemplates).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
  })

  it('should render the plan generator', () => {
    render(<AthleteTrainingPlansPage />)
    expect(screen.getByText('trainingPlans.generatorTitle')).toBeInTheDocument()
    expect(screen.getByText('Football')).toBeInTheDocument()
  })

  it('should show the selected plan after choosing filters', () => {
    vi.mocked(useTrainingTemplates).mockReturnValue({
      data: [
        {
          uuid: 'plan-1',
          sport: { id: 1, name: 'Football', slug: 'football' },
          level: 'beginner',
          goal: 'fitness',
          title: { en: 'Beginner Football Plan', ar: 'خطة كرة قدم للمبتدئين' },
          description: { en: 'Plan', ar: 'خطة' },
          duration_weeks: 4,
          sessions_per_week: 2,
          plan_structure: [],
          match_type: 'exact',
          match_score: 100,
          is_active: true,
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    render(<AthleteTrainingPlansPage />)
    fireEvent.click(screen.getByText('Football'))
    fireEvent.click(screen.getByText('trainingPlans.levels.beginner'))
    fireEvent.click(screen.getByText('trainingPlans.goals.fitness'))

    expect(screen.getByText('Beginner Football Plan')).toBeInTheDocument()
  })
})
