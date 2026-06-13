import { useState } from 'react'
import { ChevronDown, Brain, Lightbulb, AlertTriangle, Puzzle } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { McKinseyInsight } from '@/data/analysisData'

const insightIcons: Record<number, React.ReactNode> = {
  1: <Brain size={18} className="text-emerald-400" />,
  2: <Lightbulb size={18} className="text-amber-400" />,
  3: <AlertTriangle size={18} className="text-rose-400" />,
  4: <Puzzle size={18} className="text-cyan-400" />,
}

const insightAccents: Record<number, string> = {
  1: 'border-l-emerald-500/60 bg-emerald-500/3',
  2: 'border-l-amber-500/60 bg-amber-500/3',
  3: 'border-l-rose-500/60 bg-rose-500/3',
  4: 'border-l-cyan-500/60 bg-cyan-500/3',
}

interface McKinseyPanelProps {
  insights: McKinseyInsight[]
}

export function McKinseyPanel({ insights }: McKinseyPanelProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
      {/* ---- Header (clickable toggle) ---- */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 md:px-6 py-4 hover:bg-slate-800/20 transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <span className="text-xl">🧠</span>
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-slate-100">
              麦肯锡结构化战略决策洞察
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
              SCQA Framework · 4 Key Findings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600 font-mono hidden sm:block">
            {expanded ? '收起' : '展开'}
          </span>
          <ChevronDown
            size={18}
            className={cn(
              'text-slate-500 transition-transform duration-300',
              expanded && 'rotate-180',
            )}
          />
        </div>
      </button>

      {/* ---- Expandable Content ---- */}
      <div
        className={cn(
          'grid transition-all duration-400 ease-out overflow-hidden',
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 md:px-6 pb-5 space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={cn(
                  'border-l-2 rounded-r-xl pl-4 pr-3 py-3 transition-all hover:brightness-110',
                  insightAccents[insight.id],
                )}
              >
                {/* Title row */}
                <div className="flex items-center gap-2 mb-1.5">
                  {insightIcons[insight.id]}
                  <span className="text-lg leading-none">{insight.icon}</span>
                  <span className="text-[13px] font-bold text-slate-200">
                    {insight.title}
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    {insight.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-500 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Body */}
                <p className="text-[12px] md:text-[13px] text-slate-400 leading-relaxed">
                  {insight.body}
                </p>
              </div>
            ))}
          </div>

          {/* ---- Footer CTA ---- */}
          <div className="px-5 md:px-6 pb-5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-white/5">
              <span className="text-[11px] text-slate-500">
                以上分析基于麦肯锡 SCQA 框架，结合 AI 模型输出与人类专家研判
              </span>
              <span className="text-[10px] text-slate-700 font-mono">v2.4.1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
