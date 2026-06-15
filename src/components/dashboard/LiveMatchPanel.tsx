import { useLiveData } from '@/context/LiveDataContext'
import { useLiveSoccerData } from '@/hooks/useLiveSoccerData'
import { Button } from '@/components/ui/Button'
import { Play, Square, RotateCcw, TrendingUp, Wifi, WifiOff, Activity } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useEffect, useMemo, useState, useRef } from 'react'
import { useLiveNotifications } from '@/hooks/useLiveNotifications'
import { NotificationsOverlay } from './NotificationsOverlay'
import { formatCST } from '@/utils/time'
import { useMatchStore } from '@/store/matchStore'
import { useLiveSyncStore } from '@/services/liveSync'

export function LiveMatchPanel() {
  const {
    match, probability, isRunning, isLive,
    startSimulation, stopSimulation, resetSimulation,
  } = useLiveData()
  const matchesById = useMatchStore((s) => s.matches)
  const setMatchFromReal = useLiveSyncStore((s) => s.setMatchFromReal)

  const primaryMatch = useMemo(() => {
    const matches = Object.values(matchesById)
    return matches.find((item) => item.status === 'live')
      ?? matches
        .filter((item) => item.status === 'scheduled')
        .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))[0]
      ?? matches
        .filter((item) => item.status === 'finished')
        .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))[0]
      ?? null
  }, [matchesById])

  // Keep the panel aligned with the authoritative match store.
  useEffect(() => {
    if (primaryMatch && !isRunning) setMatchFromReal(primaryMatch)
  }, [primaryMatch, isRunning, setMatchFromReal])

  const { pollState, isStale, secondsSinceLastPoll } = useLiveSoccerData()
  const {
    goalToasts, dismissGoalToast,
    showConfetti, dismissConfetti, settlementMessage,
  } = useLiveNotifications()

  const [clock, setClock] = useState('00:00')
  const [flashHome, setFlashHome] = useState(false)
  const [flashAway, setFlashAway] = useState(false)
  const prevHome = useRef(match.liveScore.home)
  const prevAway = useRef(match.liveScore.away)

  // ---- Score flash on goal ----
  useEffect(() => {
    if (match.liveScore.home > prevHome.current) { setFlashHome(true); setTimeout(() => setFlashHome(false), 1700) }
    if (match.liveScore.away > prevAway.current) { setFlashAway(true); setTimeout(() => setFlashAway(false), 1700) }
    prevHome.current = match.liveScore.home
    prevAway.current = match.liveScore.away
  }, [match.liveScore.home, match.liveScore.away])

  // ---- Live clock ----
  useEffect(() => {
    if (!isLive) return
    const t = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (match.startedAt ?? Date.now())) / 60000)
      setClock(`${String(Math.min(elapsed, match.currentMinute)).padStart(2, '0')}:${String(Math.floor(((Date.now() - (match.startedAt ?? Date.now())) % 60000) / 1000)).padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(t)
  }, [isLive, match.startedAt, match.currentMinute])

  return (
    <div className={cn(
      'relative overflow-hidden rounded-3xl border-2 transition-all duration-1000',
      isLive
        ? 'live-heartbeat bg-surface-2/80'
        : 'border-white/5 bg-surface-2',
    )}>
      {/* Ambient glow */}
      {isLive && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        </>
      )}

      <div className="relative p-4 md:p-5">
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            {/* Cyber heartbeat dot */}
            <div className="relative flex items-center">
              {isLive && (
                <span className="absolute inset-0 rounded-full bg-emerald-400/30 live-ring" />
              )}
              <span className="relative flex h-3 w-3">
                {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
                <span className={cn('relative inline-flex rounded-full h-3 w-3', isLive ? 'bg-emerald-400' : 'bg-slate-600')} />
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Activity size={15} className={isLive ? 'text-emerald-400' : 'text-slate-500'} />
                比赛实时同步
                {isLive && match.currentMinute > 0 && (
                  <span className="text-emerald-400 font-mono text-xs bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 animate-pulse">
                    [{match.currentMinute}&apos;]
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                {match.homeTeam.nameZh} vs {match.awayTeam.nameZh} · {formatCST(match.kickoffTime, 'M月D日')}
              </p>
            </div>
          </div>

          {/* Status + Clock */}
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border',
              isLive ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400' :
              match.status === 'FINISHED' ? 'bg-slate-800/50 border-slate-700/30 text-slate-400' :
              'bg-slate-800/50 border-slate-700/30 text-slate-400',
            )}>
              {match.status === 'UPCOMING' ? '未开始'
                : match.status === 'LIVE' ? 'LIVE'
                : match.status === 'HT' ? 'HT' : '已结束'}
            </span>
            {isLive && (
              <span className="text-sm font-black font-mono text-emerald-300 tabular-nums bg-slate-800/60 px-2 py-0.5 rounded-lg">
                {isLive ? clock : '00:00'}
              </span>
            )}
          </div>
        </div>

        {/* ===== SCOREBOARD ===== */}
        <div className={cn(
          'flex items-center justify-center gap-3 md:gap-5 py-6 rounded-2xl mb-4 transition-all duration-700',
          isLive ? 'bg-slate-800/40' : 'bg-slate-800/20',
        )}>
          <div className="text-center flex-1">
            <span className="text-3xl md:text-4xl block mb-1">{match.homeTeam.flag}</span>
            <div className="text-[11px] md:text-xs font-semibold text-slate-300">{match.homeTeam.nameZh}</div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className={cn(
              'text-4xl md:text-5xl font-black font-mono tabular-nums px-4 py-3 rounded-2xl transition-all duration-300',
              flashHome ? 'score-flash' : '',
              isLive ? 'text-white bg-slate-800/50' : 'text-slate-500',
            )}>
              {match.liveScore.home}
            </span>
            <span className="text-slate-600 font-bold text-2xl">:</span>
            <span className={cn(
              'text-4xl md:text-5xl font-black font-mono tabular-nums px-4 py-3 rounded-2xl transition-all duration-300',
              flashAway ? 'score-flash' : '',
              isLive ? 'text-white bg-slate-800/50' : 'text-slate-500',
            )}>
              {match.liveScore.away}
            </span>
          </div>

          <div className="text-center flex-1">
            <span className="text-3xl md:text-4xl block mb-1">{match.awayTeam.flag}</span>
            <div className="text-[11px] md:text-xs font-semibold text-slate-300">{match.awayTeam.nameZh}</div>
          </div>
        </div>

        {/* ===== PROBABILITY BARS — transition-all duration-700 ease-out ===== */}
        <div className="space-y-2.5 mb-4">
          {[
            { label: `${match.homeTeam.nameZh} 主胜`, v: probability.live.homeWin, b: probability.baseline.homeWin, color: 'bg-red-500/60' },
            { label: '平局', v: probability.live.draw, b: probability.baseline.draw, color: 'bg-amber-500/50' },
            { label: `${match.awayTeam.nameZh} 客胜`, v: probability.live.awayWin, b: probability.baseline.awayWin, color: 'bg-cyan-400/70' },
          ].map((bar) => {
            const changed = bar.v !== bar.b
            const up = bar.v > bar.b
            return (
              <div key={bar.label} className="flex items-center gap-2 text-[10px]">
                <span className="w-20 text-slate-500 shrink-0">{bar.label}</span>
                <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700 ease-out', bar.color)}
                    style={{ width: `${bar.v}%` }}
                  />
                </div>
                <span className={cn(
                  'w-10 text-right font-mono font-bold transition-colors duration-700',
                  changed ? (up ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-400',
                )}>
                  {bar.v}%
                </span>
                {changed && <TrendingUp size={10} className={up ? 'text-emerald-400' : 'text-rose-400 rotate-180'} />}
              </div>
            )
          })}
        </div>

        {/* ===== LIVE EVENT TICKER ===== */}
        {match.liveEvents.length > 0 && (
          <div className="mb-4 overflow-hidden rounded-xl bg-slate-800/30 border border-white/5">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">实时战报</span>
              <span className="text-[9px] text-slate-600 ml-auto">{match.liveEvents.length} 条</span>
            </div>
            {/* Ticker */}
            <div className="relative overflow-hidden py-2">
              <div className="ticker-track flex gap-6 px-4 whitespace-nowrap">
                {[...match.liveEvents, ...match.liveEvents].map((evt, i) => (
                  <span key={`${evt.id}-${i}`} className={cn(
                    'text-[11px] shrink-0 font-medium',
                    evt.type === 'GOAL' && 'text-amber-300',
                    evt.type === 'RED_CARD' && 'text-rose-400',
                    evt.type === 'YELLOW_CARD' && 'text-yellow-400',
                    !['GOAL', 'RED_CARD', 'YELLOW_CARD'].includes(evt.type) && 'text-slate-400',
                  )}>
                    [{evt.minute}&apos;] {evt.description}
                    <span className="mx-3 text-slate-700">|</span>
                  </span>
                ))}
              </div>
              {/* Fade edges */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-800/80 to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-800/80 to-transparent pointer-events-none" />
            </div>
          </div>
        )}

        {/* Empty state ticker */}
        {match.liveEvents.length === 0 && isLive && (
          <div className="mb-4 rounded-xl bg-slate-800/20 border border-white/5 px-4 py-3 text-center">
            <span className="text-[11px] text-slate-500">等待实时战报数据...</span>
          </div>
        )}

        {/* ===== AI PREDICTION ===== */}
        {isLive && (
          <div className="mb-4 p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] text-slate-500">预期比分</div>
                <div className="text-sm font-black font-mono text-indigo-300">{probability.live.bestScores}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">置信度</div>
                <div className="text-sm text-amber-400 tracking-wider">
                  {'★'.repeat(probability.live.confidence)}{'☆'.repeat(5 - probability.live.confidence)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">预期总进球</div>
                <div className="text-sm font-black font-mono text-slate-200">
                  {(probability.live.homeGoals + probability.live.awayGoals).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== CONTROLS ===== */}
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <Button variant="primary" size="sm" onClick={() => startSimulation()} className="gap-1.5 flex-1 bg-emerald-500 hover:bg-emerald-600">
              <Play size={13} /> 启动模拟直播
            </Button>
          ) : (
            <Button variant="danger" size="sm" onClick={stopSimulation} className="gap-1.5 flex-1">
              <Square size={13} /> 停止模拟
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={resetSimulation} className="gap-1.5">
            <RotateCcw size={13} /> 重置
          </Button>
        </div>

        {/* ===== POLL STATUS ===== */}
        <div className="flex items-center justify-center gap-3 mt-2.5 text-[10px] text-slate-600">
          <span className="flex items-center gap-1">
            {isStale ? <WifiOff size={10} className="text-amber-500" /> : <Wifi size={10} className="text-emerald-500" />}
            {isStale ? `延迟 (${secondsSinceLastPoll}s)` : '实时同步'}
          </span>
          <span>·</span>
          <span>轮询 #{pollState.pollCount}</span>
        </div>
      </div>

      {/* Notifications overlay */}
      <NotificationsOverlay
        goalToasts={goalToasts} dismissGoalToast={dismissGoalToast}
        showConfetti={showConfetti} dismissConfetti={dismissConfetti}
        settlementMessage={settlementMessage}
      />
    </div>
  )
}
