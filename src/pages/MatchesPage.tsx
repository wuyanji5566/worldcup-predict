import { MapPin, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import type { CachedMatch } from '@/types/match'
import { TEAM_FLAGS, TEAM_NAMES_ZH, STAGE_LABELS, STADIUMS } from '@/utils/constants'
import { useMatches } from '@/hooks/useMatches'
import { useState } from 'react'
import { cn } from '@/utils/cn'

export function MatchesPage() {
  const { matches, liveMatches, upcomingMatches, finishedMatches, isLoading, error, refresh } = useMatches()
  const [filter, setFilter] = useState<'all' | 'live' | 'scheduled' | 'finished'>('all')

  const filtered = filter === 'all' ? matches
    : filter === 'live' ? liveMatches
    : filter === 'scheduled' ? upcomingMatches
    : finishedMatches

  const filterTabs = [
    { key: 'all', label: '全部', count: matches.length },
    { key: 'live', label: '进行中', count: liveMatches.length },
    { key: 'scheduled', label: '即将开始', count: upcomingMatches.length },
    { key: 'finished', label: '已结束', count: finishedMatches.length },
  ] as const

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">赛事预测</h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            {isLoading ? '加载中...' : `${matches.length} 场比赛`}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2 border border-border-default text-xs font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          刷新
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0',
              filter === tab.key
                ? 'bg-accent/15 text-accent border border-accent/20'
                : 'bg-surface-2 text-text-tertiary border border-border-default hover:text-text-secondary',
            )}
          >
            {tab.label}
            <span className="text-[10px] opacity-60">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && filtered.length === 0 && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-2 border border-border-default rounded-2xl p-4 skeleton-shimmer">
              <div className="h-4 w-24 rounded mb-3" />
              <div className="h-8 rounded mb-3" />
              <div className="h-3 w-32 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-tertiary text-sm">暂无比赛数据</p>
          <button onClick={refresh} className="mt-3 text-accent text-xs hover:underline cursor-pointer">
            点击刷新
          </button>
        </div>
      )}

      {/* Match list */}
      <div className="space-y-3">
        {filtered.map((match) => (
          <MatchRow key={match.id} match={match} />
        ))}
      </div>
    </div>
  )
}

function MatchRow({ match }: { match: CachedMatch }) {
  const isLive = match.status === 'live'
  const homeFlag = TEAM_FLAGS[match.homeTeam] ?? '🏳️'
  const awayFlag = TEAM_FLAGS[match.awayTeam] ?? '🏳️'
  const homeName = TEAM_NAMES_ZH[match.homeTeam] ?? match.homeTeam
  const awayName = TEAM_NAMES_ZH[match.awayTeam] ?? match.awayTeam

  return (
    <div
      className={cn(
        'bg-surface-2 border-2 rounded-2xl p-4 card-lift transition-all',
        isLive
          ? 'live-heartbeat shadow-[0_0_20px_rgba(34,197,94,0.08)] border-emerald-500/20'
          : 'border-border-default',
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-400 -ml-3.5 mr-1" />
              LIVE
            </span>
          ) : match.status === 'finished' ? (
            <span className="text-[11px] font-medium text-text-tertiary bg-surface-3 px-2 py-0.5 rounded-full">
              已结束
            </span>
          ) : (
            <span className="text-[11px] font-medium text-text-tertiary bg-surface-3 px-2 py-0.5 rounded-full">
              未开始
            </span>
          )}
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            {STAGE_LABELS[match.stage] ?? match.stage}{match.group ? ` · ${match.group}组` : ''}
          </span>
        </div>
        <span className="text-[11px] text-text-tertiary flex items-center gap-1">
          <Clock size={11} />
          {match.time}
        </span>
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xl md:text-2xl shrink-0">{homeFlag}</span>
          <span className="text-sm font-semibold text-text-primary truncate">
            {homeName}
          </span>
        </div>

        <div className="px-3 md:px-5 shrink-0">
          {isLive || match.status === 'finished' ? (
            <div className={cn(
              'flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-xl border',
              isLive ? 'bg-live/5 border-live/10' : 'bg-surface-3 border-border-default',
            )}>
              <span className="text-lg md:text-xl font-bold text-text-primary font-mono tabular-nums">
                {match.homeScore ?? 0}
              </span>
              <span className="text-text-tertiary font-bold">:</span>
              <span className="text-lg md:text-xl font-bold text-text-primary font-mono tabular-nums">
                {match.awayScore ?? 0}
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-text-tertiary uppercase tracking-wider">VS</span>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 flex-1 min-w-0">
          <span className="text-sm font-semibold text-text-primary truncate">
            {awayName}
          </span>
          <span className="text-xl md:text-2xl shrink-0">{awayFlag}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border-default flex items-center justify-between">
        <span className="text-[11px] text-text-tertiary flex items-center gap-1">
          <MapPin size={11} />
          {(STADIUMS[match.stadium] ?? match.stadium) || '待定'}
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
}
