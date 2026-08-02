'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLMotionProps<'div'> {
  /** Applies a hover lift + shadow increase (use for clickable cards). */
  interactive?: boolean
  children?: ReactNode
}

/**
 * Motion-enhanced card matching the global `.card` style.
 * Non-interactive cards render as a plain container with no hover motion.
 */
export function Card({ className, interactive = false, children, ...props }: CardProps) {
  if (!interactive) {
    return (
      <div className={cn('card', className)} {...(props as HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={cn('card cursor-pointer', className)}
      whileHover={{ y: -4, boxShadow: '0 12px 32px -8px rgba(0, 0, 0, 0.5)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
