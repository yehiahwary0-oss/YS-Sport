'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter, Link } from '@/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Dumbbell, Trophy } from 'lucide-react'

import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth.service'
import { getApiError, getValidationErrors } from '@/lib/api'
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics'
import { cn } from '@/lib/utils'

const schema = z
  .object({
    role: z.enum(['athlete', 'coach']),
    display_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Include an uppercase letter')
      .regex(/[a-z]/, 'Include a lowercase letter')
      .regex(/[0-9]/, 'Include a number'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'athlete' },
  })

  const role = watch('role')

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await authService.register(data)
      trackEvent(ANALYTICS_EVENTS.register, { role: data.role })
      toast.success(t('registerCreated'))
      router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`)
    } catch (err) {
      const fieldErrors = getValidationErrors(err)
      if (Object.keys(fieldErrors).length > 0) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof FormData, { message })
        })
      } else {
        toast.error(getApiError(err))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title={t('registerTitle')} subtitle={t('registerSubtitle')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Role selector — explicit two-path choice */}
        <div>
          <label className="label-text">{t('roleLabel')}</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue('role', 'athlete')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 transition-colors',
                role === 'athlete'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-zinc-700 hover:border-zinc-600'
              )}
            >
              <Dumbbell className={cn('h-6 w-6', role === 'athlete' ? 'text-green-400' : 'text-zinc-500')} />
              <span className={cn('text-sm font-medium', role === 'athlete' ? 'text-green-400' : 'text-zinc-300')}>
                {t('roleAthlete')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setValue('role', 'coach')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 transition-colors',
                role === 'coach'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-zinc-700 hover:border-zinc-600'
              )}
            >
              <Trophy className={cn('h-6 w-6', role === 'coach' ? 'text-green-400' : 'text-zinc-500')} />
              <span className={cn('text-sm font-medium', role === 'coach' ? 'text-green-400' : 'text-zinc-300')}>
                {t('roleCoach')}
              </span>
            </button>
          </div>
        </div>

        <Input
          label={t('nameLabel')}
          placeholder={t('namePlaceholder')}
          error={errors.display_name?.message}
          {...register('display_name')}
        />

        <Input
          label={t('emailLabel')}
          type="email"
          placeholder={t('emailPlaceholder')}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label={t('passwordLabel')}
          type="password"
          placeholder={t('passwordPlaceholder')}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label={t('confirmPasswordLabel')}
          type="password"
          placeholder={t('confirmPasswordPlaceholder')}
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          {t('registerButton')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        {t('hasAccount')}{' '}
        <Link href="/auth/login" className="font-medium text-green-400 hover:text-green-400">
          {t('loginLink')}
        </Link>
      </p>
    </AuthLayout>
  )
}
