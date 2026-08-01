import { useQuery } from '@tanstack/react-query'
import { progressionService } from '@/services/progression.service'
import { getApiError } from '@/lib/api'

export function useAthleteProgression() {
  return useQuery({
    queryKey: ['athlete', 'progression'],
    queryFn: () => progressionService.getAthleteProgression(),
  })
}
