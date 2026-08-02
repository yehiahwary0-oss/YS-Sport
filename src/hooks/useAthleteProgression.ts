import { useQuery } from '@tanstack/react-query'
import { progressionService } from '@/services/progression.service'

export function useAthleteProgression() {
  return useQuery({
    queryKey: ['athlete', 'progression'],
    queryFn: () => progressionService.getAthleteProgression(),
  })
}

// Enriches the hero section with bio/joined_at that the logged-in
// athlete endpoint does not return. Non-critical: failures fall back to
// a header without those details, so the request is not retried.
export function usePublicAthleteProgression(uuid: string | undefined) {
  return useQuery({
    queryKey: ['athlete', 'progression', 'public', uuid],
    queryFn: () => progressionService.getPublicAthleteProgression(uuid!),
    enabled: !!uuid,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
