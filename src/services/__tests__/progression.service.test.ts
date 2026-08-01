import { describe, it, expect, vi, beforeEach } from 'vitest'
import { progressionService } from '../progression.service'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

const { api } = await import('@/lib/api')
const mockProgression = {
  data: {
    athlete: {
      uuid: 'athlete-1',
      display_name: 'John Doe',
      avatar_url: 'https://example.com/avatar.jpg',
    },
    summary: { total_xp: 1500, total_sports: 3, primary_sport_id: 1 },
    sports: [
      {
        sport: { id: 1, name: 'Football', slug: 'football' },
        xp: 500,
        level: 5,
        tier: 'gold',
        xp_to_next_level: 200,
        is_primary: true,
      },
    ],
    achievements: [
      {
        uuid: 'ach-1',
        slug: 'first_session',
        name: 'First Session',
        description: 'Completed your first session',
        icon: null,
        category: 'milestone',
        sport_id: null,
        earned_at: '2026-01-01T00:00:00Z',
      },
    ],
  },
}

describe('progressionService.getAthleteProgression', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return progression data on success', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockProgression })

    const result = await progressionService.getAthleteProgression()

    expect(api.get).toHaveBeenCalledWith('/athlete/progression')
    expect(result).toEqual(mockProgression)
  })

  it('should throw on API error', async () => {
    const error = new Error('Network error')
    vi.mocked(api.get).mockRejectedValue(error)

    await expect(progressionService.getAthleteProgression()).rejects.toThrow('Network error')
  })

  it('should call the correct endpoint', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockProgression })

    await progressionService.getAthleteProgression()

    expect(api.get).toHaveBeenCalledWith('/athlete/progression')
  })
})
