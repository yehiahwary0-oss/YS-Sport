'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/navigation'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { PackageCard } from './PackageCard'
import { formatPrice } from '@/lib/utils'
import { useCreateServiceRequest } from '@/hooks/useServiceRequest'
import { useAuthStore } from '@/store/auth.store'
import type { CoachPackage } from '@/types'

interface SendRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coachUuid: string
  coachName: string
  packages: CoachPackage[]
  preselectedPackage?: CoachPackage | null
}

export function SendRequestModal({
  open,
  onOpenChange,
  coachUuid,
  coachName,
  packages,
  preselectedPackage,
}: SendRequestModalProps) {
  const t = useTranslations('marketplace.coachDetail')
  const tc = useTranslations('common')
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [selectedPackage, setSelectedPackage] = useState<CoachPackage | null>(preselectedPackage ?? null)
  const [message, setMessage] = useState('')
  const createRequest = useCreateServiceRequest()

  const handleSubmit = () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (!selectedPackage) return

    createRequest.mutate(
      { coach_uuid: coachUuid, package_uuid: selectedPackage.uuid, message: message || undefined },
      {
        onSuccess: () => {
          onOpenChange(false)
          setMessage('')
          router.push('/athlete/requests')
        },
      }
    )
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`${t('bookSession')} with ${coachName}`}
      description="Choose a package and send your request."
      className="max-w-lg"
    >
      <div className="space-y-3">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.uuid}
            pkg={pkg}
            selected={selectedPackage?.uuid === pkg.uuid}
            onSelect={setSelectedPackage}
          />
        ))}
      </div>

      <div className="mt-5">
        <Textarea
          label="Message (optional)"
          placeholder="Tell the coach about your goals..."
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4">
        <div>
          {selectedPackage && (
            <>
              <span className="text-xs text-zinc-500">{tc('total')}</span>
              <div className="font-display text-lg font-bold text-zinc-50">
                {formatPrice(selectedPackage.price_amount, selectedPackage.price_currency)}
              </div>
            </>
          )}
        </div>
        <Button onClick={handleSubmit} disabled={!selectedPackage} isLoading={createRequest.isPending}>
          {user ? t('sendRequest') : 'Log In to Continue'}
        </Button>
      </div>
    </Modal>
  )
}
