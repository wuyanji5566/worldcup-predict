import { cn } from '@/utils/cn'

export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-7 h-7 border-[3px]', lg: 'w-10 h-10 border-[3px]' }
  return (
    <div className={cn('rounded-full border-transparent border-t-accent animate-spin', sizes[size], className)} />
  )
}
