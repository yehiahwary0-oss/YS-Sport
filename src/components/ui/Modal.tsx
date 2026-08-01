'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onOpenChange, title, description, children, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl border border-zinc-800 bg-navy-800 p-6 shadow-2xl animate-slide-up',
            'max-h-[85vh] overflow-y-auto',
            className
          )}
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              {title && <Dialog.Title className="text-lg font-semibold text-zinc-100">{title}</Dialog.Title>}
              {description && <Dialog.Description className="mt-1 text-sm text-zinc-400">{description}</Dialog.Description>}
            </div>
            <Dialog.Close className="rounded-lg p-1.5 text-zinc-500 hover:bg-navy-700 hover:text-zinc-300">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
