import { describe, it, expect, vi, beforeEach } from 'vitest'
import { adminService } from '../admin.service'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
  },
}))

const { api } = await import('@/lib/api')

const mockAchievement = {
  id: 1,
  uuid: 'uuid-1',
  slug: 'first-session',
  name: 'First Session',
  description: 'Complete your first session',
  icon: null,
  category: 'milestone',
  sport_id: null,
  criteria: { type: 'session_count', operator: 'gte', value: 1 },
  xp_reward: 50,
  sort_order: 0,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
}

describe('adminService.achievements', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listAchievements calls correct endpoint and passes params', async () => {
    const paginated = {
      data: [mockAchievement],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
    }
    vi.mocked(api.get).mockResolvedValue({ data: paginated })

    const result = await adminService.listAchievements({ page: 1, search: 'first', is_active: true })

    expect(api.get).toHaveBeenCalledWith('/admin/achievements', {
      params: { page: 1, search: 'first', is_active: true },
    })
    expect(result).toEqual(paginated)
  })

  it('getAchievement calls correct endpoint', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: mockAchievement } })

    const result = await adminService.getAchievement(1)

    expect(api.get).toHaveBeenCalledWith('/admin/achievements/1')
    expect(result).toEqual(mockAchievement)
  })

  it('createAchievement sends correct payload', async () => {
    const payload = {
      slug: 'test',
      name: 'Test',
      criteria_type: 'session_count',
      criteria: { operator: 'gte', value: 5 },
    }
    vi.mocked(api.post).mockResolvedValue({ data: { data: mockAchievement } })

    const result = await adminService.createAchievement(payload)

    expect(api.post).toHaveBeenCalledWith('/admin/achievements', payload)
    expect(result).toEqual(mockAchievement)
  })

  it('updateAchievement sends correct payload', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: mockAchievement } })

    const result = await adminService.updateAchievement(1, { name: 'Updated' })

    expect(api.put).toHaveBeenCalledWith('/admin/achievements/1', { name: 'Updated' })
    expect(result).toEqual(mockAchievement)
  })

  it('toggleAchievementStatus uses patch method', async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: { data: mockAchievement } })

    const result = await adminService.toggleAchievementStatus(1)

    expect(api.patch).toHaveBeenCalledWith('/admin/achievements/1/status')
    expect(result).toEqual(mockAchievement)
  })
})
