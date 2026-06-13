import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePredictions } from '@/hooks/usePredictions'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { LogOut, Play, Zap, Target, Award, TrendingUp, BarChart3, Brain, Sparkles, Cpu, Database, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/utils/cn'
import {
  runBatchSettlement,
  seedMockPredictions,
  JUNE14_RESULTS,
} from '@/services/settlementEngine'
import { setDeepSeekApiKey, predictMatchWithAI, type AIMatchAnalysis } from '@/services/deepseekApi'
import { getItem, setItem } from '@/utils/storage'
import { initSupabase, getSupabase, type SupabaseConfig } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { DevSimulationSummary } from '@/services/types'

const DEEPSEEK_KEY_STORAGE = 'deepseek_api_config'

export function ProfilePage() {
  const { user, isLoggedIn, logout, openAuthModal } = useAuth()
  const { myPredictions } = usePredictions()
  const { entries } = useLeaderboard()
  const [simRunning, setSimRunning] = useState(false)
  const [simSummary, setSimSummary] = useState<DevSimulationSummary | null>(null)

  // DeepSeek API Key state
  const savedConfig = getItem<{ apiKey?: string } | null>(DEEPSEEK_KEY_STORAGE, null)
  const [apiKeyInput, setApiKeyInput] = useState(savedConfig?.apiKey ?? '')
  const [apiKeySaved, setApiKeySaved] = useState(!!savedConfig?.apiKey)
  const [aiPredicting, setAiPredicting] = useState(false)
  const [aiResult, setAiResult] = useState<AIMatchAnalysis | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  // Supabase config state
  const savedSb = getItem<SupabaseConfig | null>('supabase_config', null)
  const [sbUrl, setSbUrl] = useState(savedSb?.url ?? '')
  const [sbKey, setSbKey] = useState(savedSb?.anonKey ?? '')
  const [sbConnected, setSbConnected] = useState(!!getSupabase())
  const setAuthProvider = useAuthStore((s) => s.setAuthProvider)

  const handleSaveSupabase = () => {
    if (!sbUrl || !sbKey) return
    initSupabase({ url: sbUrl, anonKey: sbKey })
    setSbConnected(true)
    setAuthProvider('supabase')
  }

  const handleSaveApiKey = () => {
    setDeepSeekApiKey(apiKeyInput)
    setItem(DEEPSEEK_KEY_STORAGE, { apiKey: apiKeyInput })
    setApiKeySaved(true)
    setAiError(null)
  }

  const handleAiPredict = async () => {
    if (!apiKeyInput) return
    setAiPredicting(true)
    setAiError(null)
    setAiResult(null)
    setDeepSeekApiKey(apiKeyInput)
    const res = await predictMatchWithAI('巴西', '摩洛哥')
    if (res.ok && res.analysis) {
      setAiResult(res.analysis)
    } else {
      setAiError(res.error ?? '未知错误')
    }
    setAiPredicting(false)
  }

  if (!isLoggedIn || !user) {
    return (
      <EmptyState
        icon="👤"
        title="请先登录"
        description="登录后查看个人数据和预测记录"
        actionLabel="去登录"
        onAction={() => openAuthModal('login')}
      />
    )
  }

  const totalPoints = myPredictions.reduce((sum, p) => sum + (p.points ?? 0), 0)
  const settled = myPredictions.filter((p) => p.points !== null)
  const exact10 = settled.filter((p) => p.basePoints === 10).length
  const goalDiff5 = settled.filter((p) => p.basePoints === 5).length
  const outcome3 = settled.filter((p) => p.basePoints === 3).length

  const myRank = entries.find((e) => e.userId === user.id)

  const handleSimulate = () => {
    setSimRunning(true)
    // Small delay to show spinner
    setTimeout(() => {
      seedMockPredictions()
      const summary = runBatchSettlement(JUNE14_RESULTS)
      setSimSummary(summary)
      setSimRunning(false)
    }, 800)
  }

  return (
    <div className="space-y-5 max-w-lg animate-fade-in">
      {/* Profile header */}
      <div className="bg-surface-2 border border-white/5 rounded-2xl p-6 text-center">
        <span className="text-5xl mb-3 block">{user.avatar}</span>
        <h2 className="text-xl font-bold text-slate-100">{user.displayName}</h2>
        <p className="text-sm text-slate-500">@{user.username}</p>
        <Button variant="ghost" size="sm" onClick={logout} className="mt-3 text-rose-400 hover:text-rose-300">
          <LogOut size={14} /> 退出登录
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '排行榜排名', value: myRank ? `#${myRank.rank}` : '-', color: 'text-amber-400' },
          { label: '总积分', value: totalPoints, color: 'text-cyan-400' },
          { label: '总预测', value: myPredictions.length, color: 'text-slate-100' },
          { label: '已结算', value: settled.length > 0 ? `${Math.round((settled.length / Math.max(myPredictions.length, 1)) * 100)}%` : '-', color: 'text-slate-100' },
        ].map((s) => (
          <div key={s.label} className="bg-surface-2 border border-white/5 rounded-xl p-4 text-center card-lift">
            <div className={cn('text-2xl font-bold font-mono', s.color)}>{s.value}</div>
            <div className="text-[11px] text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Detail stats with new scoring tiers */}
      <div className="bg-surface-2 border border-white/5 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-200 mb-3">预测详情 (新计分规则)</h3>
        <div className="space-y-2.5">
          {[
            { icon: Target, label: '精确命中 (10分)', value: exact10, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
            { icon: TrendingUp, label: '净胜球正确 (5分)', value: goalDiff5, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
            { icon: Award, label: '胜负正确 (3分)', value: outcome3, color: 'text-blue-400', bg: 'bg-blue-500/5' },
          ].map((row) => (
            <div key={row.label} className={cn('flex justify-between items-center px-3 py-2 rounded-lg text-sm', row.bg)}>
              <span className="text-slate-400 flex items-center gap-2">
                <row.icon size={13} className={row.color} />
                {row.label}
              </span>
              <span className={cn('font-bold font-mono', row.color)}>{row.value} 场</span>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Supabase CONFIG ---- */}
      <div className="bg-surface-2 border border-emerald-500/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Database size={16} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">Supabase 数据库</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              {sbConnected ? '已连接' : '未配置 — 使用本地模式'}
            </p>
          </div>
          <div className="ml-auto">
            <span className={cn(
              'flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border',
              sbConnected
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                : 'bg-slate-500/5 border-slate-500/20 text-slate-400',
            )}>
              {sbConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
              {sbConnected ? '云端模式' : '本地模式'}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <input
            type="text" value={sbUrl}
            onChange={(e) => setSbUrl(e.target.value)}
            placeholder="Supabase Project URL (https://xxx.supabase.co)"
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
          />
          <input
            type="password" value={sbKey}
            onChange={(e) => setSbKey(e.target.value)}
            placeholder="anon public key"
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-600">
            app.supabase.com → 创建项目 → Settings → API
          </p>
          <Button variant="secondary" size="sm" onClick={handleSaveSupabase} disabled={!sbUrl || !sbKey}>
            连接
          </Button>
        </div>
      </div>

      {/* ---- DeepSeek API CONFIG ---- */}
      <div className="bg-surface-2 border border-indigo-500/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Brain size={16} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">DeepSeek AI 引擎</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              {apiKeySaved ? 'API Key 已配置' : '需要 DeepSeek API Key'}
            </p>
          </div>
          <div className="ml-auto">
            <span className={cn(
              'flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border',
              apiKeySaved
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                : 'bg-slate-500/5 border-slate-500/20 text-slate-400',
            )}>
              <Cpu size={10} />
              {apiKeySaved ? 'deepseek-chat' : '未连接'}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => { setApiKeyInput(e.target.value); setApiKeySaved(false) }}
            placeholder="sk-xxxxxxxxxxxxxxxx"
            className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 font-mono"
          />
          <Button variant="secondary" size="sm" onClick={handleSaveApiKey} disabled={!apiKeyInput}>
            保存
          </Button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-slate-600">
            platform.deepseek.com → API Keys → 复制 sk- 开头的 key
          </p>
        </div>

        {/* AI Predict test */}
        <Button
          variant="primary"
          loading={aiPredicting}
          onClick={handleAiPredict}
          disabled={!apiKeyInput}
          className="w-full gap-2 bg-indigo-500 hover:bg-indigo-400 text-white"
        >
          <Sparkles size={14} />
          测试 AI 预测 (巴西 vs 摩洛哥)
        </Button>

        {/* AI Result */}
        {aiError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-[11px] text-rose-400 animate-fade-in">
            {aiError}
          </div>
        )}

        {aiResult && (
          <div className="mt-3 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 animate-fade-in space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain size={14} className="text-indigo-400" />
                <span className="text-xs font-bold text-slate-200">AI 预测结果</span>
              </div>
              <span className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                aiResult.riskLevel === '低' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
                aiResult.riskLevel === '中' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' :
                'bg-rose-500/5 border-rose-500/20 text-rose-400',
              )}>
                风险: {aiResult.riskLevel}
              </span>
            </div>

            {/* Predicted score */}
            <div className="flex items-center justify-center gap-4 py-3 bg-slate-800/30 rounded-xl">
              <div className="text-center">
                <div className="text-[10px] text-slate-500 mb-0.5">{aiResult.homeTeam}</div>
                <div className="text-3xl font-black font-mono text-indigo-300">{aiResult.predictedHomeScore}</div>
              </div>
              <span className="text-slate-600 font-bold">VS</span>
              <div className="text-center">
                <div className="text-[10px] text-slate-500 mb-0.5">{aiResult.awayTeam}</div>
                <div className="text-3xl font-black font-mono text-indigo-300">{aiResult.predictedAwayScore}</div>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-12">置信度</span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${aiResult.confidence}%` }}
                />
              </div>
              <span className="text-[10px] font-bold font-mono text-indigo-400">{aiResult.confidence}%</span>
            </div>

            {/* Reasoning */}
            <p className="text-[11px] text-slate-400 leading-relaxed">{aiResult.reasoning}</p>

            {/* Key factors */}
            <div className="flex flex-wrap gap-1">
              {aiResult.keyFactors.map((f) => (
                <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/50 border border-slate-700/30 text-slate-400">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---- DEV SIMULATION PANEL ---- */}
      <div className="bg-surface-2 border border-amber-500/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Zap size={16} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-400">Dev Tools</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">模拟全网赛事自动结算</p>
          </div>
        </div>

        <p className="text-[12px] text-slate-400 mb-4 leading-relaxed">
          基于 6月14日 4场真实比赛结果，为所有演示用户生成随机预测，
          执行批量结算引擎，更新排行榜积分。计分规则：精确 10分 | 净胜球 5分 | 胜负 3分。
        </p>

        <Button
          variant="primary"
          loading={simRunning}
          onClick={handleSimulate}
          className="w-full gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950"
        >
          <Play size={15} />
          模拟全网赛事自动结算 (Simulate Dev Run)
        </Button>

        {/* Simulation Results */}
        {simSummary && (
          <div className="mt-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={14} className="text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">结算报告</span>
              <span className="text-[10px] text-slate-600 font-mono ml-auto">
                {new Date(simSummary.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: '比赛场次', value: simSummary.totalMatches },
                { label: '处理预测', value: simSummary.totalPredictions },
                { label: '已结算', value: simSummary.settled },
                { label: '总派分', value: simSummary.totalPointsAwarded, highlight: true },
              ].map((s) => (
                <div key={s.label} className="bg-slate-900/40 rounded-lg px-3 py-2 text-center">
                  <div className={cn('text-lg font-bold font-mono', s.highlight ? 'text-amber-400' : 'text-slate-200')}>
                    {s.value}
                  </div>
                  <div className="text-[10px] text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="space-y-1.5">
              {[
                { label: '精确命中 (10pts)', value: simSummary.exactMatches, color: 'text-emerald-400', barColor: 'bg-emerald-500' },
                { label: '净胜球正确 (5pts)', value: simSummary.goalDiffMatches, color: 'text-cyan-400', barColor: 'bg-cyan-500' },
                { label: '胜负正确 (3pts)', value: simSummary.outcomeMatches, color: 'text-blue-400', barColor: 'bg-blue-500' },
                { label: '预测错误 (0pts)', value: simSummary.wrongPredictions, color: 'text-slate-500', barColor: 'bg-slate-600' },
              ].map((row) => {
                const maxVal = Math.max(simSummary.exactMatches, simSummary.goalDiffMatches, simSummary.outcomeMatches, simSummary.wrongPredictions, 1)
                const pct = (row.value / maxVal) * 100
                return (
                  <div key={row.label} className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 w-28 shrink-0">{row.label}</span>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all duration-500', row.barColor)} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={cn('text-[11px] font-mono font-bold w-6 text-right', row.color)}>
                      {row.value}
                    </span>
                  </div>
                )
              })}
            </div>

            {simSummary.leaderboardUpdated && (
              <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center gap-2">
                <span className="text-[10px] text-emerald-400 font-medium">排行榜已更新</span>
                <span className="text-[10px] text-slate-600">前往排行榜查看最新排名</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
