import { useState } from 'react'
import { X, Check, Zap, Crown, QrCode, CreditCard } from 'lucide-react'
import { cn } from '@/utils/cn'

interface UnlockModalProps {
  open: boolean
  onClose: () => void
  onPurchase: (plan: 'single' | 'member') => void
}

const features = {
  single: ['单场比赛全维度穿透分析', '非对称风险量化评估', 'AI 最佳比分区间预测', '24h 内可重复查看'],
  member: ['全部 104 场世界杯赛事解锁', '实时数据流 + 赔率监控', 'AI Agent 专属策略顾问', '麦肯锡 SCQA 深度日报', '专属 Discord 智囊社群', '赛前 1h 即时推送提醒'],
}

export function UnlockModal({ open, onClose, onPurchase }: UnlockModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'member'>('member')
  const [processing, setProcessing] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const handlePurchase = () => {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      onPurchase(selectedPlan)
    }, 1200)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl shadow-black/60 animate-fade-up">
        {/* ---- Glow accent top ---- */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        {/* ---- Header ---- */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Zap size={20} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">解锁量化智能大脑</h2>
              <p className="text-[11px] text-slate-500">选择您的分析方案</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ---- Plan Selector ---- */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-800/50 rounded-2xl">
            {/* Single Pass */}
            <button
              onClick={() => { setSelectedPlan('single'); setShowQR(false) }}
              className={cn(
                'relative flex flex-col items-center gap-2 py-4 px-3 rounded-xl transition-all duration-200 cursor-pointer border',
                selectedPlan === 'single'
                  ? 'bg-slate-700/60 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  : 'border-transparent hover:bg-slate-700/30',
              )}
            >
              <Zap size={20} className={selectedPlan === 'single' ? 'text-cyan-400' : 'text-slate-500'} />
              <div className="text-center">
                <div className={cn('text-xs font-bold', selectedPlan === 'single' ? 'text-slate-200' : 'text-slate-400')}>
                  单场穿透解锁
                </div>
                <div className={cn('text-lg font-black font-mono mt-0.5', selectedPlan === 'single' ? 'text-cyan-400' : 'text-slate-500')}>
                  ￥39.9
                </div>
              </div>
              {selectedPlan === 'single' && (
                <Check size={14} className="absolute top-2 right-2 text-cyan-400" />
              )}
            </button>

            {/* Member */}
            <button
              onClick={() => { setSelectedPlan('member'); setShowQR(false) }}
              className={cn(
                'relative flex flex-col items-center gap-2 py-4 px-3 rounded-xl transition-all duration-200 cursor-pointer border',
                selectedPlan === 'member'
                  ? 'bg-slate-700/60 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                  : 'border-transparent hover:bg-slate-700/30',
              )}
            >
              <Crown size={20} className={selectedPlan === 'member' ? 'text-amber-400' : 'text-slate-500'} />
              <div className="text-center">
                <div className={cn('text-xs font-bold', selectedPlan === 'member' ? 'text-slate-200' : 'text-slate-400')}>
                  先知黑金会员
                </div>
                <div className={cn('text-lg font-black font-mono mt-0.5', selectedPlan === 'member' ? 'text-amber-400' : 'text-slate-500')}>
                  ￥399<sub className="text-[10px] font-normal">/月</sub>
                </div>
              </div>
              {/* Popular badge */}
              <div className="absolute -top-1.5 right-3 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[9px] font-bold text-amber-400">
                推荐
              </div>
            </button>
          </div>
        </div>

        {/* ---- Feature List ---- */}
        <div className="px-6 pb-4">
          <div className={cn(
            'rounded-xl p-4 transition-all duration-300',
            selectedPlan === 'member' ? 'bg-amber-500/3 border border-amber-500/10' : 'bg-cyan-500/3 border border-cyan-500/10',
          )}>
            <div className="flex items-center gap-2 mb-2">
              {selectedPlan === 'member' ? (
                <Crown size={14} className="text-amber-400" />
              ) : (
                <Zap size={14} className="text-cyan-400" />
              )}
              <span className="text-[11px] font-semibold text-slate-300">
                {selectedPlan === 'member' ? '黑金会员专属权益' : '单场解锁包含'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(selectedPlan === 'member' ? features.member : features.single).map((f) => (
                <div key={f} className="flex items-start gap-1.5">
                  <Check size={10} className={cn('mt-0.5 shrink-0', selectedPlan === 'member' ? 'text-amber-400' : 'text-cyan-400')} />
                  <span className="text-[10px] text-slate-400 leading-relaxed">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---- QR Code Mock Section ---- */}
        <div className="px-6 pb-2">
          <button
            onClick={() => setShowQR(!showQR)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30 text-[11px] text-slate-400 hover:text-slate-300 hover:border-slate-600/50 transition-all cursor-pointer"
          >
            <QrCode size={14} />
            {showQR ? '收起支付码' : '扫码支付'}
            <span className="text-slate-600">·</span>
            <span className="text-slate-600">微信 / 支付宝</span>
          </button>

          {showQR && (
            <div className="mt-3 animate-fade-in">
              {/* WeChat Pay QR */}
              <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-green-500/10 hover:border-green-500/30 transition-all">
                <div className="w-40 h-40 rounded-xl bg-white p-2 flex items-center justify-center overflow-hidden">
                  <img
                    src="/wechat-pay.jpg"
                    alt="微信收款码"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">💚</span>
                  <span className="text-xs text-green-400 font-semibold">微信扫码支付</span>
                </div>
                <p className="text-[10px] text-slate-500 text-center">
                  请使用微信扫描二维码完成支付
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ---- CTA ---- */}
        <div className="px-6 pb-6 pt-3">
          <button
            onClick={handlePurchase}
            disabled={processing}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer',
              selectedPlan === 'member'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_50px_rgba(245,158,11,0.3)]'
                : 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:shadow-[0_0_50px_rgba(6,182,212,0.3)]',
              'active:scale-[0.98] disabled:opacity-50',
            )}
          >
            {processing ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-slate-900/30 border-t-slate-900 animate-spin" />
                处理中...
              </>
            ) : (
              <>
                {selectedPlan === 'member' ? <Crown size={16} /> : <CreditCard size={16} />}
                确认支付 ￥{selectedPlan === 'member' ? '399.00' : '39.90'}
              </>
            )}
          </button>
          <p className="text-[10px] text-slate-600 text-center mt-2">
            模拟支付 · 点击即解锁完整分析
          </p>
        </div>
      </div>
    </div>
  )
}
