import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TrainingPlanGenerator } from '../TrainingPlanGenerator'

const sports = [
  { id: 1, name: 'Football', slug: 'football', icon: 'soccer' },
  { id: 2, name: 'Swimming', slug: 'swimming', icon: 'swim' },
]

const template = {
  uuid: 'plan-1',
  sport: { id: 1, name: 'Football', slug: 'football' },
  level: 'intermediate' as const,
  goal: 'fitness' as const,
  title: { en: 'Football Fitness Plan', ar: 'خطة لياقة كرة القدم' },
  description: { en: 'A balanced 4-week plan.', ar: 'خطة متوازنة لأربعة أسابيع.' },
  duration_weeks: 4,
  sessions_per_week: 3,
  plan_structure: [
    {
      week: 1,
      focus: 'Basics',
      sessions: [
        { day: 'Monday', type: 'Technical Skills', duration: '60 min', intensity: 'Moderate' as const },
      ],
    },
  ],
  match_type: 'exact' as const,
  match_score: 100,
  is_active: true,
}

vi.mock('@/hooks/useMarketplace', () => ({
  useSports: vi.fn(),
}))

vi.mock('@/hooks/useTrainingPlans', () => ({
  useTrainingTemplates: vi.fn(),
}))

const { useSports } = await import('@/hooks/useMarketplace')
const { useTrainingTemplates } = await import('@/hooks/useTrainingPlans')

function renderGenerator() {
  return render(<TrainingPlanGenerator />)
}

describe('TrainingPlanGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSports).mockReturnValue({ data: sports, isLoading: false })
    vi.mocked(useTrainingTemplates).mockReturnValue({
      data: [template],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
  })

  it('should show spinner while sports are loading', () => {
    vi.mocked(useSports).mockReturnValue({ data: undefined, isLoading: true })
    renderGenerator()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should render the generator with sports, levels and goals', () => {
    renderGenerator()
    expect(screen.getByText('Football')).toBeInTheDocument()
    expect(screen.getByText('Swimming')).toBeInTheDocument()
    expect(screen.getByText('trainingPlans.levels.beginner')).toBeInTheDocument()
    expect(screen.getByText('trainingPlans.goals.fitness')).toBeInTheDocument()
  })

  it('should fetch templates with chosen filters and render the plan card', () => {
    renderGenerator()

    fireEvent.click(screen.getByText('Football'))
    fireEvent.click(screen.getByText('trainingPlans.levels.intermediate'))
    fireEvent.click(screen.getByText('trainingPlans.goals.fitness'))

    expect(useTrainingTemplates).toHaveBeenCalledWith(
      { sport_id: 1, level: 'intermediate', goal: 'fitness', limit: 5 },
      true,
    )
    expect(screen.getByText('Football Fitness Plan')).toBeInTheDocument()
    expect(screen.getByText('trainingPlans.sessionTypes.technicalSkills')).toBeInTheDocument()
    expect(screen.getByText('trainingPlans.matchTypes.exact')).toBeInTheDocument()
  })

  it('should not query until all three steps are chosen', () => {
    renderGenerator()
    fireEvent.click(screen.getByText('Football'))
    expect(useTrainingTemplates).toHaveBeenCalledWith(
      { sport_id: 1, level: undefined, goal: undefined, limit: 5 },
      false,
    )
  })

  it('should show error state with retry when fetching fails', () => {
    vi.mocked(useTrainingTemplates).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })

    renderGenerator()
    fireEvent.click(screen.getByText('Football'))
    fireEvent.click(screen.getByText('trainingPlans.levels.intermediate'))
    fireEvent.click(screen.getByText('trainingPlans.goals.fitness'))

    expect(screen.getByText('trainingPlans.error')).toBeInTheDocument()
    expect(screen.getByText('common.retry')).toBeInTheDocument()
  })
})
