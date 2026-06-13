import { usePredictions } from '@/hooks/usePredictions'
import { useAuth } from '@/hooks/useAuth'
import { MyPredictions } from '@/components/prediction/MyPredictions'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
export function PredictionsPage() {
  const { isLoggedIn, openAuthModal } = useAuth()
  const { myPredictions } = usePredictions()

  if (!isLoggedIn) {
    return (
      <EmptyState
        icon="🔒"
        title="请先登录"
        description="登录后查看和管理你的比分预测"
        actionLabel="去登录"
        onAction={() => openAuthModal('login')}
      />
    )
  }

  const totalPoints = myPredictions.reduce((sum, p) => sum + (p.points ?? 0), 0)
  const settled = myPredictions.filter((p) => p.points !== null)
  const exact = settled.filter((p) => p.basePoints === 3).length
  const correct = settled.filter((p) => p.basePoints === 1).length

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text">🎯 我的预测</h1>

      {/* Stats bar */}
      {myPredictions.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-bg-card border border-border rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-text">{myPredictions.length}</div>
            <div className="text-xs text-text-muted">总预测</div>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-gold">{totalPoints}</div>
            <div className="text-xs text-text-muted">总积分</div>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-green-400">{exact}</div>
            <div className="text-xs text-text-muted">精确命中</div>
          </div>
          <div className="bg-bg-card border border-border rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-blue-400">{correct}</div>
            <div className="text-xs text-text-muted">胜负正确</div>
          </div>
        </div>
      )}

      <MyPredictions predictions={myPredictions} />

      {myPredictions.length === 0 && (
        <div className="text-center mt-4">
          <a href="#/matches">
            <Button variant="primary">去预测比赛</Button>
          </a>
        </div>
      )}
    </div>
  )
}
