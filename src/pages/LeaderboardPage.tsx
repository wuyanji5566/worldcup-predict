import { Target, CircleCheck } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useState, useMemo } from 'react'
import { useLeaderboard } from '@/hooks/useLeaderboard'

const fallbackPlayers = [
  { rank: 1, name: '足球预言家', points: 248, exact: 18, correct: 42, accuracy: 0.62 },
  { rank: 2, name: '梅西铁粉', points: 231, exact: 15, correct: 45, accuracy: 0.58 },
  { rank: 3, name: 'C罗无敌', points: 225, exact: 16, correct: 40, accuracy: 0.56 },
  { rank: 4, name: '理智分析师', points: 218, exact: 14, correct: 43, accuracy: 0.55 },
  { rank: 5, name: '足球迷小王', points: 207, exact: 12, correct: 46, accuracy: 0.53 },
  { rank: 6, name: '预言家老张', points: 198, exact: 11, correct: 44, accuracy: 0.51 },
  { rank: 7, name: '绿茵漫步者', points: 192, exact: 10, correct: 42, accuracy: 0.49 },
  { rank: 8, name: '世界杯达人', points: 185, exact: 9, correct: 41, accuracy: 0.47 },
]

const medals = ['🥇', '🥈', '🥉']

interface Player {
  rank: number
  name: string
  points: number
  exact: number
  correct: number
  accuracy: number
}

export function LeaderboardPage() {
  const { entries } = useLeaderboard()
  const [activeTab, setActiveTab] = useState<'table' | 'cards'>('table')

  // Map real entries to display format, fallback to demo data
  const players: Player[] = useMemo(() => {
    if (entries.length > 0) {
      return entries.map((e) => ({
        rank: e.rank,
        name: e.displayName || e.username || `玩家${e.rank}`,
        points: e.totalPoints,
        exact: e.exactScores,
        correct: e.correctOutcomes,
        accuracy: e.accuracy,
      }))
    }
    return fallbackPlayers
  }, [entries])

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">排行榜</h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            {entries.length > 0 ? `${entries.length} 名预测玩家` : '全球预测玩家排名'}
          </p>
        </div>
        {/* Mobile view toggle */}
        <div className="flex md:hidden bg-surface-2 rounded-xl p-0.5 border border-border-default">
          <button
            onClick={() => setActiveTab('table')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
              activeTab === 'table' ? 'bg-accent/15 text-accent' : 'text-text-tertiary',
            )}
          >
            表格
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
              activeTab === 'cards' ? 'bg-accent/15 text-accent' : 'text-text-tertiary',
            )}
          >
            卡片
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      {players.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {players.slice(0, 3).map((player) => {
            const podiumOrder = player.rank === 1 ? 1 : player.rank === 2 ? 0 : 2
            const heights = ['h-24 md:h-28', 'h-32 md:h-36', 'h-20 md:h-24']
            const bgAccents = ['bg-gold/5 border-gold/20', 'bg-accent/5 border-accent/20', 'bg-surface-3 border-border-default']
            return (
              <div
                key={player.name}
                className={cn(
                  'flex flex-col items-center justify-end rounded-2xl border p-3 md:p-4',
                  heights[podiumOrder],
                  bgAccents[podiumOrder],
                )}
                style={{ order: podiumOrder }}
              >
                <span className="text-2xl md:text-3xl mb-1">{medals[player.rank - 1]}</span>
                <span className="text-[10px] md:text-xs font-semibold text-text-primary text-center truncate w-full">
                  {player.name}
                </span>
                <span className="text-xs md:text-sm font-bold text-gold font-mono mt-0.5">{player.points}分</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Full Table — horizontally scrollable on mobile */}
      <div className={cn(
        'bg-surface-2 border border-border-default rounded-2xl overflow-hidden',
        activeTab === 'cards' && 'hidden md:block',
      )}>
        <div className="overflow-x-auto">
          <div className="min-w-[560px] md:min-w-0">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-4 md:px-5 py-3 border-b border-border-default text-[10px] font-bold uppercase tracking-[0.1em] text-text-tertiary bg-surface-3/50">
              <div className="col-span-1">#</div>
              <div className="col-span-4">玩家</div>
              <div className="col-span-2 text-center">积分</div>
              <div className="col-span-2 text-center">精确命中</div>
              <div className="col-span-2 text-center">胜负正确</div>
              <div className="col-span-1 text-center">准确率</div>
            </div>

            {players.map((player) => (
              <div
                key={player.rank}
                className="grid grid-cols-12 gap-2 px-4 md:px-5 py-3.5 items-center border-b border-border-default last:border-0 hover:bg-surface-3/30 transition-colors"
              >
                <div className="col-span-1 font-mono text-xs text-text-tertiary">
                  {player.rank <= 3 ? medals[player.rank - 1] : player.rank}
                </div>
                <div className="col-span-4 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-[11px] font-bold text-accent shrink-0">
                    {player.name.charAt(0)}
                  </div>
                  <span className="text-[13px] font-semibold text-text-primary truncate">{player.name}</span>
                </div>
                <div className="col-span-2 text-center font-mono text-sm font-bold text-gold">
                  {player.points}
                </div>
                <div className="col-span-2 text-center flex items-center justify-center gap-1">
                  <Target size={11} className="text-success shrink-0" />
                  <span className="text-xs text-text-secondary">{player.exact}</span>
                </div>
                <div className="col-span-2 text-center flex items-center justify-center gap-1">
                  <CircleCheck size={11} className="text-info shrink-0" />
                  <span className="text-xs text-text-secondary">{player.correct}</span>
                </div>
                <div className="col-span-1 text-center">
                  <span className={cn(
                    'text-xs font-mono font-semibold',
                    player.accuracy >= 0.5 ? 'text-success' : 'text-text-secondary',
                  )}>
                    {Math.round(player.accuracy * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className={cn('space-y-2 md:hidden', activeTab === 'table' && 'hidden')}>
        {players.map((player) => (
          <div
            key={player.rank}
            className="bg-surface-2 border border-border-default rounded-xl p-4 flex items-center gap-3"
          >
            <div className="text-2xl shrink-0">
              {player.rank <= 3 ? medals[player.rank - 1] : (
                <span className="text-text-tertiary font-mono text-sm">#{player.rank}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-[11px] font-bold text-accent shrink-0">
                  {player.name.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-text-primary truncate">{player.name}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <Target size={11} className="text-success" />
                  {player.exact}
                </span>
                <span className="flex items-center gap-1">
                  <CircleCheck size={11} className="text-info" />
                  {player.correct}
                </span>
                <span className={cn(
                  'font-mono font-semibold',
                  player.accuracy >= 0.5 ? 'text-success' : 'text-text-tertiary',
                )}>
                  {Math.round(player.accuracy * 100)}%
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg font-bold text-gold font-mono">{player.points}</div>
              <div className="text-[10px] text-text-tertiary">分</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
