import { api } from '@/lib/api'
import type { CoachProfile, AthleteProfile } from '@/types'

export const profileService = {

  // Coach
  async getCoachProfile(): Promise<CoachProfile> {
    const { data } = await api.get('/coach/profile')
    return data.data as CoachProfile
  },

  async updateCoachProfile(payload: Partial<{
    display_name: string
    bio: string
    years_experience: number
    location_city: string
    location_country: string
    is_accepting_clients: boolean
  }>): Promise<CoachProfile> {
    const { data } = await api.put('/coach/profile', payload)
    return data.data as CoachProfile
  },

  async syncCoachSports(sportIds: number[]): Promise<CoachProfile> {
    const { data } = await api.put('/coach/profile/sports', { sport_ids: sportIds })
    return data.data as CoachProfile
  },

  async uploadCoachAvatar(file: File): Promise<{ avatar_path: string }> {
    const formData = new FormData()
    formData.append('avatar', file)
    const { data } = await api.post('/coach/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data as { avatar_path: string }
  },

  async uploadCoachCertificate(file: File): Promise<{ certificate_path: string }> {
    const formData = new FormData()
    formData.append('certificate', file)
    const { data } = await api.post('/coach/profile/certificate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data as { certificate_path: string }
  },

  // Athlete
  async getAthleteProfile(): Promise<AthleteProfile> {
    const { data } = await api.get('/athlete/profile')
    return data.data as AthleteProfile
  },

  async updateAthleteProfile(payload: Partial<{
    display_name: string
    bio: string
    fitness_level: string
    goals: string
    date_of_birth: string
  }>): Promise<AthleteProfile> {
    const { data } = await api.put('/athlete/profile', payload)
    return data.data as AthleteProfile
  },

  async syncAthleteSports(sportIds: number[]): Promise<AthleteProfile> {
    const { data } = await api.put('/athlete/profile/sports', { sport_ids: sportIds })
    return data.data as AthleteProfile
  },

  async uploadAthleteAvatar(file: File): Promise<{ avatar_path: string }> {
    const formData = new FormData()
    formData.append('avatar', file)
    const { data } = await api.post('/athlete/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data as { avatar_path: string }
  },
}
