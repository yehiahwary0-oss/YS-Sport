import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { profileService } from '@/services/profile.service'
import { getApiError } from '@/lib/api'
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics'

// ── Athlete ────────────────────────────────────────────────────

export function useAthleteProfile() {
  return useQuery({
    queryKey: ['athlete', 'profile'],
    queryFn: () => profileService.getAthleteProfile(),
  })
}

export function useUpdateAthleteProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: profileService.updateAthleteProfile,
    onSuccess: () => {
      toast.success('Profile updated.')
      queryClient.invalidateQueries({ queryKey: ['athlete', 'profile'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useUploadAthleteAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: profileService.uploadAthleteAvatar,
    onSuccess: () => {
      toast.success('Avatar updated.')
      queryClient.invalidateQueries({ queryKey: ['athlete', 'profile'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

// ── Coach ──────────────────────────────────────────────────────

export function useCoachProfileSelf() {
  return useQuery({
    queryKey: ['coach', 'profile'],
    queryFn: () => profileService.getCoachProfile(),
  })
}

export function useUpdateCoachProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: profileService.updateCoachProfile,
    onSuccess: () => {
      toast.success('Profile updated.')
      queryClient.invalidateQueries({ queryKey: ['coach', 'profile'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useSyncCoachSports() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: profileService.syncCoachSports,
    onSuccess: () => {
      toast.success('Sports updated.')
      queryClient.invalidateQueries({ queryKey: ['coach', 'profile'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useUploadCoachAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: profileService.uploadCoachAvatar,
    onSuccess: () => {
      toast.success('Avatar updated.')
      queryClient.invalidateQueries({ queryKey: ['coach', 'profile'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useUploadCoachCertificate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: profileService.uploadCoachCertificate,
    onSuccess: () => {
      trackEvent(ANALYTICS_EVENTS.coachVerificationSubmitted)
      toast.success('Certificate uploaded.')
      queryClient.invalidateQueries({ queryKey: ['coach', 'profile'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}
