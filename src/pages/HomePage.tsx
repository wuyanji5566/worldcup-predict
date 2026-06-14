import { ArrowRight, Zap, Clock, MapPin, Activity, TrendingUp } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useMatches } from '@/hooks/useMatches'
import { TEAM_FLAGS, TEAM_NAMES_ZH } from '@/utils/constants'
import { useMemo } from 'react'

export function HomePage() {
  const { matches, liveMatches, finishedMatches, upcomingMatches } = useMatches()

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const todayMatches = useMemo(() => matches.filter((m) => m.date === todayStr), [matches, todayStr])
  const todayDate = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }, [])

  const liveCount = liveMatches.length
  const finishedCount = finishedMatches.filter((m) => m.date === todayStr).length

  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* ===== MESH GRADIENT BACKGROUND ===== */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[#020617]" />
        <div className="mesh-blob-1 absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-cyan-500/8 blur-[120px]" />
        <div className="mesh-blob-2 absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-indigo-500/6 blur-[100px]" />
        <div className="mesh-blob-3 absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-amber-500/3 blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 lg:px-8 pt-10 md:pt-16 lg:pt-20 pb-28 lg:pb-12">
        {/* ===== HERO ===== */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 glow-dot" />
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-[0.15em]">
              {todayDate} · {liveCount > 0 ? `${liveCount} 场进行中` : `${todayMatches.length} 场比赛`}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-4">
            <span className="text-gradient-hero">今日赛事</span>
          </h1>

          <p className="max-w-xl mx-auto text-sm md:text-base text-slate-400 leading-relaxed mb-6">
            {liveCount > 0
              ? `${liveCount} 场比赛正在直播，实时比分自动更新`
              : finishedCount > 0
                ? `今日 ${finishedCount} 场比赛已完赛，查看最新赛果`
                : `今日 ${todayMatches.length} 场比赛即将开赛，点击预测比分`}
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="#/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-slate-950 rounded-xl font-bold text-sm hover:bg-cyan-400 transition-all btn-glow-cyan no-underline active:scale-95">
              <Zap size={16} />进入智能终端<ArrowRight size={16} />
            </a>
            <a href="#/matches" className="inline-flex items-center gap-2 px-6 py-3 glass-card rounded-xl font-semibold text-sm text-slate-300 hover:text-white no-underline active:scale-95">
              查看全部赛程
            </a>
          </div>
        </div>

        {/* ===== DATA STREAM ===== */}
        <div className="flex items-center justify-center gap-2 mb-8 md:mb-10">
          <div className="data-stream w-16 md:w-24" />
          <span className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em] flex items-center gap-1.5">
            <Activity size={12} className="text-emerald-500" />
            Live Data Pipeline · ESPN
          </span>
          <div className="data-stream w-16 md:w-24" />
        </div>

        {/* ===== TODAY'S MATCHES ===== */}
        {todayMatches.length > 0 ? (
          <div className="space-y-3 mb-10">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <TrendingUp size={15} className="text-accent" />
                {todayDate} 实时赛况
              </h2>
              <a href="#/matches" className="text-[11px] text-accent hover:text-cyan-400 no-underline">
                全部比赛 →
              </a>
            </div>
            {todayMatches.map((m) => {
              const isLive = m.status === 'live'
              const isFinished = m.status === 'finished'
              const homeName = TEAM_NAMES_ZH[m.homeTeam] ?? m.homeTeam
              const awayName = TEAM_NAMES_ZH[m.awayTeam] ?? m.awayTeam
              const homeFlag = TEAM_FLAGS[m.homeTeam] ?? '⚽'
              const awayFlag = TEAM_FLAGS[m.awayTeam] ?? '⚽'

              return (
                <a
                  key={m.id}
                  href={`#/matches/${m.id}`}
                  className={cn(
                    'block glass-card rounded-2xl p-4 md:p-5 no-underline group',
                    isLive && 'border-emerald-500/20',
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {isLive && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse" />LIVE
                        </span>
                      )}
                      {isFinished && (
                        <span className="text-[10px] font-medium text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">已结束</span>
                      )}
                      {!isLive && !isFinished && (
                        <span className="text-[10px] font-medium text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">即将开始</span>
                      )}
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock size={10} />{m.time}
                      </span>
                      {m.group && <span className="text-[10px] text-slate-600">{m.group}组</span>}
                    </div>
                    {isLive && <span className="text-[10px] text-accent font-medium group-hover:underline">预测 →</span>}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl md:text-3xl shrink-0">{homeFlag}</span>
                      <span className="text-sm md:text-base font-semibold text-white truncate">{homeName}</span>
                    </div>

                    <div className="px-4 md:px-6 shrink-0">
                      {isLive || isFinished ? (
                        <div className="flex items-center gap-2 md:gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                          <span className={cn('text-xl md:text-2xl font-bold font-mono tabular-nums', isLive && 'score-flash')}>
                            {m.homeScore ?? 0}
                          </span>
                          <span className="text-slate-500 font-bold">:</span>
                          <span className={cn('text-xl md:text-2xl font-bold font-mono tabular-nums', isLive && 'score-flash')}>
                            {m.awayScore ?? 0}
                          </span>
                        </div>
                      ) : (
                        <span className="text-base md:text-lg font-black text-slate-600 tracking-widest">VS</span>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-3 flex-1 min-w-0">
                      <span className="text-sm md:text-base font-semibold text-white truncate">{awayName}</span>
                      <span className="text-2xl md:text-3xl shrink-0">{awayFlag}</span>
                    </div>
                  </div>

                  {m.stadium && (
                    <div className="mt-2 text-[10px] text-slate-600 flex items-center gap-1">
                      <MapPin size={10} />{m.stadium}
                    </div>
                  )}
                </a>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 mb-10">
            <Clock size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">今日暂无比赛</p>
            <a href="#/matches" className="inline-block mt-3 text-accent text-xs hover:underline">查看未来赛程 →</a>
          </div>
        )}

        {/* ===== UPCOMING ===== */}
        {upcomingMatches.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
              <Clock size={15} className="text-amber-400" />
              即将开赛
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {upcomingMatches.slice(0, 4).map((m) => {
                const homeFlag = TEAM_FLAGS[m.homeTeam] ?? '⚽'
                const awayFlag = TEAM_FLAGS[m.awayTeam] ?? '⚽'
                const homeName = TEAM_NAMES_ZH[m.homeTeam] ?? m.homeTeam
                const awayName = TEAM_NAMES_ZH[m.awayTeam] ?? m.awayTeam
                return (
                  <a key={m.id} href={`#/matches/${m.id}`} className="glass-card rounded-xl p-3 text-center no-underline hover:border-accent/20 transition-all group">
                    <div className="text-[10px] text-slate-500 mb-1">{m.time}</div>
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200 mb-1">
                      <span className="text-base">{homeFlag}</span>
                      <span className="truncate max-w-[60px]">{homeName}</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-600 my-1">VS</div>
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200">
                      <span className="truncate max-w-[60px]">{awayName}</span>
                      <span className="text-base">{awayFlag}</span>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {/* ===== FOOTER ===== */}
        <div className="border-t border-white/5 pt-6 text-center">
          <p className="text-slate-500 text-[11px] leading-relaxed max-w-2xl mx-auto">
            【量化风控免责声明】本终端所呈现之胜负概率及比分预测，均基于 AI 多模态演算与 ELO 结构化数据模型，属于量化实验性质，不作为任何买彩指导。理性观赛，风险自负。
          </p>
          <p className="text-slate-700 text-[10px] mt-2 font-mono flex items-center justify-center gap-2">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            &copy; 2026 World Cup Quantitative Terminal · 数据来自 ESPN
          </p>
        </div>
      </div>
    </div>
  )
}
