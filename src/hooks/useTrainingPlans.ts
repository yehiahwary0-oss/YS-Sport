import { useQuery } from '@tanstack/react-query'
import { trainingPlanService, type TrainingPlanFilters } from '@/services/training-plan.service'

export function useTrainingTemplates(filters: TrainingPlanFilters, enabled = true) {
  return useQuery({
    queryKey: ['training-plans', 'templates', filters],
    queryFn: () => trainingPlanService.getTemplates(filters),
    enabled,
    staleTime: 60 * 60 * 1000,
  })
}

export function useTrainingTemplate(uuid: string | undefined) {
  return useQuery({
    queryKey: ['training-plans', 'templates', uuid],
    queryFn: () => trainingPlanService.getTemplate(uuid!),
    enabled: !!uuid,
    staleTime: 60 * 60 * 1000,
  })
}
