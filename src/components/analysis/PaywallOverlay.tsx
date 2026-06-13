import { Lock, Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface PaywallOverlayProps {
  onUnlock: () => void
  blurred: boolean
  label?: string
  children: React.ReactNode
  variant?: 'compact' | 'full'
}

export function PaywallOverlay({
  onUnlock,
  blurred,
  label = '付费解锁',
  children,
}: PaywallOverlayProps) {
  return (
    <div className="relative">
      {/* Content — blurred when locked */}
      <div
        className={cn(
          'transition-all duration-500',
          blurred && 'blur-[6px] select-none pointer-events-none',
        )}
      >
        {children}
      </div>

      {/* Overlay lock badge — only when blurred */}
      {blurred && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {/* Dark scrim */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] rounded-2xl" />

          {/* Lock CTA */}
          <button
            onClick={onUnlock}
            className="relative flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-800/80 border border-cyan-500/30
                       shadow-[0_0_40px_rgba(6,182,212,0.15)] hover:shadow-[0_0_60px_rgba(6,182,212,0.25)]
                       hover:border-cyan-400/50 hover:scale-105 transition-all duration-300 cursor-pointer group"
          >
            {/* Animated ring */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping" />
              <div className="relative w-14 h-14 rounded-full bg-cyan-500/10 border-2 border-cyan-400/40 flex items-center justify-center">
                <Lock size={24} className="text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors">
                {label}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 justify-center">
                <Sparkles size={10} className="text-amber-400" />
                点击解锁完整量化分析
                <ArrowRight size={10} className="text-cyan-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
