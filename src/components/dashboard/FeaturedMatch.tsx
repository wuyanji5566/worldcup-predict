import { Clock, MapPin, Zap, ChevronRight, Users, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { UpcomingMatch } from '@/data/mockData'
import { formatMatchTimeOnlyCST } from '@/utils/time'

interface FeaturedMatchProps {
  match: UpcomingMatch
}

export function FeaturedMatch({ match }: FeaturedMatchProps) {
  const isToday = match.date === '2026-06-15'

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface-2 border border-border-default card-lift group">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/3 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none transition-opacity group-hover:opacity-100" />

      <div className="relative p-5 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <Star size={16} className="text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">焦点之战</h3>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider">
                {match.stage} · {match.group}
              </p>
            </div>
          </div>
          {isToday && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-live/10 border border-live/20 text-[11px] font-bold text-live">
              <span className="w-1.5 h-1.5 rounded-full bg-live live-pulse" />
              今日
            </span>
          )}
        </div>

        {/* Teams Showdown */}
        <div className="flex items-center justify-between mb-5">
          {/* Home */}
          <div className="flex flex-col items-center flex-1 gap-3">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-surface-3 flex items-center justify-center border border-border-default group-hover:border-border-strong transition-all">
              <span className="text-4xl md:text-5xl leading-none">{match.homeFlag}</span>
            </div>
            <span className="text-sm md:text-base font-bold text-text-primary text-center tracking-tight">
              {match.homeTeam}
            </span>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center px-4 md:px-6">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-surface-3 border border-border-default flex items-center justify-center mb-2">
              <span className="text-sm font-black text-text-tertiary tracking-widest">VS</span>
            </div>
            <span className="text-[11px] text-text-tertiary font-mono">{formatMatchTimeOnlyCST(match.date, match.time, match.stadium)}</span>
          </div>

          {/* Away */}
          <div className="flex flex-col items-center flex-1 gap-3">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-surface-3 flex items-center justify-center border border-border-default group-hover:border-border-strong transition-all">
              <span className="text-4xl md:text-5xl leading-none">{match.awayFlag}</span>
            </div>
            <span className="text-sm md:text-base font-bold text-text-primary text-center tracking-tight">
              {match.awayTeam}
            </span>
          </div>
        </div>

        {/* Match info bar */}
        <div className="flex items-center justify-center gap-4 mb-4 text-[11px] text-text-tertiary">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatMatchTimeOnlyCST(match.date, match.time, match.stadium)} <span className="text-[10px]">(北京)</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-border-strong" />
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {match.stadium}
          </span>
        </div>

        {/* CTA */}
        <a href={`#/matches/${match.id}`} className="block no-underline">
          <Button variant="primary" className="w-full gap-2 group/btn">
            <Zap size={15} />
            立即预测比分
            <ChevronRight size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </Button>
        </a>

        {/* Bottom micro-stats */}
        <div className="mt-4 flex items-center justify-center gap-6 text-[11px] text-text-tertiary">
          <span className="flex items-center gap-1">
            <Users size={11} />
            2.3K 人已预测
          </span>
        </div>
      </div>
    </div>
  )
}
