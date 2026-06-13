import { useState } from 'react'
import type { CachedMatch } from '@/types/match'
import { usePredictions } from '@/hooks/usePredictions'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/Button'
import { Flame, Lock } from 'lucide-react'
import { cn } from '@/utils/cn'

interface PredictionFormProps {
  match: CachedMatch
}

export function PredictionForm({ match }: PredictionFormProps) {
  const { user, openAuthModal } = useAuth()
  const { submitPrediction, canPredict, getPredictionForMatch, hasJokerInStage } = usePredictions()
  const addToast = useUIStore((s) => s.addToast)

  const existing = user ? getPredictionForMatch(user.id, match.id) : undefined
  const locked = !canPredict(match.id) || !!existing
  const isKnockout = match.stage !== 'group'
  const jokerAvailable = user ? hasJokerInStage(user.id, isKnockout ? 'knockout' : 'group') : false

  const [homeScore, setHomeScore] = useState(existing?.predictedHomeScore ?? 0)
  const [awayScore, setAwayScore] = useState(existing?.predictedAwayScore ?? 0)
  const [jokerUsed, setJokerUsed] = useState(existing?.jokerUsed ?? false)

  const handleSubmit = () => {
    if (!user) { openAuthModal('login'); return }
    if (locked) return
    const ok = submitPrediction(match.id, homeScore, awayScore, jokerUsed)
    addToast(ok ? (jokerUsed ? '预测已提交！Joker 激活 🔥' : '预测已提交！') : '提交失败', ok ? 'success' : 'error')
  }

  if (existing) {
    return (
      <div className="bg-bg-card border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm font-semibold text-text flex items-center gap-2">
            <Lock size={14} className="text-text-muted" />
            我的预测
          </h3>
          {existing.points !== null ? (
            <span className="text-sm font-display font-bold text-gold">+{existing.points} 分</span>
          ) : (
            <span className="text-[11px] text-text-muted font-medium">已锁定</span>
          )}
        </div>
        <div className="flex items-center justify-center gap-5 py-4 bg-white/[0.02] rounded-xl border border-white/5">
          <span className="text-3xl font-display font-bold text-text tabular-nums">{existing.predictedHomeScore}</span>
          <span className="text-text-muted text-lg">-</span>
          <span className="text-3xl font-display font-bold text-text tabular-nums">{existing.predictedAwayScore}</span>
        </div>
        {existing.jokerUsed && (
          <div className="mt-3 text-center text-xs text-accent font-semibold flex items-center justify-center gap-1">
            <Flame size={12} /> Joker 已使用
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-bg-card border border-white/5 rounded-2xl p-5">
      <h3 className="font-display text-sm font-semibold text-text mb-4">预测比分</h3>

      <div className="flex items-center justify-center gap-4 mb-4">
        <input
          type="number"
          min={0} max={30}
          value={homeScore}
          onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
          disabled={locked}
          className="w-20 h-16 text-center text-2xl font-display font-bold bg-white/5 border border-white/10 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 disabled:opacity-30 transition-all"
        />
        <span className="text-text-muted text-lg font-medium">-</span>
        <input
          type="number"
          min={0} max={30}
          value={awayScore}
          onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
          disabled={locked}
          className="w-20 h-16 text-center text-2xl font-display font-bold bg-white/5 border border-white/10 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 disabled:opacity-30 transition-all"
        />
      </div>

      {jokerAvailable && (
        <label className={cn(
          'flex items-center justify-center gap-2 mb-3 py-2 px-4 rounded-xl text-sm cursor-pointer transition-all border',
          jokerUsed ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-white/[0.02] border-white/5 text-text-muted hover:border-white/10',
        )}>
          <input
            type="checkbox"
            checked={jokerUsed}
            onChange={(e) => setJokerUsed(e.target.checked)}
            className="w-4 h-4 rounded accent-accent"
          />
          <Flame size={14} />
          使用 Joker（得分翻倍）
        </label>
      )}

      <Button variant="primary" className="w-full" disabled={locked} onClick={handleSubmit}>
        {locked ? '预测已锁定' : '提交预测'}
      </Button>

      {!user && (
        <p className="text-xs text-text-muted text-center mt-2">登录后提交预测</p>
      )}
    </div>
  )
}
