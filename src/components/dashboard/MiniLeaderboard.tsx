import { Trophy, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { LeaderboardUser } from '@/data/mockData'

interface MiniLeaderboardProps {
  entries: LeaderboardUser[]
  currentUser?: { name: string; rank: number; points: number; accuracy: number }
}

const trendIcons = {
  up: <TrendingUp size={11} className="text-success" />,
  down: <TrendingDown size={11} className="text-live" />,
  flat: <Minus size={11} className="text-text-tertiary" />,
}

const medalStyles = [
  { ring: 'ring-gold/30 bg-gold/10', shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]' },
  { ring: 'ring-slate-400/20 bg-slate-400/5', shadow: '' },
  { ring: 'ring-amber-700/20 bg-amber-700/5', shadow: '' },
]

export function MiniLeaderboard({ entries, currentUser }: MiniLeaderboardProps) {
  return (
    <div className="bg-surface-2 border border-border-default rounded-2xl p-5 md:p-6 card-lift">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center">
            <Trophy size={16} className="text-gold" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">排行榜</h3>
            <p className="text-[10px] text-text-tertiary uppercase tracking-wider">TOP 3 预测玩家</p>
          </div>
        </div>
        <a
          href="#/leaderboard"
          className="flex items-center gap-1 text-[11px] font-medium text-accent hover:text-cyan-400 transition-colors no-underline"
        >
          完整排行
          <ChevronRight size={14} />
        </a>
      </div>

      {/* Top 3 */}
      <div className="space-y-2">
        {entries.map((entry, idx) => (
          <div
            key={entry.rank}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-surface-3/50',
              idx === 0 && 'bg-surface-3/60 ring-1 ring-border-strong',
            )}
          >
            {/* Avatar + Rank badge */}
            <div className="relative shrink-0">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-lg ring-2',
                  medalStyles[idx].ring,
                  medalStyles[idx].shadow,
                )}
              >
                {entry.avatar}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-2 border-2 border-surface-1 flex items-center justify-center text-[10px] font-black text-text-tertiary">
                {entry.rank}
              </div>
            </div>

            {/* Name + accuracy */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-text-primary truncate">
                  {entry.name}
                </span>
                {trendIcons[entry.trend]}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 flex-1 max-w-24 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${entry.accuracy * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-text-tertiary font-mono">
                  {Math.round(entry.accuracy * 100)}%
                </span>
              </div>
            </div>

            {/* Points */}
            <div className="text-right shrink-0">
              <div className="text-base font-bold text-gold font-mono tabular-nums">
                {entry.points}
              </div>
              <div className="text-[10px] text-text-tertiary">分</div>
            </div>
          </div>
        ))}
      </div>

      {/* Current user section (if not in top 3) */}
      {currentUser && !entries.find((e) => e.rank === currentUser.rank) && (
        <>
          <div className="my-3 border-t border-border-default" />
          <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/5 ring-1 ring-accent/15">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-lg">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[13px] font-semibold text-text-primary">{currentUser.name}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-text-tertiary">排名 #{currentUser.rank}</span>
                <span className="text-[10px] text-text-tertiary">·</span>
                <span className="text-[10px] text-text-tertiary font-mono">
                  {Math.round(currentUser.accuracy * 100)}% 准确率
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-base font-bold text-accent font-mono tabular-nums">
                {currentUser.points}
              </div>
              <div className="text-[10px] text-text-tertiary">分</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
