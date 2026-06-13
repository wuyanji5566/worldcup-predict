import { Target, CircleCheck } from 'lucide-react'
import { cn } from '@/utils/cn'

const players = [
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

export function LeaderboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">排行榜</h1>
        <p className="text-sm text-text-secondary mt-1">全球预测玩家排名</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-3">
        {players.slice(0, 3).map((player) => {
          const podiumOrder = player.rank === 1 ? 1 : player.rank === 2 ? 0 : 2
          const heights = ['h-28', 'h-36', 'h-24']
          const bgAccents = ['bg-gold/5 border-gold/20', 'bg-accent/5 border-accent/20', 'bg-surface-3 border-border-default']
          return (
            <div
              key={player.name}
              className={cn(
                'flex flex-col items-center justify-end rounded-2xl border p-4',
                heights[podiumOrder],
                bgAccents[podiumOrder],
              )}
              style={{ order: podiumOrder }}
            >
              <span className="text-3xl mb-1">{medals[player.rank - 1]}</span>
              <span className="text-xs font-semibold text-text-primary text-center truncate w-full">
                {player.name}
              </span>
              <span className="text-sm font-bold text-gold font-mono mt-0.5">{player.points}分</span>
            </div>
          )
        })}
      </div>

      {/* Full Table */}
      <div className="bg-surface-2 border border-border-default rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-border-default text-[10px] font-bold uppercase tracking-[0.1em] text-text-tertiary bg-surface-3/50">
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
            className={cn(
              'grid grid-cols-12 gap-2 px-5 py-3.5 items-center border-b border-border-default last:border-0 hover:bg-surface-3/30 transition-colors',
            )}
          >
            <div className="col-span-1 font-mono text-xs text-text-tertiary">
              {player.rank <= 3 ? medals[player.rank - 1] : player.rank}
            </div>
            <div className="col-span-4 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-[11px] font-bold text-accent">
                {player.name.charAt(0)}
              </div>
              <span className="text-[13px] font-semibold text-text-primary">{player.name}</span>
            </div>
            <div className="col-span-2 text-center font-mono text-sm font-bold text-gold">
              {player.points}
            </div>
            <div className="col-span-2 text-center flex items-center justify-center gap-1">
              <Target size={11} className="text-success" />
              <span className="text-xs text-text-secondary">{player.exact}</span>
            </div>
            <div className="col-span-2 text-center flex items-center justify-center gap-1">
              <CircleCheck size={11} className="text-info" />
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
  )
}
