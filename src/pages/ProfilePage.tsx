import { useAuth } from '@/hooks/useAuth'
import { usePredictions } from '@/hooks/usePredictions'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { LogOut, Target, Award, TrendingUp } from 'lucide-react'
import { cn } from '@/utils/cn'

export function ProfilePage() {
  const { user, isLoggedIn, logout, openAuthModal } = useAuth()
  const { myPredictions } = usePredictions()
  const { entries } = useLeaderboard()

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
  const exact = settled.filter((p) => p.basePoints === 10 || p.points === 10).length
  const goalDiff = settled.filter((p) => p.basePoints === 5 || p.points === 5).length
  const outcome = settled.filter((p) => p.basePoints === 3 || p.points === 3).length

  const myRank = entries.find((e) => e.userId === user.id)

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

      {/* Stats */}
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

      {/* Prediction details */}
      <div className="bg-surface-2 border border-white/5 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-200 mb-3">预测详情</h3>
        <div className="space-y-2.5">
          {[
            { icon: Target, label: '精确命中 (10分)', value: exact, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
            { icon: TrendingUp, label: '净胜球正确 (5分)', value: goalDiff, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
            { icon: Award, label: '胜负正确 (3分)', value: outcome, color: 'text-blue-400', bg: 'bg-blue-500/5' },
          ].map((row) => (
            <div key={row.label} className={cn('flex justify-between items-center px-3 py-2 rounded-lg text-sm', row.bg)}>
              <span className="text-slate-400 flex items-center gap-2">
                <row.icon size={13} className={row.color} />
                {row.label}
              </span>
              <span className={cn('font-bold font-mono', row.color)}>{row.value} 场</span>
            </div>
          ))}
          <div className="flex justify-between items-center px-3 py-2 text-sm">
            <span className="text-slate-400 flex items-center gap-2">准确率</span>
            <span className="text-slate-200 font-mono font-bold">
              {settled.length > 0 ? `${Math.round(((exact * 10 + goalDiff * 5 + outcome * 3) / (settled.length * 10)) * 100)}%` : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
