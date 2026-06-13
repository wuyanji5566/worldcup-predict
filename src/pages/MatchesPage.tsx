import { Filter, MapPin, Clock } from 'lucide-react'
import type { CachedMatch } from '@/types/match'
import { TEAM_FLAGS, TEAM_NAMES_ZH, STAGE_LABELS, STADIUMS } from '@/utils/constants'

const sampleMatches: CachedMatch[] = [
  { id: 'm1', date: '2026-06-15', time: '13:00', homeTeam: 'Argentina', awayTeam: 'Canada', group: 'B', stadium: 'Toronto', stage: 'group', status: 'scheduled', homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'm2', date: '2026-06-15', time: '17:00', homeTeam: 'Brazil', awayTeam: 'Denmark', group: 'D', stadium: 'Miami', stage: 'group', status: 'live', homeScore: 2, awayScore: 1, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'm3', date: '2026-06-15', time: '21:00', homeTeam: 'France', awayTeam: 'Croatia', group: 'E', stadium: 'New York', stage: 'group', status: 'scheduled', homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'm4', date: '2026-06-16', time: '13:00', homeTeam: 'Germany', awayTeam: 'Colombia', group: 'F', stadium: 'Dallas', stage: 'group', status: 'scheduled', homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'm5', date: '2026-06-16', time: '17:00', homeTeam: 'Spain', awayTeam: 'Switzerland', group: 'G', stadium: 'San Francisco', stage: 'group', status: 'scheduled', homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
]

export function MatchesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">赛事预测</h1>
          <p className="text-sm text-text-secondary mt-1">选择比赛，提交你的比分预测</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2 border border-border-default text-xs font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
          <Filter size={14} />
          筛选
        </button>
      </div>

      <div className="space-y-3">
        {sampleMatches.map((match) => {
          const isLive = match.status === 'live'
          return (
            <div
              key={match.id}
              className={`bg-surface-2 border-2 rounded-2xl p-4 card-lift transition-all ${
                isLive ? 'live-heartbeat shadow-[0_0_20px_rgba(34,197,94,0.08)]' : 'border-border-default'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isLive ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-400 -ml-3.5 mr-1" />
                      LIVE
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-text-tertiary bg-surface-3 px-2 py-0.5 rounded-full">
                      未开始
                    </span>
                  )}
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                    {STAGE_LABELS[match.stage]} · {match.group}组
                  </span>
                </div>
                <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                  <Clock size={11} />
                  {match.time}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{TEAM_FLAGS[match.homeTeam] ?? '🏳️'}</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {TEAM_NAMES_ZH[match.homeTeam] ?? match.homeTeam}
                  </span>
                </div>

                <div className="px-5">
                  {isLive ? (
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-live/5 border border-live/10">
                      <span className="text-xl font-bold text-text-primary font-mono">{match.homeScore}</span>
                      <span className="text-text-tertiary">:</span>
                      <span className="text-xl font-bold text-text-primary font-mono">{match.awayScore}</span>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-text-tertiary uppercase tracking-wider">VS</span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 flex-1">
                  <span className="text-sm font-semibold text-text-primary">
                    {TEAM_NAMES_ZH[match.awayTeam] ?? match.awayTeam}
                  </span>
                  <span className="text-2xl">{TEAM_FLAGS[match.awayTeam] ?? '🏳️'}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border-default flex items-center justify-between">
                <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                  <MapPin size={11} />
                  {STADIUMS[match.stadium] ?? match.stadium}
                </span>
                <a
                  href={`#/matches/${match.id}`}
                  className="text-[12px] font-medium text-accent hover:text-cyan-400 transition-colors no-underline"
                >
                  预测比分 →
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
