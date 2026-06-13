import { useParams } from 'react-router-dom'
import { useMatchStore } from '@/store/matchStore'
import { MatchDetail } from '@/components/match/MatchDetail'
import { PredictionForm } from '@/components/prediction/PredictionForm'
import { CommentThread } from '@/components/comment/CommentThread'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'

export function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const getMatchById = useMatchStore((s) => s.getMatchById)

  const match = matchId ? getMatchById(matchId) : undefined

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner />
        <p className="text-text-muted">加载比赛数据...</p>
        <a href="#/matches">
          <Button variant="secondary" size="sm">返回比赛列表</Button>
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Back button */}
      <a href="#/matches" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text no-underline">
        <ArrowLeft size={16} />
        返回比赛列表
      </a>

      {/* Match detail */}
      <MatchDetail match={match} />

      {/* Prediction */}
      <PredictionForm match={match} />

      {/* Comments */}
      <div className="bg-bg-card border border-border rounded-2xl p-4">
        <CommentThread matchId={match.id} />
      </div>
    </div>
  )
}
