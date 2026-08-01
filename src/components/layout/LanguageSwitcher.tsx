'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/navigation'
import { useTransition } from 'react'
import { Languages, Check } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'

const labels: Record<string, string> = {
  en: 'English',
  ar: 'العربية',
}

export function LanguageSwitcher({ align = 'end' }: { align?: 'start' | 'end' }) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function switchLocale(next: string) {
    startTransition(() => {
      router.replace(pathname, { locale: next })
    })
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          aria-label="Switch language"
        >
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{labels[locale]}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={8}
          className="z-50 min-w-[140px] rounded-xl border border-zinc-800 bg-navy-800 p-1.5 shadow-2xl animate-fade-in"
        >
          {routing.locales.map((loc) => (
            <DropdownMenu.Item
              key={loc}
              onClick={() => switchLocale(loc)}
              disabled={isPending}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors',
                loc === locale
                  ? 'text-green-400'
                  : 'text-zinc-300 hover:bg-navy-700'
              )}
            >
              {loc === locale && <Check className="h-4 w-4" />}
              {loc !== locale && <span className="h-4 w-4" />}
              {labels[loc]}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
