import { useUIStore } from '@/store/uiStore'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/utils/cn'

const icons: Record<string, React.ReactNode> = {
  success: <CheckCircle size={16} className="text-success" />,
  error: <AlertCircle size={16} className="text-live" />,
  info: <Info size={16} className="text-accent" />,
}

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts)
  const removeToast = useUIStore((s) => s.removeToast)
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-xs">
      {toasts.map((toast) => (
        <div key={toast.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 bg-surface-2 border border-border-strong rounded-xl shadow-lg toast-enter',
          )}>
          {icons[toast.type]}
          <span className="text-xs text-text-primary flex-1">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="text-text-tertiary hover:text-text-primary cursor-pointer">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
