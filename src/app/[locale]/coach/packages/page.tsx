'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Package as PackageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { CoachPackageRow } from '@/components/coach/CoachPackageRow'
import { PackageFormModal } from '@/components/coach/PackageFormModal'
import { usePackages } from '@/hooks/usePackages'
import type { CoachPackage } from '@/types'

export default function CoachPackagesPage() {
  const t = useTranslations('coach.packages')
  const { data: packages, isLoading, isError } = usePackages()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<CoachPackage | null>(null)

  const openCreate = () => {
    setEditingPackage(null)
    setModalOpen(true)
  }

  const openEdit = (pkg: CoachPackage) => {
    setEditingPackage(pkg)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{t('description')}</p>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> {t('addPackage')}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : packages && packages.length > 0 ? (
        <div className="space-y-3">
          {packages.map((pkg) => (
            <CoachPackageRow key={pkg.uuid} pkg={pkg} onEdit={() => openEdit(pkg)} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={PackageIcon}
          title={t('noPackages')}
          description={t('noPackagesDesc')}
          action={<Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {t('addPackage')}</Button>}
        />
      )}

      <PackageFormModal open={modalOpen} onOpenChange={setModalOpen} editingPackage={editingPackage} />
    </div>
  )
}
