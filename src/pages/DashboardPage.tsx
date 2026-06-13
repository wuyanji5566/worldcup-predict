import { Trophy, Users, Target, TrendingUp, ChevronRight, Flame } from 'lucide-react'
import { cn } from '@/utils/cn'
import { CountdownTimer } from '@/components/dashboard/CountdownTimer'
import { LiveMatchPanel } from '@/components/dashboard/LiveMatchPanel'
import { lazy, Suspense } from 'react'
import { FeaturedMatch } from '@/components/dashboard/FeaturedMatch'
import { MiniLeaderboard } from '@/components/dashboard/MiniLeaderboard'
const PointsChart = lazy(() => import('@/components/dashboard/PointsChart').then(m => ({ default: m.PointsChart })))
import {
  upcomingMatches,
  pointsHistory,
  topLeaderboard,
  dashboardStats,
  currentUser,
  recentResults,
} from '@/data/mockData'

const stats = [
  { icon: Trophy, label: '总比赛', value: dashboardStats.totalMatches, change: '+48', color: 'text-accent', bg: 'bg-accent/10' },
  { icon: Users, label: '预测玩家', value: dashboardStats.totalPlayers.toLocaleString(), change: '+342', color: 'text-info', bg: 'bg-info/10' },
  { icon: Target, label: '总预测数', value: dashboardStats.totalPredictions, change: '+1.2K', color: 'text-success', bg: 'bg-success/10' },
  { icon: TrendingUp, label: '平均准确率', value: dashboardStats.avgAccuracy, change: '+2.1%', color: 'text-gold', bg: 'bg-gold/10' },
]

export function DashboardPage() {
  const featuredMatch = upcomingMatches[0]

  return (
    <div className="space-y-5 md:space-y-6 animate-fade-in">
      {/* ===== Page Header ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
            仪表盘
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-0.5">
            2026 世界杯实时概览
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-live/10 border border-live/20">
            <span className="w-2 h-2 rounded-full bg-live live-pulse" />
            <span className="text-[11px] font-bold text-live uppercase tracking-wider">
              赛事进行中
            </span>
          </div>
        </div>
      </div>

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
          <FeaturedMatch match={featuredMatch} />

          {/* Points Chart */}
          <Suspense fallback={<div className="h-48 rounded-2xl bg-surface-2 animate-pulse" />}>
            <PointsChart data={pointsHistory} />
          </Suspense>

          {/* Recent Results Row */}
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
                  <div className="text-[10px] text-text-tertiary mb-1">{r.group}</div>
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
        </div>

        {/* --- Right Column (1/3): Leaderboard + Upcoming --- */}
        <div className="space-y-5 md:space-y-6">
          {/* Mini Leaderboard */}
          <MiniLeaderboard entries={topLeaderboard} currentUser={currentUser} />

          {/* Upcoming Matches Quick List */}
          <div className="bg-surface-2 border border-border-default rounded-2xl p-5 card-lift">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary">即将开赛</h3>
              <span className="text-[10px] text-text-tertiary font-medium">
                {upcomingMatches.length} 场
              </span>
            </div>
            <div className="space-y-3">
              {upcomingMatches.slice(1, 4).map((m) => (
                <a
                  key={m.id}
                  href={`#/matches/${m.id}`}
                  className="flex items-center gap-3 p-2.5 -mx-2 rounded-xl hover:bg-surface-3 transition-colors no-underline group"
                >
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-lg">{m.homeFlag}</span>
                    <span className="text-[10px] text-text-tertiary font-medium">vs</span>
                    <span className="text-lg">{m.awayFlag}</span>
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
        </div>
      </div>
    </div>
  )
}
