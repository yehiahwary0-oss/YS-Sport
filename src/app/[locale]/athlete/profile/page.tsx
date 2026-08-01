'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Camera, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { useAthleteProfile, useUpdateAthleteProfile, useUploadAthleteAvatar } from '@/hooks/useProfile'
import { authService } from '@/services/auth.service'
import { getApiError } from '@/lib/api'

export default function AthleteProfilePage() {
  const t = useTranslations('athlete.profile')
  const { data: profile, isLoading, isError } = useAthleteProfile()
  const updateProfile = useUpdateAthleteProfile()
  const uploadAvatar = useUploadAthleteAvatar()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    fitness_level: '',
    goals: '',
  })

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' })
  const [showPw, setShowPw] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name ?? '',
        bio: profile.bio ?? '',
        fitness_level: profile.fitness_level ?? '',
        goals: profile.goals ?? '',
      })
    }
  }, [profile])

  if (isLoading) return <FullPageSpinner />
  if (isError) return <ErrorState onRetry={() => window.location.reload()} />
  if (!profile) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate(form)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadAvatar.mutate(file)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Avatar */}
      <div className="card flex items-center gap-5 p-6">
        <div className="relative">
          <Avatar src={profile.avatar_path} name={profile.display_name} size="xl" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-navy-900"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-zinc-100">{profile.display_name}</h2>
          <p className="text-sm text-zinc-500">{t('subtitle')}</p>
        </div>
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

        <Select
          label={t('fitnessLevel')}
          value={form.fitness_level}
          onChange={(e) => setForm({ ...form, fitness_level: e.target.value })}
        >
          <option value="">{t('selectLevel')}</option>
          <option value="beginner">{t('fitnessBeginner')}</option>
          <option value="intermediate">{t('fitnessIntermediate')}</option>
          <option value="advanced">{t('fitnessAdvanced')}</option>
        </Select>

        <Textarea
          label={t('goals')}
          placeholder={t('goalsPlaceholder')}
          value={form.goals}
          onChange={(e) => setForm({ ...form, goals: e.target.value })}
        />

        <Button type="submit" isLoading={updateProfile.isPending}>
          {t('saveChanges')}
        </Button>
      </form>

      {/* Change password */}
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          if (pwForm.new_password !== pwForm.new_password_confirmation) {
            toast.error(t('passwordsDoNotMatch'))
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
            label={t('currentPassword')}
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
          label={t('newPassword')}
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
