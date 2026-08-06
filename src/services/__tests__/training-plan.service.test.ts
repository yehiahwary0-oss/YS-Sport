import { describe, it, expect, vi, beforeEach } from 'vitest'
import { trainingPlanService } from '../training-plan.service'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn() },
}))

const { api } = await import('@/lib/api')

const template = { uuid: 't1', name: 'Beginner Plan' }

describe('trainingPlanService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getTemplates passes filters and unwraps', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [template] } })

    await expect(
      trainingPlanService.getTemplates({ sport_id: 1, level: 'beginner', goal: 'fitness', limit: 5 })
    ).resolves.toEqual([template])
    expect(api.get).toHaveBeenCalledWith('/training-plans/templates', {
      params: { sport_id: 1, level: 'beginner', goal: 'fitness', limit: 5 },
    })
  })

  it('getTemplates defaults to empty filters', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [] } })
    await trainingPlanService.getTemplates()
    expect(api.get).toHaveBeenCalledWith('/training-plans/templates', { params: {} })
  })

  it('getTemplate unwraps by uuid', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: template } })
    await expect(trainingPlanService.getTemplate('t1')).resolves.toEqual(template)
    expect(api.get).toHaveBeenCalledWith('/training-plans/templates/t1')
  })

  it('rejects on error', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('down'))
    await expect(trainingPlanService.getTemplates()).rejects.toThrow('down')
  })
})
