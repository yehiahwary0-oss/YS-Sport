'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/navigation'
import { MailCheck, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth.service'
import { getApiError } from '@/lib/api'

function VerifyEmailContent() {
  const t = useTranslations('auth')
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email') ?? ''
  const token = params.get('token')

  const [isVerifying, setIsVerifying] = useState(!!token)
  const [isResending, setIsResending] = useState(false)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (token && email) {
      authService
        .verifyEmail(token, email)
        .then(() => {
          setVerified(true)
          toast.success(t('verifyEmailDone'))
        })
        .catch((err) => toast.error(getApiError(err)))
        .finally(() => setIsVerifying(false))
    }
  }, [token, email, t])

  const handleResend = async () => {
    setIsResending(true)
    try {
      await authService.resendVerification(email)
      toast.success(t('verifyEmailResent'))
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setIsResending(false)
    }
  }

  if (isVerifying) {
    return (
      <AuthLayout title={t('verifyEmailTitle')}>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      </AuthLayout>
    )
  }

  if (verified) {
    return (
      <AuthLayout title={t('verifyEmailSuccess')} subtitle={t('verifyEmailTitle')}>
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <MailCheck className="h-8 w-8 text-green-500" />
          </div>
          <Button onClick={() => router.push('/auth/login')} className="w-full">
            {t('loginButton')}
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title={t('verifyEmailTitle')}
      subtitle={t('verifyEmailSubtitle')}
    >
      <div className="flex flex-col items-center gap-6 py-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-700">
          <MailCheck className="h-8 w-8 text-zinc-400" />
        </div>
        <p className="text-sm text-zinc-400">{t('verifySpamHint')}</p>
        <Button variant="secondary" onClick={handleResend} isLoading={isResending} className="w-full">
          {t('verifyEmailButton')}
        </Button>
      </div>
    </AuthLayout>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}
