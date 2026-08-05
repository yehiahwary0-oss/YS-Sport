import { api } from '@/lib/api'
import type { TrainingLevel, TrainingPlanGoal, TrainingPlanTemplate } from '@/types'

export interface TrainingPlanFilters {
  sport_id?: number
  level?: TrainingLevel
  goal?: TrainingPlanGoal
  limit?: number
}

export const trainingPlanService = {
  async getTemplates(filters: TrainingPlanFilters = {}): Promise<TrainingPlanTemplate[]> {
    const { data } = await api.get('/training-plans/templates', { params: filters })
    return data.data as TrainingPlanTemplate[]
  },

  async getTemplate(uuid: string): Promise<TrainingPlanTemplate> {
    const { data } = await api.get(`/training-plans/templates/${uuid}`)
    return data.data as TrainingPlanTemplate
  },
}
