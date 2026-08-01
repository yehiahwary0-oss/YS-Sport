'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Camera, BadgeCheck, Clock, Eye, EyeOff, FileText, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { useCoachProfileSelf, useUpdateCoachProfile, useUploadCoachAvatar, useUploadCoachCertificate, useSyncCoachSports } from '@/hooks/useProfile'
import { authService } from '@/services/auth.service'
import { getApiError } from '@/lib/api'
import { useSports } from '@/hooks/useMarketplace'
import { cn } from '@/lib/utils'

export default function CoachProfilePage() {
  const t = useTranslations('coach.profile')
  const tv = useTranslations('validation')
  const ta = useTranslations('auth')
  const tc = useTranslations('common')
  const { data: profile, isLoading, isError } = useCoachProfileSelf()
  const { data: allSports } = useSports()
  const updateProfile = useUpdateCoachProfile()
  const uploadAvatar = useUploadCoachAvatar()
  const uploadCertificate = useUploadCoachCertificate()
  const syncSports = useSyncCoachSports()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const certInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    years_experience: 0,
    location_city: '',
    location_country: '',
  })
  const [selectedSports, setSelectedSports] = useState<number[]>([])

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' })
  const [showPw, setShowPw] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name ?? '',
        bio: profile.bio ?? '',
        years_experience: profile.years_experience ?? 0,
        location_city: profile.location_city ?? '',
        location_country: profile.location_country ?? '',
      })
      setSelectedSports(profile.sports?.map((s) => s.id) ?? [])
    }
  }, [profile])

  if (isLoading) return <FullPageSpinner />
  if (isError) return <ErrorState onRetry={() => window.location.reload()} />
  if (!profile) return null

  const statusLabels: Record<string, { label: string; className: string }> = {
    verified:   { label: t('verified'), className: 'text-green-400 bg-green-500/10' },
    pending:    { label: t('pendingVerification'), className: 'text-amber-400 bg-amber-400/10' },
    unverified: { label: t('unverified'), className: 'text-zinc-400 bg-zinc-400/10' },
    rejected:   { label: t('rejected'), className: 'text-red-400 bg-red-400/10' },
  }
  const status = statusLabels[profile.verification_status]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate(form)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadAvatar.mutate(file)
  }

  const toggleSport = (sportId: number) => {
    const updated = selectedSports.includes(sportId)
      ? selectedSports.filter((id) => id !== sportId)
      : [...selectedSports, sportId]
    setSelectedSports(updated)
    syncSports.mutate(updated)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Avatar + verification status */}
      <div className="card flex items-center gap-5 p-6">
        <div className="relative">
          <Avatar src={profile.avatar_path} name={profile.display_name} size="xl" ringStatus={profile.verification_status === 'verified' ? 'verified' : null} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-navy-900"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div className="flex-1">
          <h2 className="font-display text-lg font-semibold text-zinc-100">{profile.display_name}</h2>
          <span className={cn('mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', status.className)}>
            {profile.verification_status === 'verified' && <BadgeCheck className="h-3 w-3" />}
            {profile.verification_status === 'pending' && <Clock className="h-3 w-3" />}
            {status.label}
          </span>
        </div>
      </div>

      {/* Profile completion */}
      {profile.profile_completion < 100 && (
        <div className="card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">{t('profileCompletion')}</span>
            <span className="font-medium text-zinc-200">{profile.profile_completion}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy-700">
            <div className="h-full rounded-full bg-green-500" style={{ width: `${profile.profile_completion}%` }} />
          </div>
        </div>
      )}

      {/* Sports */}
      <div className="card p-6">
        <h3 className="mb-3 font-display text-sm font-semibold text-zinc-200">{t('sportsYouCoach')}</h3>
        <div className="flex flex-wrap gap-2">
          {allSports?.map((sport) => (
            <button
              key={sport.id}
              onClick={() => toggleSport(sport.id)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                selectedSports.includes(sport.id)
                  ? 'bg-green-500 text-navy-900'
                  : 'bg-navy-700 text-zinc-400 hover:bg-navy-600'
              )}
            >
              {sport.name}
            </button>
          ))}
        </div>
      </div>

      {/* Certificate upload */}
      <div className="card p-6">
        <h3 className="mb-3 font-display text-sm font-semibold text-zinc-200">{t('certificateSection')}</h3>
        <p className="mb-4 text-xs text-zinc-500">{t('certificateDesc')}</p>

        {profile.certificate_path && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-navy-700 px-3 py-2 text-sm text-zinc-300">
            <FileText className="h-4 w-4 text-green-400" />
            <span className="flex-1">{t('certificateUploaded')}</span>
          </div>
        )}

        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-navy-500 px-4 py-3 text-sm text-zinc-400 transition-colors hover:border-green-500 hover:text-green-400">
          <Upload className="h-4 w-4" />
          {profile.certificate_path ? t('replaceCertificate') : t('uploadCertificate')}
          <input
            ref={certInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={uploadCertificate.isPending}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadCertificate.mutate(file)
              e.target.value = ''
            }}
          />
        </label>
        {uploadCertificate.isPending && <p className="mt-2 text-xs text-zinc-500">{t('uploading')}</p>}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <Input
          label={t('displayName')}
          value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
        />

        <Textarea
          label={t('bio')}
          placeholder={t('bioPlaceholder')}
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />

        <Input
          label={t('yearsExperience')}
          type="number"
          min={0}
          max={50}
          value={form.years_experience}
          onChange={(e) => setForm({ ...form, years_experience: Number(e.target.value) })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('city')}
            value={form.location_city}
            onChange={(e) => setForm({ ...form, location_city: e.target.value })}
          />
          <Input
            label={t('countryCode')}
            placeholder={t('countryCodePlaceholder')}
            maxLength={2}
            value={form.location_country}
            onChange={(e) => setForm({ ...form, location_country: e.target.value.toUpperCase() })}
          />
        </div>

        <Button type="submit" isLoading={updateProfile.isPending}>
          {t('saveChanges')}
        </Button>
      </form>

      {/* Change password */}
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          if (pwForm.new_password !== pwForm.new_password_confirmation) {
            toast.error(tv('passwordMatch'))
            return
          }
          setChangingPassword(true)
          try {
            await authService.changePassword(pwForm)
            toast.success(t('passwordChanged'))
            setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' })
          } catch (err) {
            toast.error(getApiError(err))
          } finally {
            setChangingPassword(false)
          }
        }}
        className="card space-y-4 p-6"
      >
        <h3 className="font-display text-sm font-semibold text-zinc-200">{t('changePassword')}</h3>

        <div className="relative">
          <Input
            label={ta('currentPasswordLabel')}
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            value={pwForm.current_password}
            onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-[34px] text-zinc-500 hover:text-zinc-300"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Input
          label={ta('newPasswordLabel')}
          type="password"
          placeholder="••••••••"
          value={pwForm.new_password}
          onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
        />

        <Input
          label={t('confirmNewPassword')}
          type="password"
          placeholder="••••••••"
          value={pwForm.new_password_confirmation}
          onChange={(e) => setPwForm({ ...pwForm, new_password_confirmation: e.target.value })}
        />

        <Button type="submit" variant="secondary" isLoading={changingPassword}>
          {t('updatePassword')}
        </Button>
      </form>
    </div>
  )
}
