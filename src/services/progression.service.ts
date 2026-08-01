import { api } from '@/lib/api'
import type { ProgressionResponse } from '@/types'

export const progressionService = {
  async getAthleteProgression(): Promise<ProgressionResponse> {
    const { data } = await api.get('/athlete/progression')
    return data as ProgressionResponse
  },
}
