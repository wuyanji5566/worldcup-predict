import { MapPin, Clock, AlertCircle, RefreshCw, Lock, CreditCard, QrCode, Crown } from 'lucide-react'
import type { CachedMatch } from '@/types/match'
import { TEAM_FLAGS, TEAM_NAMES_ZH, STAGE_LABELS, STADIUMS } from '@/utils/constants'
import { useMatches } from '@/hooks/useMatches'
import { useUnlock } from '@/hooks/useUnlock'
import { useState } from 'react'
import { cn } from '@/utils/cn'
import { formatMatchTimeOnlyCST } from '@/utils/time'

export function MatchesPage() {
  const { matches, liveMatches, upcomingMatches, finishedMatches, isLoading, error, refresh } = useMatches()
  const { credits, isUnlocked, addCredits } = useUnlock()
  const [filter, setFilter] = useState<'all' | 'live' | 'scheduled' | 'finished'>('all')
  const [showPayModal, setShowPayModal] = useState(false)
  const [showQR, setShowQR] = useState(true)
  const [plan, setPlan] = useState<'single' | 'member'>('single')

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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">赛事预测</h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            {isLoading ? '加载中...' : `${matches.length} 场比赛`}
            {credits > 0 && <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">剩余 {credits} 次</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isUnlocked && (
            <button onClick={() => setShowPayModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer">
              <Lock size={13} />付费解锁
            </button>
          )}
          <button onClick={refresh} disabled={isLoading} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2 border border-border-default text-xs font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPayModal(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/50 rounded-2xl p-6 animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-white mb-4">解锁赛事预测</h3>

            {/* Plan Selector */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setPlan('single')}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all cursor-pointer ${
                  plan === 'single' ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-800/30 border-transparent hover:bg-slate-800/50'
                }`}
              >
                <span className={`text-lg font-black font-mono ${plan === 'single' ? 'text-cyan-400' : 'text-slate-400'}`}>￥39.9</span>
                <span className={`text-[10px] ${plan === 'single' ? 'text-cyan-400' : 'text-slate-500'}`}>单次解锁</span>
              </button>
              <button
                onClick={() => setPlan('member')}
                className={`relative flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all cursor-pointer ${
                  plan === 'member' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/30 border-transparent hover:bg-slate-800/50'
                }`}
              >
                <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-[9px] text-amber-400 font-bold">推荐</span>
                <span className={`text-lg font-black font-mono ${plan === 'member' ? 'text-amber-400' : 'text-slate-400'}`}>￥399</span>
                <span className={`text-[10px] ${plan === 'member' ? 'text-amber-400' : 'text-slate-500'}`}>包月无限</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              {plan === 'member'
                ? <><Crown size={11} className="inline text-amber-400 mr-1" />全月无限解锁，含实时比分、概率分析、麦肯锡洞察</>
                : <>解锁 1 次，查看完整比分与赛事详情</>
              }
            </p>

            {/* QR Code Toggle */}
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full flex items-center justify-center gap-2 py-2.5 mb-3 rounded-xl bg-slate-800/40 border border-slate-700/30 text-[11px] text-slate-400 hover:text-slate-300 transition-all cursor-pointer"
            >
              <QrCode size={14} />
              {showQR ? '收起收款码' : '微信扫码支付'}
            </button>

            {showQR && (
              <div className="mb-4 p-4 rounded-xl bg-white flex items-center justify-center">
                <img src="/wechat-pay.jpg" alt="微信收款码" className="w-48 h-48 object-contain rounded-lg" />
              </div>
            )}

            <button
              onClick={() => {
                if (plan === 'member') { addCredits(999, true); setShowPayModal(false); }
                else { addCredits(1); setShowPayModal(false); }
              }}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm cursor-pointer active:scale-[0.98] ${
                plan === 'member'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950'
                  : 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950'
              }`}
            >
              <CreditCard size={16} />
              我已完成支付 · ￥{plan === 'member' ? '399' : '39.9'}
            </button>
            <p className="text-[10px] text-slate-600 text-center mt-2">扫码支付后点击上方按钮</p>
          </div>
        </div>
      )}

      {/* Locked overlay hint */}
      {!isUnlocked && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-400/80 text-xs">
          <Lock size={13} />
          付费解锁后可查看实时比分与赛事详情 · ￥39.9 / 1次
        </div>
      )}

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
          <MatchRow key={match.id} match={match} locked={!isUnlocked} />
        ))}
      </div>
    </div>
  )
}

function MatchRow({ match, locked }: { match: CachedMatch; locked: boolean }) {
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
          {formatMatchTimeOnlyCST(match.date, match.time, match.stadium)}
          <span className="text-[10px] text-text-muted ml-0.5">(北京)</span>
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
          {locked ? (
            <span className="text-lg font-bold text-slate-600">🔒</span>
          ) : isLive || match.status === 'finished' ? (
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
        {locked ? (
          <span className="text-[12px] font-medium text-amber-400/60 flex items-center gap-1">
            <Lock size={10} />付费查看
          </span>
        ) : (
          <a
            href={`#/matches/${match.id}`}
            className="text-[12px] font-medium text-accent hover:text-cyan-400 transition-colors no-underline"
          >
            预测比分 →
          </a>
        )}
      </div>
    </div>
  )
}
