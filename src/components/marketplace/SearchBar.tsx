'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search coaches by name...', className }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onChange(localValue)
      }}
      className={cn('relative', className)}
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-700 bg-navy-800 py-3.5 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50"
      />
    </form>
  )
}
