'use client'

import { motion } from 'framer-motion'

type Direction = 'up' | 'down' | 'left' | 'right'

const OFFSCREEN: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 30 },
  down: { y: -30 },
  left: { x: 30 },
  right: { x: -30 },
}

interface FadeInOnScrollProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  direction?: Direction
  className?: string
  once?: boolean
}

/**
 * Fades content in when it enters the viewport.
 * Default: fade up from y:30, 0.5s.
 */
export function FadeInOnScroll({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  className,
  once = true,
}: FadeInOnScrollProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...OFFSCREEN[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
