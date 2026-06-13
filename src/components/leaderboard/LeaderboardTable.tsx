import type { LeaderboardEntry } from '@/types/leaderboard'
import { useAuth } from '@/hooks/useAuth'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/utils/cn'
import { RefreshCw, Target, CircleCheck } from 'lucide-react'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  onRefresh: () => void
}

const medals = [
  { emoji: '🥇', color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30' },
  { emoji: '🥈', color: 'text-silver', bg: 'bg-silver/10', border: 'border-silver/20' },
  { emoji: '🥉', color: 'text-bronze', bg: 'bg-bronze/10', border: 'border-bronze/20' },
]

export function LeaderboardTable({ entries, onRefresh }: LeaderboardTableProps) {
  const { user } = useAuth()

  if (entries.length === 0) {
    return (
      <EmptyState
        icon="🏆"
        title="暂无排名数据"
        description="比赛结果出来后，排行榜会实时更新"
        actionLabel="刷新"
        onAction={onRefresh}
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-muted font-medium">
          共 {entries.length} 位玩家
        </p>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors cursor-pointer"
        >
          <RefreshCw size={12} />
          刷新
        </button>
      </div>

      {/* Podium top 3 on larger screens */}
      {entries.length >= 3 && (
        <div className="hidden md:flex items-end justify-center gap-3 mb-4 pb-4 border-b border-white/5">
          {/* 2nd place */}
          <PodiumCard entry={entries[1]} place={2} height="h-24" />
          {/* 1st place */}
          <PodiumCard entry={entries[0]} place={1} height="h-32" />
          {/* 3rd place */}
          <PodiumCard entry={entries[2]} place={3} height="h-20" />
        </div>
      )}

      {/* Full table */}
      <div className="bg-bg-card border border-white/5 rounded-2xl overflow-x-auto">
        {/* Header */}
        <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 border-b border-white/5 bg-white/[0.02] text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-4">玩家</div>
          <div className="col-span-2 text-center">积分</div>
          <div className="col-span-2 text-center">精确</div>
          <div className="col-span-2 text-center">正确</div>
          <div className="col-span-1 text-center">准确率</div>
        </div>

        <div className="divide-y divide-white/5">
          {entries.map((entry) => {
            const isMe = user?.id === entry.userId
            const isTop3 = entry.rank <= 3
            const medal = isTop3 ? medals[entry.rank - 1] : null

            return (
              <div
                key={entry.userId}
                className={cn(
                  'grid grid-cols-1 md:grid-cols-12 gap-2 px-5 py-3.5 items-center transition-colors',
                  isMe
                    ? 'bg-accent/5 border-l-2 border-l-accent'
                    : 'hover:bg-white/[0.02]',
                )}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center gap-1.5">
                  {medal ? (
                    <span className={cn('text-lg', medal.color)}>{medal.emoji}</span>
                  ) : (
                    <span className="text-sm text-text-muted font-mono font-medium w-6 text-center">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* Name */}
                <div className="md:col-span-4 flex items-center gap-2.5">
                  <span className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    isTop3 ? medal!.bg + ' ' + medal!.color : 'bg-white/5 text-text-secondary',
                  )}>
                    {entry.displayName.charAt(0)}
                  </span>
                  <span className="text-sm font-semibold text-text truncate">
                    {entry.displayName}
                  </span>
                  {isMe && (
                    <span className="text-[10px] text-accent font-bold px-1.5 py-0.5 rounded bg-accent/10">
                      你
                    </span>
                  )}
                </div>

                {/* Points */}
                <div className="md:col-span-2 flex md:justify-center">
                  <span className="text-sm font-display font-bold text-gold">
                    {entry.totalPoints} 分
                  </span>
                </div>

                {/* Stats */}
                <div className="md:col-span-2 flex md:justify-center items-center gap-1">
                  <Target size={11} className="text-green-400" />
                  <span className="text-xs text-text-secondary">{entry.exactScores}</span>
                </div>
                <div className="md:col-span-2 flex md:justify-center items-center gap-1">
                  <CircleCheck size={11} className="text-blue-400" />
                  <span className="text-xs text-text-secondary">{entry.correctOutcomes}</span>
                </div>
                <div className="md:col-span-1 flex md:justify-center">
                  <span className={cn(
                    'text-xs font-mono font-medium',
                    entry.accuracy >= 0.5 ? 'text-green-400' : 'text-text-muted',
                  )}>
                    {Math.round(entry.accuracy * 100)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PodiumCard({ entry, place, height }: { entry: LeaderboardEntry; place: number; height: string }) {
  const medal = medals[place - 1]
  return (
    <div className={cn(
      'flex flex-col items-center justify-end rounded-t-2xl border border-b-0 px-4 pt-4 pb-3 w-28',
      height,
      medal.bg,
      medal.border,
    )}>
      <span className="text-2xl mb-1">{medal.emoji}</span>
      <span className="text-xs font-semibold text-text text-center truncate w-full">
        {entry.displayName}
      </span>
      <span className="text-sm font-display font-bold text-gold mt-0.5">
        {entry.totalPoints}分
      </span>
    </div>
  )
}
