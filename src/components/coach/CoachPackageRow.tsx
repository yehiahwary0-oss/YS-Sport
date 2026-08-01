'use client'

import { useState } from 'react'
import { MoreVertical, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, deliveryLabel } from '@/lib/utils'
import { useTogglePackage, useDeletePackage } from '@/hooks/usePackages'
import type { CoachPackage } from '@/types'

export function CoachPackageRow({ pkg, onEdit }: { pkg: CoachPackage; onEdit: () => void }) {
  const togglePackage = useTogglePackage()
  const deletePackage = useDeletePackage()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  return (
    <div className="card flex items-center gap-4 p-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-zinc-100">{pkg.name}</h4>
          {!pkg.is_active && <Badge>Paused</Badge>}
          {pkg.tier_label && (
            <span className="text-2xs font-semibold uppercase tracking-wide text-green-400">{pkg.tier_label}</span>
          )}
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {pkg.session_count} session{pkg.session_count > 1 ? 's' : ''} · {pkg.session_duration_minutes}min · {deliveryLabel(pkg.delivery_mode)}
        </p>
      </div>

      <div className="font-display font-semibold text-zinc-100">
        {formatPrice(pkg.price_amount, pkg.price_currency)}
      </div>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="rounded-lg p-2 text-zinc-500 hover:bg-navy-700 hover:text-zinc-300">
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            className="z-50 min-w-[160px] rounded-xl border border-zinc-800 bg-navy-800 p-1.5 shadow-2xl"
          >
            <DropdownMenu.Item
              onClick={onEdit}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none hover:bg-navy-700"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => togglePackage.mutate(pkg.uuid)}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none hover:bg-navy-700"
            >
              {pkg.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {pkg.is_active ? 'Pause' : 'Activate'}
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-zinc-800" />
            <DropdownMenu.Item
              onClick={() => {
                if (confirmingDelete) {
                  deletePackage.mutate(pkg.uuid)
                } else {
                  setConfirmingDelete(true)
                  setTimeout(() => setConfirmingDelete(false), 3000)
                }
              }}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 outline-none hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" /> {confirmingDelete ? 'Confirm delete?' : 'Delete'}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}
