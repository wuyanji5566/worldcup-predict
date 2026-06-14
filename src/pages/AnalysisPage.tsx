import { useState, useCallback, useMemo } from 'react'
import { CalendarDays, BarChart3, Sparkles, Unlock, Crown, TrendingUp } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ProbabilityTable } from '@/components/analysis/ProbabilityTable'
import { McKinseyPanel } from '@/components/analysis/McKinseyPanel'
import { PaywallOverlay } from '@/components/analysis/PaywallOverlay'
import { UnlockModal } from '@/components/analysis/UnlockModal'
import { useUIStore } from '@/store/uiStore'
import { getItem, setItem } from '@/utils/storage'
import { useMatches } from '@/hooks/useMatches'
import type { MatchProbability, McKinseyInsight } from '@/data/analysisData'
import { TEAM_NAMES_ZH, TEAM_FLAGS } from '@/utils/constants'

// Single unlock: keyed by date, expires next day
const getSingleKey = () => `predict_unlock_${new Date().toISOString().split('T')[0]}`
const MEMBER_KEY = 'predict_unlock_member'

function loadUnlockStatus(): 'single' | 'member' | null {
  const member = getItem<string | null>(MEMBER_KEY, null)
  if (member === 'member') return 'member'
  const single = getItem<string | null>(getSingleKey(), null)
  if (single === 'single') return 'single'
  return null
}

type PurchasePlan = 'single' | 'member' | null

const TEAM_STRENGTH: Record<string, { elo: number; tier: number }> = {
  Argentina: { elo: 92, tier: 1 }, Brazil: { elo: 91, tier: 1 }, France: { elo: 90, tier: 1 },
  England: { elo: 88, tier: 1 }, Spain: { elo: 87, tier: 1 }, Germany: { elo: 86, tier: 1 },
  Portugal: { elo: 85, tier: 1 }, Netherlands: { elo: 83, tier: 2 }, Italy: { elo: 82, tier: 2 },
  Belgium: { elo: 80, tier: 2 }, Uruguay: { elo: 79, tier: 2 }, Croatia: { elo: 78, tier: 2 },
  Denmark: { elo: 76, tier: 2 }, Switzerland: { elo: 75, tier: 2 }, Colombia: { elo: 74, tier: 2 },
  Morocco: { elo: 73, tier: 2 }, USA: { elo: 72, tier: 3 }, Mexico: { elo: 71, tier: 3 },
  Senegal: { elo: 70, tier: 3 }, Japan: { elo: 69, tier: 3 }, SouthKorea: { elo: 68, tier: 3 },
  Serbia: { elo: 67, tier: 3 }, Turkey: { elo: 66, tier: 3 }, Scotland: { elo: 65, tier: 3 },
  Australia: { elo: 64, tier: 3 }, Qatar: { elo: 62, tier: 4 }, Canada: { elo: 61, tier: 4 },
  Haiti: { elo: 55, tier: 4 }, Ghana: { elo: 63, tier: 4 }, Tunisia: { elo: 60, tier: 4 },
  Peru: { elo: 65, tier: 3 }, Chile: { elo: 69, tier: 3 }, Iran: { elo: 64, tier: 3 },
  SouthAfrica: { elo: 56, tier: 4 },
}

function getTeamStrength(name: string) {
  if (TEAM_STRENGTH[name]) return TEAM_STRENGTH[name]
  for (const [key, val] of Object.entries(TEAM_STRENGTH)) {
    if (name.includes(key) || key.includes(name)) return val
  }
  return { elo: 60, tier: 4 }
}

function computeProbabilities(homeTeam: string, awayTeam: string) {
  const home = getTeamStrength(homeTeam), away = getTeamStrength(awayTeam)
  const eloDiff = home.elo - away.elo
  const homeWinRaw = 1 / (1 + Math.pow(10, -eloDiff / 40)), awayWinRaw = 1 - homeWinRaw
  const closeness = Math.max(0, 1 - Math.abs(eloDiff) / 60), drawBase = closeness * 0.32 + 0.16
  const total = homeWinRaw + awayWinRaw + drawBase
  const homeWin = Math.round((homeWinRaw / total) * 100), draw = Math.round((drawBase / total) * 100), awayWin = 100 - homeWin - draw
  const tg = Math.round(1.5 + (home.tier + away.tier) * 0.3)
  const hg = Math.max(0, Math.round(tg * (homeWin / 100))), ag = Math.max(0, tg - hg)
  const bestScores = `${hg}-${ag}, ${Math.max(0, hg - 1)}-${Math.min(tg, ag + 1)}`
  const maxProb = Math.max(homeWin, draw, awayWin)
  const certainty = maxProb >= 75 ? 5 : maxProb >= 60 ? 4 : maxProb >= 50 ? 3 : maxProb >= 40 ? 2 : 1
  return { homeWin: Math.max(1, homeWin), draw: Math.max(1, draw), awayWin: Math.max(1, awayWin), bestScores, certainty }
}

function generateInsights(matches: MatchProbability[]): McKinseyInsight[] {
  if (matches.length === 0) return []
  const sorted = [...matches].sort((a, b) => b.certainty - a.certainty)
  const topC = sorted.filter((m) => m.certainty >= 4), highD = sorted.filter((m) => m.draw >= 28), close = sorted.filter((m) => m.certainty <= 2)
  const insights: McKinseyInsight[] = []; let id = 0
  if (topC.length > 0) {
    const picks = topC.slice(0, 2).map((m) => { const f = m.homeWin > m.awayWin ? m.homeTeam : m.awayTeam; return `${f} ${Math.max(m.homeWin, m.awayWin)}%` }).join('，')
    insights.push({ id: id++, icon: '🎯', title: '稳胆选择', body: `${topC[0].homeTeam} vs ${topC[0].awayTeam} 是今日最稳场次。${picks}，适合作为串关基石。`, tags: ['高置信度', '串关基石'] })
  }
  if (highD.length > 0) {
    const m = highD[0]
    insights.push({ id: id++, icon: '💰', title: '黄金博弈点', body: `${m.homeTeam} vs ${m.awayTeam} 的平局概率 (${m.draw}%) 是今日最大价值博弈点。双方实力接近，防守体系稳固。`, tags: ['高赔率价值', '势均力敌'] })
  }
  if (close.length > 0) {
    const m = close[0]
    insights.push({ id: id++, icon: '⚠️', title: 'AI 模型陷阱', body: `${m.homeTeam} vs ${m.awayTeam} 变数最大。实力差距不明显，外部因素可能改变走向，建议谨慎。`, tags: ['高变数', '谨慎'] })
  }
  if (matches.length >= 2) {
    const s = sorted[0], r = sorted[sorted.length - 1], pick = s.homeWin > s.awayWin ? s.homeTeam : s.awayTeam
    insights.push({ id: id++, icon: '🧩', title: '行动策略建议', body: `【稳健】单选 ${pick} 胜 (${Math.max(s.homeWin, s.awayWin)}%)。【博弈】关注 ${r.homeTeam} vs ${r.awayTeam} 进球大球方向。`, tags: ['稳健', '博弈', '策略组合'] })
  }
  return insights
}

export function AnalysisPage() {
  const [unlockedPlan, setUnlockedPlan] = useState<PurchasePlan>(loadUnlockStatus)
  const [modalOpen, setModalOpen] = useState(false)
  const addToast = useUIStore((s) => s.addToast)
  const { matches } = useMatches()

  const isUnlocked = unlockedPlan !== null
  const isMember = unlockedPlan === 'member'

  const today = useMemo(() => { const d = new Date(); return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日` }, [])

  const todayMatches = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    const todayData = matches.filter((m) => m.date === todayStr)
    const source = todayData.length > 0 ? todayData
      : matches.filter((m) => m.status === 'scheduled').slice(0, 4)
    return source.map((m) => ({
      id: m.id, ...computeProbabilities(m.homeTeam, m.awayTeam),
      homeTeam: TEAM_NAMES_ZH[m.homeTeam] ?? m.homeTeam, homeFlag: TEAM_FLAGS[m.homeTeam] ?? '⚽',
      awayTeam: TEAM_NAMES_ZH[m.awayTeam] ?? m.awayTeam, awayFlag: TEAM_FLAGS[m.awayTeam] ?? '⚽',
      kickoff: m.time, venue: m.stadium || '待定', group: m.group ? `${m.group}组` : '',
    }))
  }, [matches])

  const insights = useMemo(() => generateInsights(todayMatches), [todayMatches])

  const handleOpenModal = useCallback(() => setModalOpen(true), [])
  const handleCloseModal = useCallback(() => setModalOpen(false), [])
  const handlePurchase = useCallback((plan: 'single' | 'member') => {
    setUnlockedPlan(plan); setModalOpen(false)
    if (plan === 'member') { setItem(MEMBER_KEY, 'member'); addToast('🔥 黑金会员已激活 · 全赛程解锁', 'success') }
    else { setItem(getSingleKey(), 'single'); addToast(`✅ 今日解锁成功 · ￥39.9 · ${today} 有效`, 'success') }
  }, [addToast, today])

  return (
    <div className="space-y-5 md:space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <BarChart3 size={16} className="text-indigo-400" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">今日赛事预测</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5 ml-10">
            {today} · {todayMatches.length} 场比赛 · 数据定时更新
            {!isUnlocked && <span className="ml-2 text-amber-400 text-[10px]">· 付费解锁完整分析</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isUnlocked ? (
            <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold',
              isMember ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400')}>
              {isMember ? <Crown size={13} /> : <Unlock size={13} />}
              {isMember ? '黑金会员' : '今日已解锁'}
            </div>
          ) : (
            <button onClick={handleOpenModal} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer">
              <Unlock size={13} />解锁完整分析
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <CalendarDays size={14} className="text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400">{new Date().toISOString().split('T')[0]}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">胜平负概率矩阵</h2>
          <span className="text-[10px] text-slate-600 font-mono ml-auto">基于 ELO + 泊松分布</span>
          {!isUnlocked && <span className="text-[10px] text-amber-400 ml-1">· 付费内容</span>}
        </div>
        {todayMatches.length > 0 ? (
          <ProbabilityTable matches={todayMatches} blurred={!isUnlocked} />
        ) : (
          <div className="bg-surface-2 border border-border-default rounded-2xl p-10 text-center">
            <TrendingUp size={32} className="text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary text-sm">今日暂无比赛数据</p>
            <p className="text-text-tertiary text-xs mt-1">请稍后再来查看</p>
          </div>
        )}
      </div>

      <PaywallOverlay blurred={!isUnlocked} onUnlock={handleOpenModal} label="解锁量化智能大脑" variant="full">
        <McKinseyPanel insights={insights} />
      </PaywallOverlay>

      <UnlockModal open={modalOpen} onClose={handleCloseModal} onPurchase={handlePurchase} />
    </div>
  )
}
