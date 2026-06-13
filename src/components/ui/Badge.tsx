import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'
  children: ReactNode; className?: string
}

const variants = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-live/10 text-live border-live/20',
  info: 'bg-info/10 text-info border-info/20',
  default: 'bg-surface-3 text-text-secondary border-border-default',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border',
      variants[variant], className,
    )}>
      {children}
    </span>
  )
}
