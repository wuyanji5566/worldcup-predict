import { useState, useCallback } from 'react'
import { CalendarDays, BarChart3, Sparkles, Unlock, Crown } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ProbabilityTable } from '@/components/analysis/ProbabilityTable'
import { McKinseyPanel } from '@/components/analysis/McKinseyPanel'
import { PaywallOverlay } from '@/components/analysis/PaywallOverlay'
import { UnlockModal } from '@/components/analysis/UnlockModal'
import { useUIStore } from '@/store/uiStore'
import { getItem, setItem } from '@/utils/storage'
import { june14Matches, mckinseyInsights } from '@/data/analysisData'

const PAYMENT_STORAGE_KEY = 'predict_terminal_unlocked_0614'

type PurchasePlan = 'single' | 'member' | null

export function AnalysisPage() {
  // Restore payment state from localStorage on load
  const [unlockedPlan, setUnlockedPlan] = useState<PurchasePlan>(() => {
    const saved = getItem<string | null>(PAYMENT_STORAGE_KEY, null)
    return (saved === 'single' || saved === 'member') ? saved as PurchasePlan : null
  })
  const [modalOpen, setModalOpen] = useState(false)
  const addToast = useUIStore((s) => s.addToast)

  const isUnlocked = unlockedPlan !== null
  const isMember = unlockedPlan === 'member'

  const handleOpenModal = useCallback(() => {
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
  }, [])

  const handlePurchase = useCallback((plan: 'single' | 'member') => {
    setUnlockedPlan(plan)
    setModalOpen(false)
    // Persist to localStorage so it survives refresh
    setItem(PAYMENT_STORAGE_KEY, plan)

    if (plan === 'member') {
      addToast('🔥 黑金会员已激活，已为您接入高维量化流', 'success')
    } else {
      addToast('支付成功，已为您接入高维量化流', 'success')
    }
  }, [addToast])

  return (
    <div className="space-y-5 md:space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* ===== Page Header ===== */}
      <div className="flex items-center justify-between">
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
            6月14日 · 4 场比赛 · AI 量化概率模型
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
            <span className="text-xs font-bold text-cyan-400">2026.06.14</span>
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
            基于 Transformer 推理引擎
          </span>
          {!isUnlocked && (
            <span className="text-[10px] text-amber-500/60 font-medium ml-1">· 付费内容</span>
          )}
        </div>
        <ProbabilityTable matches={june14Matches} blurred={!isUnlocked} />
      </div>

      {/* ===== McKinsey Insights (Paywalled) ===== */}
      <PaywallOverlay
        blurred={!isUnlocked}
        onUnlock={handleOpenModal}
        label="解锁量化智能大脑"
        variant="full"
      >
        <McKinseyPanel insights={mckinseyInsights} />
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
