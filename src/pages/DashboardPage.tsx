import { Trophy, Users, Target, TrendingUp, ChevronRight, Flame, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { CountdownTimer } from '@/components/dashboard/CountdownTimer'
import { LiveMatchPanel } from '@/components/dashboard/LiveMatchPanel'
import { lazy, Suspense, useMemo } from 'react'
import { FeaturedMatch } from '@/components/dashboard/FeaturedMatch'
import { MiniLeaderboard } from '@/components/dashboard/MiniLeaderboard'
const PointsChart = lazy(() => import('@/components/dashboard/PointsChart').then(m => ({ default: m.PointsChart })))
import { useMatches } from '@/hooks/useMatches'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { topLeaderboard } from '@/data/mockData'

const pointsHistory = [
  { date: '6/11', points: 12 },
  { date: '6/12', points: 18 },
  { date: '6/12', points: 24 },
  { date: '6/13', points: 20 },
  { date: '6/13', points: 30 },
  { date: '6/14', points: 28 },
  { date: '6/15', points: 36 },
]

export function DashboardPage() {
  const { matches, liveMatches, upcomingMatches, finishedMatches, isLoading, error } = useMatches()
  const { entries: leaderboardEntries } = useLeaderboard()

  // Compute stats from real data
  const stats = useMemo(() => {
    const totalMatches = matches.length || 104
    const liveCount = liveMatches.length
    const finishedCount = finishedMatches.length
    // Average goals in finished matches
    const totalGoals = finishedMatches.reduce(
      (sum, m) => sum + (m.homeScore ?? 0) + (m.awayScore ?? 0), 0,
    )
    const avgGoals = finishedCount > 0 ? (totalGoals / finishedCount).toFixed(1) : '—'

    return [
      { icon: Trophy, label: '总比赛', value: totalMatches, change: `+${liveCount} 进行中`, color: 'text-accent', bg: 'bg-accent/10' },
      { icon: Users, label: '预测玩家', value: '12,847', change: '+342', color: 'text-info', bg: 'bg-info/10' },
      { icon: Target, label: '已结束', value: finishedCount, change: `${avgGoals} 场均进球`, color: 'text-success', bg: 'bg-success/10' },
      { icon: TrendingUp, label: '即将开始', value: upcomingMatches.length, change: '查看赛程', color: 'text-gold', bg: 'bg-gold/10' },
    ]
  }, [matches.length, liveMatches.length, upcomingMatches.length, finishedMatches])

  // Featured match: first live match, or first upcoming match
  const featuredMatch = liveMatches[0] ?? upcomingMatches[0] ?? null

  // Recent results from finished matches (last 4)
  const recentResults = useMemo(() => {
    return finishedMatches.slice(0, 4).map((m) => ({
      homeTeam: m.homeTeam,
      homeFlag: '⚽',
      homeScore: m.homeScore ?? 0,
      awayTeam: m.awayTeam,
      awayFlag: '⚽',
      awayScore: m.awayScore ?? 0,
      group: m.group ? `${m.group}组` : '',
    }))
  }, [finishedMatches])

  // Use leaderboard from store, fallback to mock
  const displayLeaderboard = leaderboardEntries.length >= 3
    ? leaderboardEntries.slice(0, 3).map((e, i) => ({
        rank: i + 1,
        name: e.displayName || e.username || `玩家${i + 1}`,
        avatar: ['🔮', '🇦🇷', '📊'][i] ?? '⚽',
        points: e.totalPoints,
        accuracy: e.accuracy ?? 0.5,
        trend: 'up' as const,
      }))
    : topLeaderboard

  return (
    <div className="space-y-5 md:space-y-6 animate-fade-in">
      {/* ===== Page Header ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
            仪表盘
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-0.5">
            {isLoading ? '加载中...' : '2026 世界杯实时概览'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {liveMatches.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-live/10 border border-live/20">
              <span className="w-2 h-2 rounded-full bg-live live-pulse" />
              <span className="text-[11px] font-bold text-live uppercase tracking-wider">
                {liveMatches.length} 场进行中
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
          <AlertCircle size={14} />
          {error} — 显示缓存数据
        </div>
      )}

      {/* ===== Countdown Timer ===== */}
      <CountdownTimer />

      {/* ===== Live Match Simulator ===== */}
      <LiveMatchPanel />

      {/* ===== Stats Bar ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-2 border border-border-default rounded-2xl p-3 md:p-4 card-lift"
          >
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center mb-2 md:mb-3', stat.bg)}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <div className="text-lg md:text-2xl font-bold text-text-primary font-mono tabular-nums">
              {stat.value}
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[11px] md:text-xs text-text-tertiary">{stat.label}</span>
              <span className="text-[10px] md:text-[11px] text-success font-medium">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Main Content: 2-column layout ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">

        {/* --- Left Column (2/3): Featured Match + Chart --- */}
        <div className="lg:col-span-2 space-y-5 md:space-y-6">
          {/* Featured Match Card */}
          {featuredMatch && (
            <FeaturedMatch match={{
              id: featuredMatch.id,
              date: featuredMatch.date,
              time: featuredMatch.time,
              homeTeam: featuredMatch.homeTeam,
              homeFlag: '⚽',
              awayTeam: featuredMatch.awayTeam,
              awayFlag: '⚽',
              group: featuredMatch.group ?? '?',
              stadium: featuredMatch.stadium || '待定',
              stage: featuredMatch.stage,
            }} />
          )}

          {/* Points Chart */}
          <Suspense fallback={<div className="h-48 rounded-2xl bg-surface-2 animate-pulse" />}>
            <PointsChart data={pointsHistory} />
          </Suspense>

          {/* Recent Results Row */}
          {recentResults.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Flame size={16} className="text-warning" />
                  最新赛果
                </h2>
                <a href="#/matches" className="flex items-center gap-1 text-[11px] font-medium text-accent hover:text-cyan-400 transition-colors no-underline">
                  全部赛程
                  <ChevronRight size={13} />
                </a>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {recentResults.map((r, i) => (
                  <div
                    key={i}
                    className="bg-surface-2 border border-border-default rounded-xl p-3 card-lift text-center"
                  >
                    <div className="text-[10px] text-text-tertiary mb-1 truncate">{r.group}</div>
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-text-primary mb-1">
                      <span>{r.homeFlag}</span>
                      <span className="truncate max-w-[50px]">{r.homeTeam}</span>
                    </div>
                    <div className="text-lg font-bold text-text-primary font-mono my-1">
                      {r.homeScore} - {r.awayScore}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-text-primary">
                      <span className="truncate max-w-[50px]">{r.awayTeam}</span>
                      <span>{r.awayFlag}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- Right Column (1/3): Leaderboard + Upcoming --- */}
        <div className="space-y-5 md:space-y-6">
          {/* Mini Leaderboard */}
          <MiniLeaderboard entries={displayLeaderboard} />

          {/* Upcoming Matches Quick List */}
          {upcomingMatches.length > 0 && (
            <div className="bg-surface-2 border border-border-default rounded-2xl p-5 card-lift">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-text-primary">即将开赛</h3>
                <span className="text-[10px] text-text-tertiary font-medium">
                  {upcomingMatches.length} 场
                </span>
              </div>
              <div className="space-y-3">
                {upcomingMatches.slice(0, 3).map((m) => (
                  <a
                    key={m.id}
                    href={`#/matches/${m.id}`}
                    className="flex items-center gap-3 p-2.5 -mx-2 rounded-xl hover:bg-surface-3 transition-colors no-underline group"
                  >
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-lg">⚽</span>
                      <span className="text-[10px] text-text-tertiary font-medium">vs</span>
                      <span className="text-lg">⚽</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-text-primary truncate">
                        {m.homeTeam} vs {m.awayTeam}
                      </div>
                      <div className="text-[10px] text-text-tertiary">{m.date} · {m.time}</div>
                    </div>
                    <ChevronRight size={13} className="text-text-tertiary group-hover:text-accent transition-colors shrink-0" />
                  </a>
                ))}
              </div>
              <a
                href="#/matches"
                className="mt-3 flex items-center justify-center gap-1 w-full py-2 rounded-xl bg-surface-3 border border-border-default text-[11px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all no-underline"
              >
                查看全部赛程
                <ChevronRight size={13} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
