import { useState, useEffect, useMemo } from 'react'
import { Flame, MapPin } from 'lucide-react'
import { TEAM_FLAGS, TEAM_NAMES_ZH, STADIUMS } from '@/utils/constants'
import { parseKickoffTime, stadiumTimezone, formatCST } from '@/utils/time'
import { useMatchStore } from '@/store/matchStore'

interface TimeLeft {
  days: number; hours: number; minutes: number; seconds: number
  isExpired: boolean
}

function calcTimeLeft(targetTs: number): TimeLeft {
  const diff = targetTs - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    isExpired: false,
  }
}

function pad(n: number) { return String(n).padStart(2, '0') }

export function CountdownTimer() {
  // Get the next upcoming match from the store
  const matchesById = useMatchStore((s) => s.matches)
  const upcomingMatches = useMemo(
    () => Object.values(matchesById)
      .filter((m) => m.status === 'scheduled')
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)),
    [matchesById],
  )

  const nextMatch = upcomingMatches[0] ?? null
  const [fallbackTarget] = useState(() => Date.now() + 86400000)

  const targetTs = nextMatch
    ? parseKickoffTime(nextMatch.date, nextMatch.time, stadiumTimezone(nextMatch.stadium))
    : fallbackTarget

  const [time, setTime] = useState<TimeLeft>(() => calcTimeLeft(targetTs))

  useEffect(() => {
    const t = setInterval(() => setTime(calcTimeLeft(targetTs)), 1000)
    return () => clearInterval(t)
  }, [targetTs])

  const homeTeam = nextMatch?.homeTeam ?? '—'
  const awayTeam = nextMatch?.awayTeam ?? '—'
  const homeFlag = TEAM_FLAGS[homeTeam] ?? '⚽'
  const awayFlag = TEAM_FLAGS[awayTeam] ?? '⚽'
  const stadiumCn = STADIUMS[nextMatch?.stadium ?? ''] ?? nextMatch?.stadium ?? '—'
  const groupLabel = nextMatch?.group ? `${nextMatch.group} 组` : ''
  const kickoffCST = nextMatch
    ? formatCST(targetTs, 'YYYY年M月D日 HH:mm')
    : '待定'

  return (
    <div className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-gradient-to-r from-rose-950/30 via-surface-2 to-surface-2">
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="relative p-4 md:p-5">
        {/* Alert label */}
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 live-pulse" />
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
              {time.isExpired ? '已开赛' : '即将开赛'}
            </span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <MapPin size={10} />
            {stadiumCn}{groupLabel && ` · ${groupLabel}`}
          </span>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-center gap-4 md:gap-6 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl">{homeFlag}</span>
            <span className="text-sm md:text-base font-bold text-slate-200">
              {TEAM_NAMES_ZH[homeTeam] ?? homeTeam}
            </span>
          </div>
          <span className="text-lg font-black text-slate-600">VS</span>
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-base font-bold text-slate-200">
              {TEAM_NAMES_ZH[awayTeam] ?? awayTeam}
            </span>
            <span className="text-2xl md:text-3xl">{awayFlag}</span>
          </div>
        </div>

        {/* Countdown digits */}
        {!time.isExpired ? (
          <div className="flex items-center justify-center gap-2 md:gap-3">
            {[
              { val: time.days, label: '天' },
              { val: time.hours, label: '时' },
              { val: time.minutes, label: '分' },
              { val: time.seconds, label: '秒' },
            ].map((unit, i) => (
              <div key={unit.label} className="flex items-center gap-2 md:gap-3">
                {i > 0 && <span className="text-slate-600 font-bold text-lg animate-pulse">:</span>}
                <div className="flex flex-col items-center">
                  <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl px-3 py-2 min-w-[48px] md:min-w-[56px] text-center">
                    <span className="text-xl md:text-2xl font-black font-mono text-rose-300 tabular-nums tracking-wider">
                      {pad(unit.val)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 font-medium">{unit.label}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <span className="text-sm font-bold text-rose-400 flex items-center justify-center gap-2">
              <Flame size={16} />
              比赛正在进行中
              <Flame size={16} />
            </span>
          </div>
        )}

        {/* Kickoff time label */}
        <p className="text-center text-[10px] text-slate-600 mt-3">
          开球时间: {kickoffCST} (北京时间 UTC+8)
        </p>
      </div>
    </div>
  )
}
