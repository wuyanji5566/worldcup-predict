import type { CachedMatch } from '@/types/match'
import { TEAM_FLAGS, TEAM_NAMES_ZH, STADIUMS, STAGE_LABELS } from '@/utils/constants'
import { LiveIndicator } from './LiveIndicator'
import { CountdownBadge } from './CountdownBadge'
import { ScoreDisplay } from './ScoreDisplay'
import { cn } from '@/utils/cn'
import { MapPin } from 'lucide-react'

interface MatchCardProps {
  match: CachedMatch
  className?: string
}

export function MatchCard({ match, className }: MatchCardProps) {
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'

  return (
    <a
      href={`#/matches/${match.id}`}
      className={cn(
        'block bg-bg-card border rounded-2xl p-4 transition-all duration-300 no-underline',
        isLive
          ? 'border-live/30 border-live bg-accent/[0.03]'
          : 'border-white/5 card-hover-lift',
        className,
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLive ? (
            <LiveIndicator />
          ) : (
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide',
              isFinished
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-white/5 text-text-secondary border border-white/10',
            )}>
              {isFinished ? '已结束' : '未开始'}
            </span>
          )}
          <span className="text-[11px] text-text-muted font-medium">
            {STAGE_LABELS[match.stage]}
          </span>
        </div>
        {match.status === 'scheduled' && (
          <CountdownBadge date={match.date} time={match.time} stadium={match.stadium} />
        )}
      </div>

      {/* Teams + Score */}
      <div className="flex items-center justify-between py-2">
        <div className="flex flex-col items-center flex-1 gap-1.5">
          <span className="text-2xl">{(TEAM_FLAGS[match.homeTeam] ?? '🏳️')}</span>
          <span className="text-[13px] font-semibold text-text text-center leading-tight max-w-[100px] truncate">
            {TEAM_NAMES_ZH[match.homeTeam] ?? match.homeTeam}
          </span>
        </div>

        <div className="flex flex-col items-center px-3">
          <ScoreDisplay
            homeScore={match.homeScore}
            awayScore={match.awayScore}
            homePenalties={match.homePenalties}
            awayPenalties={match.awayPenalties}
            status={match.status}
          />
        </div>

        <div className="flex flex-col items-center flex-1 gap-1.5">
          <span className="text-2xl">{(TEAM_FLAGS[match.awayTeam] ?? '🏳️')}</span>
          <span className="text-[13px] font-semibold text-text text-center leading-tight max-w-[100px] truncate">
            {TEAM_NAMES_ZH[match.awayTeam] ?? match.awayTeam}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[11px] text-text-muted flex items-center gap-1">
          <MapPin size={11} />
          {STADIUMS[match.stadium] ?? match.stadium}
        </span>
        {match.group && (
          <span className="text-[11px] text-text-muted font-medium">
            {match.group} 组
          </span>
        )}
      </div>
    </a>
  )
}
