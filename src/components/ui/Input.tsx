import { cn } from '@/utils/cn'
import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; helpText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-[13px] font-medium text-text-secondary">{label}</label>}
        <input
          ref={ref} id={id}
          className={cn(
            'w-full px-4 py-2.5 bg-surface-1 border border-border-default rounded-xl',
            'text-sm text-text-primary placeholder:text-text-tertiary',
            'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40',
            'transition-all min-h-[44px]',
            error && 'border-live/50 focus:ring-live/20',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-live">{error}</p>}
        {helpText && !error && <p className="text-xs text-text-tertiary">{helpText}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'
