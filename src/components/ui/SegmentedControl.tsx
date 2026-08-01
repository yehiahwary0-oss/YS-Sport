'use client'

import { cn } from '@/lib/utils'

interface SegmentedControlProps<T extends string | undefined> {
  options: { label: string; value: T }[]
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'md'
  className?: string
}

export function SegmentedControl<T extends string | undefined>({
  options,
  value,
  onChange,
  size = 'md',
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn('flex gap-1 rounded-lg bg-navy-800 p-1 w-fit', className)}>
      {options.map((opt) => (
        <button
          key={opt.label}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-md font-medium transition-colors whitespace-nowrap',
            size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
            value === opt.value
              ? 'bg-green-500 text-navy-900'
              : 'text-zinc-400 hover:text-zinc-200'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
