'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter, Link } from '@/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

import { AuthLayout } from '@/components/layout/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/auth.store'
import { getApiError } from '@/lib/api'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const user = await login(data.email, data.password)
      toast.success(t('loginWelcome'))

      if (user.role === 'coach') router.push('/coach/dashboard')
      else if (user.role === 'admin') router.push('/admin/dashboard')
      else router.push('/athlete/dashboard')
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title={t('loginTitle')} subtitle={t('loginSubtitle')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('emailLabel')}
          type="email"
          placeholder={t('emailPlaceholder')}
          error={errors.email?.message}
          {...register('email')}
        />

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

        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="text-sm text-green-400 hover:text-green-400">
            {t('forgotPassword')}
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          {t('loginButton')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        {t('noAccount')}{' '}
        <Link href="/auth/register" className="font-medium text-green-400 hover:text-green-400">
          {t('registerLink')}
        </Link>
      </p>
    </AuthLayout>
  )
}
