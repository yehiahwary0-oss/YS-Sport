import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AchievementSection, AchievementSectionSkeleton } from '../AchievementSection'

const baseAchievement = {
  uuid: 'ach-1',
  slug: 'first_session',
  name: 'First Session',
  description: 'Completed your first session',
  icon: null,
  category: 'milestone' as const,
  sport_id: null,
  earned_at: '2026-01-01T00:00:00Z',
}

describe('AchievementSection', () => {
  it('should render a list of achievements', () => {
    const achievements = [
      baseAchievement,
      { ...baseAchievement, uuid: 'ach-2', slug: 'second_session', name: 'Second Session' },
    ]

    render(<AchievementSection achievements={achievements} />)

    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('First Session')).toBeInTheDocument()
    expect(screen.getByText('Second Session')).toBeInTheDocument()
  })

  it('should render achievement description when present', () => {
    render(<AchievementSection achievements={[baseAchievement]} />)

    expect(screen.getByText('Completed your first session')).toBeInTheDocument()
  })

  it('should show empty state when there are no achievements', () => {
    render(<AchievementSection achievements={[]} />)

    expect(screen.getByText('noAchievements')).toBeInTheDocument()
  })

  it('should display sport context when achievement has sport_id', () => {
    render(<AchievementSection achievements={[{ ...baseAchievement, sport_id: 1 }]} />)

    expect(screen.getByText('progression.sports')).toBeInTheDocument()
  })

  it('should fall back to API name when no translation key exists', () => {
    const unknownAch = {
      ...baseAchievement,
      slug: 'unknown_slug',
      name: 'API Fallback Name',
      description: 'API description',
    }

    render(<AchievementSection achievements={[unknownAch]} />)

    expect(screen.getByText('API Fallback Name')).toBeInTheDocument()
    expect(screen.getByText('API description')).toBeInTheDocument()
  })
})

describe('AchievementSectionSkeleton', () => {
  it('should render skeleton elements', () => {
    const { container } = render(<AchievementSectionSkeleton />)

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
})
