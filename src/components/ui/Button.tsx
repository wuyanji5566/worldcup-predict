import { cn } from '@/utils/cn'
import { Spinner } from './Spinner'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variants = {
  primary: 'bg-accent text-black font-semibold hover:brightness-110 active:scale-[0.98] shadow-lg shadow-accent-glow',
  secondary: 'bg-surface-2 text-text-secondary border border-border-default hover:bg-surface-3 hover:text-text-primary',
  ghost: 'text-text-tertiary hover:text-text-primary hover:bg-surface-2',
  danger: 'bg-live text-white hover:brightness-110',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-[13px] rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
}

export function Button({
  variant = 'primary', size = 'md', loading = false,
  className, disabled, children, ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer',
        'disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100',
        variants[variant], sizes[size], className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
