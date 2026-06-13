import { cn } from '@/utils/cn'

interface ScoreDisplayProps {
  homeScore: number | null
  awayScore: number | null
  homePenalties?: number | null
  awayPenalties?: number | null
  status: string
}

export function ScoreDisplay({ homeScore, awayScore, homePenalties, awayPenalties, status }: ScoreDisplayProps) {
  if (status === 'scheduled') {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">VS</span>
        <span className="text-xs text-text-muted font-mono">--:--</span>
      </div>
    )
  }

  const isLive = status === 'live'

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={cn(
        'flex items-center gap-2.5 px-4 py-2 rounded-xl',
        isLive && 'bg-accent/10 border border-accent/20',
      )}>
        <span className={cn(
          'text-2xl font-display font-bold tabular-nums min-w-[2ch] text-center',
          isLive ? 'text-text' : 'text-text',
        )}>
          {homeScore ?? '?'}
        </span>
        <span className="text-sm text-text-muted font-medium">:</span>
        <span className={cn(
          'text-2xl font-display font-bold tabular-nums min-w-[2ch] text-center',
          isLive ? 'text-text' : 'text-text',
        )}>
          {awayScore ?? '?'}
        </span>
      </div>
      {homePenalties !== null && homePenalties !== undefined &&
       awayPenalties !== null && awayPenalties !== undefined && (
        <span className="text-[10px] text-text-muted font-mono">
          PK {homePenalties} - {awayPenalties}
        </span>
      )}
    </div>
  )
}
