'use client'

import { useTranslations } from 'next-intl'
import { Gift, Copy, Check, RefreshCw, Users, Clock, Award, DollarSign, Share2 } from 'lucide-react'
import { useReferralInfo, useRegenerateCode } from '@/hooks/useReferral'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'
import { useState, useCallback } from 'react'

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-navy-800/50 p-4">
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-navy-700 p-3">
          <Icon className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function ReferralPage() {
  const t = useTranslations('referral')
  const tNav = useTranslations('athlete.nav')
  const { data, isLoading, isError } = useReferralInfo()
  const regenerate = useRegenerateCode()
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [showRegenConfirm, setShowRegenConfirm] = useState(false)

  const copyToClipboard = useCallback(async (text: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{tNav('referral')}</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-xl bg-navy-800/50" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return <ErrorState onRetry={() => window.location.reload()} />
  }

  if (!data) return null

  const referral = data
  const { stats } = referral

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{tNav('referral')}</h1>

      {/* Referral Code Card */}
      <div className="rounded-xl bg-navy-800/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Gift className="h-5 w-5 text-blue-400" />
          {t('yourCode')}
        </h2>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-lg bg-navy-700 px-6 py-3 font-mono text-xl font-bold tracking-wider text-blue-400">
              {referral.code}
            </div>
            <Button
              variant="secondary"
              onClick={() => copyToClipboard(referral.code, setCopiedCode)}
            >
              {copiedCode ? (
                <><Check className="mr-2 h-4 w-4" />{t('copied')}</>
              ) : (
                <><Copy className="mr-2 h-4 w-4" />{t('copyCode')}</>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={() => copyToClipboard(referral.share_url, setCopiedLink)}
            >
              {copiedLink ? (
                <><Check className="mr-2 h-4 w-4" />{t('copied')}</>
              ) : (
                <><Share2 className="mr-2 h-4 w-4" />{t('shareUrl')}</>
              )}
            </Button>
          </div>

          {!showRegenConfirm ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRegenConfirm(true)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('regenerate')}
            </Button>
          ) : (
            <div className="flex items-center gap-3 rounded-lg bg-navy-700 p-3">
              <p className="text-sm text-gray-300">{t('regenerateConfirm')}</p>
              <Button
                size="sm"
                onClick={() => {
                  regenerate.mutate()
                  setShowRegenConfirm(false)
                }}
                disabled={regenerate.isPending}
              >
                {t('regenerate')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRegenConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label={t('stats.total')} value={stats.total} />
        <StatCard icon={Clock} label={t('stats.pending')} value={stats.pending} />
        <StatCard icon={Award} label={t('stats.qualified')} value={stats.qualified} />
        <StatCard icon={DollarSign} label={t('stats.totalReward')} value={`$${stats.total_reward.toFixed(2)}`} />
      </div>

      {/* History */}
      <div className="rounded-xl bg-navy-800/50 p-6">
        <h2 className="mb-4 text-lg font-semibold">{t('history')}</h2>
        {referral.history.length === 0 ? (
          <EmptyState
            icon={Gift}
            title={t('noHistory')}
            description={t('noHistoryDesc')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy-700 text-gray-400">
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">{t('stats.total')}</th>
                  <th className="pb-3 pr-4 font-medium">{t('stats.totalReward')}</th>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {referral.history.map((item) => (
                  <tr key={item.id} className="border-b border-navy-800">
                    <td className="py-3 pr-4">{item.referee_email}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.status === 'qualified'
                          ? 'bg-green-900/50 text-green-400'
                          : 'bg-yellow-900/50 text-yellow-400'
                      }`}>
                        {t(`status.${item.status}`)}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {item.status === 'qualified' ? t('reward', { amount: item.reward_amount.toFixed(2) }) : '-'}
                    </td>
                    <td className="py-3 pr-4 text-gray-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
