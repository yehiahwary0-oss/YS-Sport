import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useAthleteProfile,
  useUpdateAthleteProfile,
  useUploadAthleteAvatar,
  useCoachProfileSelf,
  useUpdateCoachProfile,
  useSyncCoachSports,
  useUploadCoachAvatar,
  useUploadCoachCertificate,
} from '../useProfile'

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/services/profile.service', () => ({
  profileService: {
    getAthleteProfile: vi.fn(),
    updateAthleteProfile: vi.fn(),
    uploadAthleteAvatar: vi.fn(),
    getCoachProfile: vi.fn(),
    updateCoachProfile: vi.fn(),
    syncCoachSports: vi.fn(),
    uploadCoachAvatar: vi.fn(),
    uploadCoachCertificate: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  getApiError: vi.fn((e: unknown) => (e as Error).message),
}))

vi.mock('@/lib/analytics', () => ({
  ANALYTICS_EVENTS: { coachVerificationSubmitted: 'coach_verification_submitted' },
  trackEvent: vi.fn(),
}))

const { profileService } = await import('@/services/profile.service')
const toast = (await import('react-hot-toast')).default
const { trackEvent } = await import('@/lib/analytics')

const profile = { uuid: 'u1', display_name: 'Test' }

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('profile hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useAthleteProfile fetches the athlete profile', async () => {
    vi.mocked(profileService.getAthleteProfile).mockResolvedValue(profile as never)
    const { result } = renderHook(() => useAthleteProfile(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(profile)
  })

  it('useUpdateAthleteProfile updates and toasts', async () => {
    vi.mocked(profileService.updateAthleteProfile).mockResolvedValue(profile as never)
    const { result } = renderHook(() => useUpdateAthleteProfile(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ display_name: 'New' } as never)
    })
    expect(profileService.updateAthleteProfile).toHaveBeenCalledWith({ display_name: 'New' }, expect.anything())
    expect(toast.success).toHaveBeenCalledWith('Profile updated.')
  })

  it('useUploadAthleteAvatar uploads and toasts', async () => {
    vi.mocked(profileService.uploadAthleteAvatar).mockResolvedValue({ avatar_path: '/a.png' } as never)
    const { result } = renderHook(() => useUploadAthleteAvatar(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate(new FormData() as never)
    })
    expect(profileService.uploadAthleteAvatar).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Avatar updated.')
  })

  it('useCoachProfileSelf fetches the coach profile', async () => {
    vi.mocked(profileService.getCoachProfile).mockResolvedValue(profile as never)
    const { result } = renderHook(() => useCoachProfileSelf(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(profile)
  })

  it('useUpdateCoachProfile updates and toasts', async () => {
    vi.mocked(profileService.updateCoachProfile).mockResolvedValue(profile as never)
    const { result } = renderHook(() => useUpdateCoachProfile(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ bio: 'x' } as never)
    })
    expect(toast.success).toHaveBeenCalledWith('Profile updated.')
  })

  it('useSyncCoachSports syncs and toasts', async () => {
    vi.mocked(profileService.syncCoachSports).mockResolvedValue(profile as never)
    const { result } = renderHook(() => useSyncCoachSports(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate([1, 2] as never)
    })
    expect(toast.success).toHaveBeenCalledWith('Sports updated.')
  })

  it('useUploadCoachAvatar uploads and toasts', async () => {
    vi.mocked(profileService.uploadCoachAvatar).mockResolvedValue({ avatar_path: '/c.png' } as never)
    const { result } = renderHook(() => useUploadCoachAvatar(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate(new FormData() as never)
    })
    expect(toast.success).toHaveBeenCalledWith('Avatar updated.')
  })

  it('useUploadCoachCertificate uploads, tracks analytics and toasts', async () => {
    vi.mocked(profileService.uploadCoachCertificate).mockResolvedValue({ certificate_path: '/c.pdf' } as never)
    const { result } = renderHook(() => useUploadCoachCertificate(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate(new FormData() as never)
    })
    expect(trackEvent).toHaveBeenCalledWith('coach_verification_submitted')
    expect(toast.success).toHaveBeenCalledWith('Certificate uploaded.')
  })

  it('toasts the error message on failure', async () => {
    vi.mocked(profileService.updateCoachProfile).mockRejectedValue(new Error('validation'))
    const { result } = renderHook(() => useUpdateCoachProfile(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({} as never)
    })
    expect(toast.error).toHaveBeenCalledWith('validation')
  })
})
