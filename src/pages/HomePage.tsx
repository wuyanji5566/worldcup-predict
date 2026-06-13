import { ArrowRight, BookOpen, TrendingUp, Database, Users, Activity, ChevronRight, Zap } from 'lucide-react'
import { cn } from '@/utils/cn'

// ---- Achievement Cards Data ----
const achievements = [
  {
    value: '67%+',
    label: 'AI 核心预测准确率',
    icon: TrendingUp,
    accent: 'text-green-400',
    glow: 'text-glow-green',
    trend: '+3.2%',
    trendUp: true,
    sub: '基于 12 层 Transformer 深度推理引擎',
  },
  {
    value: '840+',
    label: '已深度清洗量化赛事',
    icon: Database,
    accent: 'text-cyan-400',
    glow: '',
    trend: '实时同步',
    trendUp: true,
    sub: '覆盖 48 个国家顶级联赛数据源',
  },
  {
    value: '4,199+',
    label: '全网超级个体智囊',
    icon: Users,
    accent: 'text-indigo-400',
    glow: '',
    trend: '+128 今日',
    trendUp: true,
    sub: '群体智慧超越单一模型预测上限',
  },
  {
    value: '24/7',
    label: '全天候无休数据流同步',
    icon: Activity,
    accent: 'text-amber-400',
    glow: '',
    trend: '运行中',
    trendUp: true,
    sub: '毫秒级实时赛事赔率与气象数据抓取',
  },
]

export function HomePage() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* ================================================================
          MESH GRADIENT BACKGROUND — ultra-dark with cyan/indigo blobs
          ================================================================ */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {/* Deep base */}
        <div className="absolute inset-0 bg-[#020617]" />

        {/* Top-left: Cyan nebula */}
        <div className="mesh-blob-1 absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-cyan-500/8 blur-[120px]" />

        {/* Top-right: Indigo glow */}
        <div className="mesh-blob-2 absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-indigo-500/6 blur-[100px]" />

        {/* Bottom-center: Warm amber */}
        <div className="mesh-blob-3 absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-amber-500/3 blur-[130px]" />

        {/* Center-right: Subtle emerald spark */}
        <div className="absolute top-1/2 right-[10%] w-[300px] h-[300px] rounded-full bg-emerald-500/4 blur-[100px]" />

        {/* Micro grid lines for terminal feel */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ================================================================
          MAIN CONTENT
          ================================================================ */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20 lg:py-28">
        {/* ---- HERO TITLE SECTION ---- */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 glow-dot" />
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-[0.15em]">
              AI Quantitative Analytics Terminal
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-5">
            <span className="text-gradient-hero">先知足球</span>
            <span className="text-white/80 mx-2 md:mx-3 font-light">·</span>
            <span className="text-gradient-hero">AI 量化大盘</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-sm md:text-base text-slate-400 leading-relaxed mb-8 font-medium">
            基于麦肯锡 SCQA 结构化框架与顶级 AI 模型，提供全矩阵非对称风险穿透预测。
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="#/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-slate-950 rounded-xl font-bold text-sm hover:bg-cyan-400 transition-all duration-300 btn-glow-cyan no-underline active:scale-95"
            >
              <Zap size={16} />
              进入智能终端
              <ArrowRight size={16} />
            </a>
            <a
              href="#/rules"
              className="inline-flex items-center gap-2 px-6 py-3 glass-card rounded-xl font-semibold text-sm text-slate-300 hover:text-white no-underline active:scale-95"
            >
              <BookOpen size={16} />
              查看分析方法论
            </a>
          </div>
        </div>

        {/* ---- DATA STREAM DECORATION ---- */}
        <div className="flex items-center justify-center gap-2 mb-12 md:mb-16">
          <div className="data-stream w-16 md:w-24" />
          <span className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em]">
            Live Data Pipeline
          </span>
          <div className="data-stream w-16 md:w-24" />
        </div>

        {/* ---- ACHIEVEMENT GRID ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {achievements.map((card, i) => (
            <div
              key={card.label}
              className={cn(
                'glass-card rounded-2xl p-5 md:p-6 cursor-default relative overflow-hidden border-beam',
                'opacity-0 animate-fade-up',
              )}
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'forwards' }}
            >
              {/* Card icon + trend */}
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center',
                  'bg-white/5',
                )}>
                  <card.icon size={18} className={card.accent} />
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    card.trendUp ? 'bg-green-400 glow-dot' : 'bg-slate-500',
                  )} />
                  <span className="text-[10px] text-slate-500 font-mono">{card.trend}</span>
                </div>
              </div>

              {/* Value */}
              <div className={cn(
                'text-3xl md:text-4xl font-black font-mono tracking-tighter mb-1.5',
                card.glow || 'text-white',
              )}>
                {card.value}
              </div>

              {/* Label */}
              <div className="text-xs md:text-[13px] font-semibold text-slate-300 mb-1.5">
                {card.label}
              </div>

              {/* Sub-description */}
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {card.sub}
              </p>
            </div>
          ))}
        </div>

        {/* ---- BOTTOM HINT ---- */}
        <div className="text-center mt-14 md:mt-20">
          <a
            href="#/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors no-underline group"
          >
            <span>向下滚动探索完整数据面板</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Disclaimer Footer */}
        <div className="mt-16 border-t border-white/5 pt-6">
          <p className="text-slate-500 text-[11px] text-center tracking-wide leading-relaxed max-w-2xl mx-auto">
            【量化风控免责声明】本智能终端所呈现之胜负概率、综合修正曲线及比分预测，
            均基于 AI 多模态演算与麦肯锡 MECE 结构化数据模型，属于量化实验性质，
            不作为任何买彩指导。理性观赛，非对称风险自负。
          </p>
          <p className="text-slate-700 text-[10px] text-center mt-2 font-mono">
            &copy; 2026 World Cup Quantitative Terminal · AI Research Preview
          </p>
        </div>
      </div>
    </div>
  )
}
