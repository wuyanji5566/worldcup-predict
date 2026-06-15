import type { CachedMatch } from '@/types/match'
import { TEAM_FLAGS, TEAM_NAMES_ZH, STADIUMS, STAGE_LABELS } from '@/utils/constants'
import { formatCST, parseKickoffTime, stadiumTimezone } from '@/utils/time'
import { LiveIndicator } from './LiveIndicator'
import { ScoreDisplay } from './ScoreDisplay'
import { CountdownBadge } from './CountdownBadge'
import { cn } from '@/utils/cn'
import { MapPin, Clock } from 'lucide-react'

interface MatchDetailProps {
  match: CachedMatch
}

export function MatchDetail({ match }: MatchDetailProps) {
  const kickoffTs = parseKickoffTime(match.date, match.time, stadiumTimezone(match.stadium))
  const isLive = match.status === 'live'

  return (
    <div className={cn(
      'relative overflow-hidden rounded-3xl p-5 md:p-8',
      isLive
        ? 'bg-gradient-to-br from-accent/10 via-bg-card to-bg-card border border-live/30 border-live'
        : 'bg-bg-card border border-white/5',
    )}>
      {isLive && (
        <div className="absolute top-0 right-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
              {STAGE_LABELS[match.stage]}
            </span>
            {match.group && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                {match.group} 组
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isLive && <LiveIndicator />}
            {match.status === 'scheduled' && <CountdownBadge date={match.date} time={match.time} stadium={match.stadium} />}
          </div>
        </div>

        {/* Teams + Score */}
        <div className="flex items-center justify-between py-6 md:py-10">
          <div className="flex flex-col items-center flex-1 gap-4">
            <span className="text-6xl md:text-7xl">{(TEAM_FLAGS[match.homeTeam] ?? '🏳️')}</span>
            <span className="text-base md:text-lg font-display font-bold text-text text-center">
              {TEAM_NAMES_ZH[match.homeTeam] ?? match.homeTeam}
            </span>
          </div>

          <ScoreDisplay
            homeScore={match.homeScore}
            awayScore={match.awayScore}
            homePenalties={match.homePenalties}
            awayPenalties={match.awayPenalties}
            status={match.status}
          />

          <div className="flex flex-col items-center flex-1 gap-4">
            <span className="text-6xl md:text-7xl">{(TEAM_FLAGS[match.awayTeam] ?? '🏳️')}</span>
            <span className="text-base md:text-lg font-display font-bold text-text text-center">
              {TEAM_NAMES_ZH[match.awayTeam] ?? match.awayTeam}
            </span>
          </div>
        </div>

        {/* Match info */}
        <div className="flex flex-wrap items-center gap-5 mt-6 pt-5 border-t border-white/5 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <MapPin size={13} />
            {STADIUMS[match.stadium] ?? match.stadium}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} />
            {formatCST(kickoffTs, 'M月D日 HH:mm')} (北京时间)
          </span>
        </div>

        {/* Events */}
        {match.events.length > 0 && (
          <div className="mt-5 pt-5 border-t border-white/5">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              比赛事件
            </h4>
            <div className="space-y-2">
              {match.events.map((event, i) => (
                <div key={i} className="flex items-center gap-3 text-sm py-1.5 px-3 rounded-lg bg-white/[0.02]">
                  <span className="text-xs font-mono text-text-muted w-8">{event.minute}&apos;</span>
                  <span className="text-base">
                    {event.type === 'goal' ? '⚽' : event.type === 'yellow_card' ? '🟨' : event.type === 'red_card' ? '🟥' : '🔄'}
                  </span>
                  <span className="text-text text-[13px]">{event.player}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
