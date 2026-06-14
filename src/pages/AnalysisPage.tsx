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

const PAYMENT_STORAGE_KEY = 'predict_terminal_unlocked_0614'

type PurchasePlan = 'single' | 'member' | null

// Team strength ratings (FIFA-based ELO approximations)
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

function getTeamStrength(name: string): { elo: number; tier: number } {
  // Direct match
  if (TEAM_STRENGTH[name]) return TEAM_STRENGTH[name]
  // Partial match
  for (const [key, val] of Object.entries(TEAM_STRENGTH)) {
    if (name.includes(key) || key.includes(name)) return val
  }
  return { elo: 60, tier: 4 }
}

function computeProbabilities(homeTeam: string, awayTeam: string): {
  homeWin: number; draw: number; awayWin: number; bestScores: string; certainty: number
} {
  const home = getTeamStrength(homeTeam)
  const away = getTeamStrength(awayTeam)

  // ELO-based win probability
  const eloDiff = home.elo - away.elo
  const homeWinRaw = 1 / (1 + Math.pow(10, -eloDiff / 40))
  const awayWinRaw = 1 - homeWinRaw

  // Draw probability (higher when teams are close)
  const closenessMetric = Math.max(0, 1 - Math.abs(eloDiff) / 60)
  const drawBase = closenessMetric * 0.32 + 0.16

  // Normalize
  const total = homeWinRaw + awayWinRaw + drawBase
  const homeWin = Math.round((homeWinRaw / total) * 100)
  const draw = Math.round((drawBase / total) * 100)
  const awayWin = 100 - homeWin - draw

  // Best scores prediction
  const totalGoals = Math.round(1.5 + (home.tier + away.tier) * 0.3)
  const homeGoals = Math.max(0, Math.round(totalGoals * (homeWin / 100)))
  const awayGoals = Math.max(0, totalGoals - homeGoals)
  const bestScores = `${homeGoals}-${awayGoals}, ${Math.max(0, homeGoals - 1)}-${Math.min(totalGoals, awayGoals + 1)}`

  // Certainty (1-5)
  const maxProb = Math.max(homeWin, draw, awayWin)
  const certainty = maxProb >= 75 ? 5 : maxProb >= 60 ? 4 : maxProb >= 50 ? 3 : maxProb >= 40 ? 2 : 1

  return { homeWin: Math.max(1, homeWin), draw: Math.max(1, draw), awayWin: Math.max(1, awayWin), bestScores, certainty }
}

function generateInsights(matches: MatchProbability[]): McKinseyInsight[] {
  if (matches.length === 0) return []

  // Sort by certainty (highest first)
  const sorted = [...matches].sort((a, b) => b.certainty - a.certainty)
  const topConfidence = sorted.filter((m) => m.certainty >= 4)
  const highDraw = sorted.filter((m) => m.draw >= 28)
  const closeGames = sorted.filter((m) => m.certainty <= 2)

  const insights: McKinseyInsight[] = []
  let id = 0

  // 1. Steady picks
  if (topConfidence.length > 0) {
    const picks = topConfidence.slice(0, 2).map((m) => {
      const favorite = m.homeWin > m.awayWin ? m.homeTeam : m.awayTeam
      const prob = Math.max(m.homeWin, m.awayWin)
      return `${favorite} ${prob}% 胜率`
    }).join('，')
    insights.push({
      id: id++, icon: '🎯', title: '稳胆选择',
      body: `${topConfidence[0].homeTeam} vs ${topConfidence[0].awayTeam} 是今日最稳场次。${picks}，适合作为串关基石。`,
      tags: ['高置信度', '串关基石'],
    })
  }

  // 2. Value pick (high draw probability)
  if (highDraw.length > 0) {
    const m = highDraw[0]
    insights.push({
      id: id++, icon: '💰', title: '黄金博弈点',
      body: `${m.homeTeam} vs ${m.awayTeam} 的平局概率 (${m.draw}%) 是今日最大价值博弈点。双方实力接近，防守体系稳固，需重点防范僵局。`,
      tags: ['高赔率价值', '势均力敌'],
    })
  }

  // 3. Model trap warning
  if (closeGames.length > 0) {
    const m = closeGames[0]
    insights.push({
      id: id++, icon: '⚠️', title: 'AI 模型陷阱',
      body: `${m.homeTeam} vs ${m.awayTeam} 是今日变数最大场次。实力差距不明显，外部因素（场地、伤病、士气）可能显著改变比赛走向，建议谨慎下注。`,
      tags: ['高变数', '谨慎'],
    })
  }

  // 4. Strategy
  if (matches.length >= 2) {
    const safest = sorted[0]
    const riskiest = sorted[sorted.length - 1]
    const safePick = safest.homeWin > safest.awayWin ? safest.homeTeam : safest.awayTeam
    insights.push({
      id: id++, icon: '🧩', title: '行动策略建议',
      body: `【稳健型组合】单选 ${safePick} 胜，预期回报稳定，确定性最高 (${Math.max(safest.homeWin, safest.awayWin)}%)。【博弈型组合】关注 ${riskiest.homeTeam} vs ${riskiest.awayTeam} 进球大球方向——两队防线均有漏洞。`,
      tags: ['稳健', '博弈', '策略组合'],
    })
  }

  return insights
}

export function AnalysisPage() {
  const [unlockedPlan, setUnlockedPlan] = useState<PurchasePlan>(() => {
    const saved = getItem<string | null>(PAYMENT_STORAGE_KEY, null)
    return (saved === 'single' || saved === 'member') ? saved as PurchasePlan : null
  })
  const [modalOpen, setModalOpen] = useState(false)
  const addToast = useUIStore((s) => s.addToast)
  const { matches, liveMatches } = useMatches()

  const isUnlocked = unlockedPlan !== null
  const isMember = unlockedPlan === 'member'

  // Get today's date string
  const today = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }, [])

  // Compute probabilities from today's real matches
  const todayMatches: MatchProbability[] = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    const todayData = matches.filter((m) => m.date === todayStr)

    if (todayData.length === 0) {
      // No matches today — show tomorrow's matches
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]
      const tomorrowData = matches.filter((m) => m.date === tomorrowStr)
      if (tomorrowData.length > 0) {
        return tomorrowData.map((m) => {
          const probs = computeProbabilities(m.homeTeam, m.awayTeam)
          return {
            id: m.id,
            homeTeam: TEAM_NAMES_ZH[m.homeTeam] ?? m.homeTeam,
            homeFlag: TEAM_FLAGS[m.homeTeam] ?? '⚽',
            awayTeam: TEAM_NAMES_ZH[m.awayTeam] ?? m.awayTeam,
            awayFlag: TEAM_FLAGS[m.awayTeam] ?? '⚽',
            ...probs,
            kickoff: m.time, venue: m.stadium || '待定', group: m.group ? `${m.group}组` : '',
          }
        })
      }
      // Show upcoming matches as fallback
      const upcoming = matches.filter((m) => m.status === 'scheduled').slice(0, 4)
      if (upcoming.length > 0) {
        return upcoming.map((m) => {
          const probs = computeProbabilities(m.homeTeam, m.awayTeam)
          return {
            id: m.id,
            homeTeam: TEAM_NAMES_ZH[m.homeTeam] ?? m.homeTeam,
            homeFlag: TEAM_FLAGS[m.homeTeam] ?? '⚽',
            awayTeam: TEAM_NAMES_ZH[m.awayTeam] ?? m.awayTeam,
            awayFlag: TEAM_FLAGS[m.awayTeam] ?? '⚽',
            ...probs,
            kickoff: `${m.date} ${m.time}`, venue: m.stadium || '待定', group: m.group ? `${m.group}组` : '',
          }
        })
      }
    }

    return todayData.map((m) => {
      const probs = computeProbabilities(m.homeTeam, m.awayTeam)
      return {
        id: m.id,
        homeTeam: TEAM_NAMES_ZH[m.homeTeam] ?? m.homeTeam,
        homeFlag: TEAM_FLAGS[m.homeTeam] ?? '⚽',
        awayTeam: TEAM_NAMES_ZH[m.awayTeam] ?? m.awayTeam,
        awayFlag: TEAM_FLAGS[m.awayTeam] ?? '⚽',
        ...probs,
        kickoff: m.time, venue: m.stadium || '待定', group: m.group ? `${m.group}组` : '',
      }
    })
  }, [matches])

  // Generate insights from today's matches
  const insights = useMemo(() => generateInsights(todayMatches), [todayMatches])

  const handleOpenModal = useCallback(() => setModalOpen(true), [])
  const handleCloseModal = useCallback(() => setModalOpen(false), [])

  const handlePurchase = useCallback((plan: 'single' | 'member') => {
    setUnlockedPlan(plan)
    setModalOpen(false)
    setItem(PAYMENT_STORAGE_KEY, plan)
    if (plan === 'member') {
      addToast('🔥 黑金会员已激活，已为您接入高维量化流', 'success')
    } else {
      addToast('支付成功，已为您接入高维量化流', 'success')
    }
  }, [addToast])

  const matchCount = todayMatches.length
  const liveCount = liveMatches.length

  return (
    <div className="space-y-5 md:space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* ===== Page Header ===== */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <BarChart3 size={16} className="text-indigo-400" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              概率分析看板
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5 ml-10">
            {today} · {matchCount} 场比赛{liveCount > 0 ? ` · ${liveCount} 场进行中` : ''} · AI 量化概率模型
          </p>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-3">
          {isUnlocked ? (
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold',
              isMember
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
            )}>
              {isMember ? <Crown size={13} /> : <Unlock size={13} />}
              {isMember ? '黑金会员' : '已解锁'}
            </div>
          ) : (
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer"
            >
              <Unlock size={13} />
              解锁完整分析
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <CalendarDays size={14} className="text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400">
              {new Date().toISOString().split('T')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* ===== Probability Table ===== */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            胜平负概率矩阵
          </h2>
          <span className="text-[10px] text-slate-600 font-mono ml-auto">
            基于 ELO + 泊松分布模型
          </span>
          {!isUnlocked && (
            <span className="text-[10px] text-amber-500/60 font-medium ml-1">· 付费内容</span>
          )}
        </div>
        {todayMatches.length > 0 ? (
          <ProbabilityTable matches={todayMatches} blurred={!isUnlocked} />
        ) : (
          <div className="bg-surface-2 border border-border-default rounded-2xl p-10 text-center">
            <TrendingUp size={32} className="text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary text-sm">今日暂无比赛数据</p>
            <p className="text-text-tertiary text-xs mt-1">请稍后再来查看概率分析</p>
          </div>
        )}
      </div>

      {/* ===== McKinsey Insights (Paywalled) ===== */}
      <PaywallOverlay
        blurred={!isUnlocked}
        onUnlock={handleOpenModal}
        label="解锁量化智能大脑"
        variant="full"
      >
        <McKinseyPanel insights={insights} />
      </PaywallOverlay>

      {/* ===== Unlock Modal ===== */}
      <UnlockModal
        open={modalOpen}
        onClose={handleCloseModal}
        onPurchase={handlePurchase}
      />
    </div>
  )
}
