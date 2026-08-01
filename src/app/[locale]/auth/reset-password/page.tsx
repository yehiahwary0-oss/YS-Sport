'use client'

import { useTranslations } from 'next-intl'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link, useRouter } from '@/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth.service'
import { getApiError } from '@/lib/api'

const schema = z
  .object({
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

function ResetPasswordContent() {
  const t = useTranslations('auth')
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const email = params.get('email') ?? ''

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  if (!token || !email) {
    return (
      <AuthLayout title={t('resetPasswordTitle')} subtitle={t('resetPasswordSubtitle')}>
        <div className="py-4 text-center">
          <p className="text-sm text-zinc-400">
            {t('forgotPasswordSubtitle')}
          </p>
          <Link href="/auth/forgot-password">
            <Button className="mt-6 w-full">{t('forgotPasswordButton')}</Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  if (success) {
    return (
      <AuthLayout title={t('resetPasswordTitle')} subtitle={t('passwordChanged')}>
        <div className="py-4 text-center">
          <Button onClick={() => router.push('/auth/login')} className="w-full">
            {t('loginButton')}
          </Button>
        </div>
      </AuthLayout>
    )
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await authService.resetPassword({ token, email, ...data })
      setSuccess(true)
      toast.success(t('resetPasswordDone'))
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title={t('resetPasswordTitle')} subtitle={t('resetPasswordSubtitle')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <Input
            label={t('passwordLabel')}
            type={showPassword ? 'text' : 'password'}
            placeholder={t('passwordPlaceholder')}
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-[34px] text-zinc-500 hover:text-zinc-300"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Input
          label={t('confirmPasswordLabel')}
          type="password"
          placeholder={t('confirmPasswordPlaceholder')}
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          {t('resetPasswordButton')}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  )
}
