import { Star, Zap, TrendingUp, Clock } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { MatchProbability } from '@/data/analysisData'

interface ProbabilityTableProps {
  matches: MatchProbability[]
  blurred?: boolean
}

function CertaintyStars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={cn(
            'transition-all',
            i < count
              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]'
              : 'text-slate-700',
          )}
          fill={i < count ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

function ProbBar({
  value,
  maxValue,
  color,
  isHighest,
}: {
  value: number
  maxValue: number
  color: string
  isHighest: boolean
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-800/80 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            color,
            isHighest && 'shadow-[0_0_8px_rgba(6,182,212,0.5)]',
          )}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <span
        className={cn(
          'text-xs font-bold font-mono tabular-nums w-10 text-right',
          isHighest ? 'text-cyan-300' : 'text-slate-400',
        )}
      >
        {value}%
      </span>
    </div>
  )
}

export function ProbabilityTable({ matches, blurred = false }: ProbabilityTableProps) {
  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-x-auto backdrop-blur-sm">
      {/* ---- Table Header ---- */}
      <div className="grid grid-cols-12 gap-3 px-4 md:px-6 py-3.5 border-b border-white/5 bg-slate-900/80">
        <div className="col-span-3 md:col-span-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
          比赛
        </div>
        <div className="col-span-5 md:col-span-6 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
          胜平负概率分析
        </div>
        <div className="hidden md:block md:col-span-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 text-center">
          最可能比分
          {blurred && <span className="ml-1 text-amber-500/50">🔒</span>}
        </div>
        <div className="col-span-4 md:col-span-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 text-center">
          确定性
        </div>
      </div>

      {/* ---- Table Rows ---- */}
      <div className="divide-y divide-white/5">
        {matches.map((match, idx) => {
          const maxProb = Math.max(match.homeWin, match.draw, match.awayWin)
          const bars = [
            { value: match.homeWin, color: 'bg-red-500/70', isHighest: match.homeWin === maxProb },
            { value: match.draw, color: 'bg-amber-500/60', isHighest: match.draw === maxProb },
            { value: match.awayWin, color: 'bg-cyan-400/80', isHighest: match.awayWin === maxProb },
          ]

          return (
            <div
              key={match.id}
              className="grid grid-cols-12 gap-3 px-4 md:px-6 py-4 items-center hover:bg-slate-800/30 transition-colors group"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Teams */}
              <div className="col-span-3 md:col-span-2 flex items-center gap-2 min-w-0">
                <div className="flex flex-col gap-0.5 shrink-0">
                  <span className="text-sm leading-none">{match.homeFlag}</span>
                  <span className="text-sm leading-none">{match.awayFlag}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] md:text-[13px] font-semibold text-slate-200 truncate">
                    {match.homeTeam}
                  </div>
                  <div className="text-[12px] md:text-[13px] font-semibold text-slate-200 truncate">
                    {match.awayTeam}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={9} className="text-slate-600" />
                    <span className="text-[10px] text-slate-500">{match.kickoff}</span>
                  </div>
                </div>
              </div>

              {/* Probability Bars */}
              <div className="col-span-5 md:col-span-6 space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-600 w-6 shrink-0 font-mono">主</span>
                  <ProbBar {...bars[0]} maxValue={100} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-600 w-6 shrink-0 font-mono">平</span>
                  <ProbBar {...bars[1]} maxValue={100} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-600 w-6 shrink-0 font-mono">客</span>
                  <ProbBar {...bars[2]} maxValue={100} />
                </div>
              </div>

              {/* Best Scores (blurred when locked) */}
              <div className="hidden md:flex md:col-span-2 justify-center">
                {blurred ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/40 border border-slate-700/30 text-xs font-mono text-slate-600 blur-[3px] select-none">
                    <Zap size={10} />
                    {match.bestScores}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/50 text-xs font-mono font-semibold text-cyan-300">
                    <Zap size={10} className="text-amber-400" />
                    {match.bestScores}
                  </span>
                )}
              </div>

              {/* Certainty Stars */}
              <div className="col-span-4 md:col-span-2 flex flex-col items-center gap-1">
                <CertaintyStars count={match.certainty} />
                <span className="text-[10px] text-slate-600 font-mono">
                  {match.certainty}/5
                </span>
                {/* Best scores for mobile (blurred when locked) */}
                <span className={cn(
                  'md:hidden text-[10px] font-mono mt-0.5',
                  blurred ? 'text-slate-600 blur-[3px] select-none' : 'text-cyan-400/80',
                )}>
                  {match.bestScores}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ---- Footer Legend ---- */}
      <div className="px-4 md:px-6 py-2.5 border-t border-white/5 bg-slate-900/40 flex items-center gap-5 text-[10px] text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-500/70" /> 主胜
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/60" /> 平局
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400/80" /> 客胜
        </span>
        <span className="ml-auto flex items-center gap-1">
          <TrendingUp size={10} />
          概率数据基于 AI 模型实时推理 · 仅供参考
        </span>
      </div>
    </div>
  )
}
