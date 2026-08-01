'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Link } from '@/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MailCheck } from 'lucide-react'
import toast from 'react-hot-toast'

import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth.service'
import { getApiError } from '@/lib/api'

const schema = z.object({ email: z.string().email('Enter a valid email address') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await authService.forgotPassword(data.email)
      setSent(true)
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout title={t('verifyEmailTitle')} subtitle={t('forgotPasswordSent')}>
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-700">
            <MailCheck className="h-8 w-8 text-zinc-400" />
          </div>
          <Link href="/auth/login" className="text-sm font-medium text-green-400 hover:text-green-400">
            {t('loginLink')}
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title={t('forgotPasswordTitle')} subtitle={t('forgotPasswordSubtitle')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('emailLabel')}
          type="email"
          placeholder={t('emailPlaceholder')}
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" className="w-full" isLoading={isLoading}>
          {t('forgotPasswordButton')}
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
