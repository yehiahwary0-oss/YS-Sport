import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { packageService, type PackagePayload } from '@/services/package.service'
import { getApiError } from '@/lib/api'

export function usePackages() {
  return useQuery({
    queryKey: ['coach', 'packages'],
    queryFn: () => packageService.list(),
  })
}

export function useCreatePackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: PackagePayload) => packageService.create(payload),
    onSuccess: () => {
      toast.success('Package created.')
      queryClient.invalidateQueries({ queryKey: ['coach', 'packages'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useUpdatePackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, payload }: { uuid: string; payload: Partial<PackagePayload> }) =>
      packageService.update(uuid, payload),
    onSuccess: () => {
      toast.success('Package updated.')
      queryClient.invalidateQueries({ queryKey: ['coach', 'packages'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useTogglePackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => packageService.toggle(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach', 'packages'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useDeletePackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => packageService.remove(uuid),
    onSuccess: () => {
      toast.success('Package removed.')
      queryClient.invalidateQueries({ queryKey: ['coach', 'packages'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}
