import { GoalToast } from '@/components/ui/GoalToast'
import { Confetti } from '@/components/ui/Confetti'
import { Trophy } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { GoalToastData } from '@/components/ui/GoalToast'

interface NotificationsOverlayProps {
  goalToasts: GoalToastData[]
  dismissGoalToast: (id: string) => void
  showConfetti: boolean
  dismissConfetti: () => void
  settlementMessage: string | null
}

export function NotificationsOverlay({
  goalToasts,
  dismissGoalToast,
  showConfetti,
  settlementMessage,
}: NotificationsOverlayProps) {
  return (
    <>
      {/* Goal Toast Stack — top right */}
      <div className="fixed top-20 right-4 z-[150] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {goalToasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <GoalToast toast={toast} onDismiss={dismissGoalToast} />
          </div>
        ))}
      </div>

      {/* Settlement Banner — bottom center */}
      {settlementMessage && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[150] animate-fade-up">
          <div className={cn(
            'flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl',
            settlementMessage.includes('完美命中')
              ? 'bg-amber-500/10 border-amber-500/30 shadow-amber-500/10'
              : settlementMessage.includes('正确')
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : settlementMessage.includes('未命中')
                  ? 'bg-slate-800/90 border-slate-700/30'
                  : 'bg-slate-800/90 border-slate-700/30',
          )}>
            <Trophy size={20} className={
              settlementMessage.includes('完美命中') ? 'text-amber-400' :
              settlementMessage.includes('未命中') ? 'text-slate-500' : 'text-emerald-400'
            } />
            <span className="text-sm font-bold text-slate-200">{settlementMessage}</span>
          </div>
        </div>
      )}

      {/* Confetti */}
      {showConfetti && <Confetti />}
    </>
  )
}
