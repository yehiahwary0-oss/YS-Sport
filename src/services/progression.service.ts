import { api } from '@/lib/api'
import type { ProgressionResponse, PublicProgressionResponse } from '@/types'

export const progressionService = {
  async getAthleteProgression(): Promise<ProgressionResponse> {
    const { data } = await api.get('/athlete/progression')
    return data as ProgressionResponse
  },

  async getPublicAthleteProgression(uuid: string): Promise<PublicProgressionResponse> {
    const { data } = await api.get(`/athletes/${uuid}/progression`)
    return data as PublicProgressionResponse
  },
}
