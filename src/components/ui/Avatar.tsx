import Image from 'next/image'
import { cn, avatarUrl, getInitials } from '@/lib/utils'

interface AvatarProps {
  src: string | null | undefined
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  ringStatus?: 'verified' | 'online' | null
}

const sizeMap = {
  sm: { box: 'h-8 w-8',  text: 'text-xs' },
  md: { box: 'h-11 w-11', text: 'text-sm' },
  lg: { box: 'h-16 w-16', text: 'text-lg' },
  xl: { box: 'h-24 w-24', text: 'text-2xl' },
}

export function Avatar({ src, name, size = 'md', className, ringStatus }: AvatarProps) {
  const { box, text } = sizeMap[size]
  const hasImage = !!src

  return (
    <div className={cn('relative shrink-0', box, className)}>
      {ringStatus === 'verified' && (
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-green-400 to-green-600" />
      )}
      <div className={cn('relative overflow-hidden rounded-full bg-navy-700 flex items-center justify-center', box, ringStatus && 'ring-2 ring-navy-900')}>
        {hasImage ? (
          <Image
            src={avatarUrl(src)}
            alt={name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <span className={cn('font-semibold text-zinc-300', text)}>{getInitials(name)}</span>
        )}
      </div>
    </div>
  )
}
