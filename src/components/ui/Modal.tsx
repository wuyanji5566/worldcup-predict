import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ModalProps {
  open: boolean; onClose: () => void; title?: string
  children: ReactNode; size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={cn(
        'relative w-full bg-surface-2 border border-border-strong rounded-2xl shadow-2xl shadow-black/50',
        'animate-fade-up', sizes[size],
      )}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
            <h3 className="text-sm font-bold text-text-primary">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-3 transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
