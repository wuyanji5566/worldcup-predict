import { useEffect, useState } from 'react'
import { X, Swords, Flame } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { LiveEvent } from '@/services/liveTypes'

export interface GoalToastData {
  id: string
  event: LiveEvent
  homeScore: number
  awayScore: number
  probBefore: number
  probAfter: number
  createdAt: number
}

interface GoalToastProps {
  toast: GoalToastData
  onDismiss: (id: string) => void
}

export function GoalToast({ toast, onDismiss }: GoalToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const t = setTimeout(() => onDismiss(toast.id), 6000)
    return () => clearTimeout(t)
  }, [toast.id, onDismiss])

  const teamName = toast.event.team === 'home' ? '海地' : '苏格兰'
  const isHome = toast.event.team === 'home'
  const probDelta = toast.probAfter - toast.probBefore

  return (
    <div
      className={cn(
        'relative max-w-sm w-full rounded-2xl border border-white/10 p-4 shadow-2xl shadow-black/40',
        'bg-slate-900/90 backdrop-blur-xl transition-all duration-500 ease-out',
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
      )}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Swords size={20} className="text-amber-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Flame size={13} className="text-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">GOAL! 进球战报</span>
          </div>
          <p className="text-sm text-slate-200 font-semibold leading-snug">
            {teamName} ({toast.event.minute}&apos;) 打入一球！
          </p>
          <p className="text-sm text-slate-300 mt-0.5">
            当前总比分{' '}
            <span className="font-black text-white font-mono">
              {toast.homeScore} - {toast.awayScore}
            </span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1.5">
            {isHome ? '海地' : '苏格兰'} 实时胜率已修正：
            <span className={cn('font-mono font-bold ml-1', probDelta > 0 ? 'text-emerald-400' : 'text-rose-400')}>
              {probDelta > 0 ? '+' : ''}{probDelta}%
            </span>
            {' → '}
            <span className="font-mono font-bold text-slate-200">{toast.probAfter}%</span>
          </p>
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      {/* Dismiss bar */}
      <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-amber-500/30 rounded-full animate-[shrink_6s_linear_forwards]" />
      </div>
    </div>
  )
}
