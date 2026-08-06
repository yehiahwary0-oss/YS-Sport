import { describe, it, expect, vi, beforeEach } from 'vitest'
import { profileService } from '../profile.service'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), put: vi.fn(), post: vi.fn() },
}))

const { api } = await import('@/lib/api')

const coach = { uuid: 'c1', display_name: 'Hassan' }
const athlete = { uuid: 'a1', display_name: 'Ali' }

describe('profileService — coach', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getCoachProfile unwraps', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: coach } })
    await expect(profileService.getCoachProfile()).resolves.toEqual(coach)
    expect(api.get).toHaveBeenCalledWith('/coach/profile')
  })

  it('updateCoachProfile PUTs the payload', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: coach } })
    await profileService.updateCoachProfile({ bio: 'Hello' })
    expect(api.put).toHaveBeenCalledWith('/coach/profile', { bio: 'Hello' })
  })

  it('syncCoachSports PUTs sport ids', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: coach } })
    await profileService.syncCoachSports([1, 2])
    expect(api.put).toHaveBeenCalledWith('/coach/profile/sports', { sport_ids: [1, 2] })
  })

  it('uploadCoachAvatar POSTs multipart form data', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { avatar_path: '/a.png' } })
    const file = new File(['x'], 'a.png', { type: 'image/png' })

    await expect(profileService.uploadCoachAvatar(file)).resolves.toEqual({ avatar_path: '/a.png' })

    const [url, formData, config] = vi.mocked(api.post).mock.calls[0] as unknown as [string, FormData, { headers: Record<string, string> }]
    expect(url).toBe('/coach/profile/avatar')
    expect(formData.get('avatar')).toBe(file)
    expect(config.headers['Content-Type']).toBe('multipart/form-data')
  })

  it('uploadCoachCertificate POSTs the certificate field', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { certificate_path: '/c.pdf' } })
    const file = new File(['%PDF'], 'c.pdf', { type: 'application/pdf' })

    await expect(profileService.uploadCoachCertificate(file)).resolves.toEqual({ certificate_path: '/c.pdf' })

    const [, formData] = vi.mocked(api.post).mock.calls[0] as unknown as [string, FormData]
    expect(formData.get('certificate')).toBe(file)
  })
})

describe('profileService — athlete', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getAthleteProfile unwraps', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: athlete } })
    await expect(profileService.getAthleteProfile()).resolves.toEqual(athlete)
    expect(api.get).toHaveBeenCalledWith('/athlete/profile')
  })

  it('updateAthleteProfile PUTs the payload', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: athlete } })
    await profileService.updateAthleteProfile({ fitness_level: 'intermediate' })
    expect(api.put).toHaveBeenCalledWith('/athlete/profile', { fitness_level: 'intermediate' })
  })

  it('syncAthleteSports PUTs sport ids', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: athlete } })
    await profileService.syncAthleteSports([3])
    expect(api.put).toHaveBeenCalledWith('/athlete/profile/sports', { sport_ids: [3] })
  })

  it('uploadAthleteAvatar POSTs the avatar field', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { avatar_path: '/b.png' } })
    const file = new File(['y'], 'b.png', { type: 'image/png' })

    await profileService.uploadAthleteAvatar(file)

    const [url, formData] = vi.mocked(api.post).mock.calls[0] as unknown as [string, FormData]
    expect(url).toBe('/athlete/profile/avatar')
    expect(formData.get('avatar')).toBe(file)
  })

  it('propagates errors', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('net'))
    await expect(profileService.getAthleteProfile()).rejects.toThrow('net')
  })
})
