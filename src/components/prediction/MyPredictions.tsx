import type { Prediction } from '@/types/prediction'
import { useMatchStore } from '@/store/matchStore'
import { TEAM_FLAGS, TEAM_NAMES_ZH, STAGE_LABELS } from '@/utils/constants'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'

interface MyPredictionsProps {
  predictions: Prediction[]
}

export function MyPredictions({ predictions }: MyPredictionsProps) {
  const getMatchById = useMatchStore((s) => s.getMatchById)

  if (predictions.length === 0) {
    return <EmptyState icon="🎯" title="还没有预测" description="去比赛页面预测一场比赛吧！" />
  }

  const sorted = [...predictions].sort((a, b) => b.submittedAt - a.submittedAt)

  return (
    <div className="grid gap-3">
      {sorted.map((pred) => {
        const match = getMatchById(pred.matchId)
        if (!match) return null

        return (
          <a
            key={pred.matchId}
            href={`#/matches/${pred.matchId}`}
            className="block bg-bg-card border border-border rounded-2xl p-4 hover:bg-bg-card-hover transition-colors no-underline"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge>{STAGE_LABELS[match.stage]}</Badge>
                {pred.points !== null ? (
                  <Badge variant="success">+{pred.points} 分</Badge>
                ) : match.status === 'finished' ? (
                  <Badge variant="warning">待结算</Badge>
                ) : (
                  <Badge>已锁定</Badge>
                )}
              </div>
              {pred.jokerUsed && <span className="text-xs">🔥</span>}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text">
                {TEAM_FLAGS[(TEAM_NAMES_ZH[match.homeTeam] ?? match.homeTeam)] ?? '🏳️'} {(TEAM_NAMES_ZH[match.homeTeam] ?? match.homeTeam)}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-text">{pred.predictedHomeScore}</span>
                <span className="text-text-muted">-</span>
                <span className="text-lg font-bold text-text">{pred.predictedAwayScore}</span>
              </div>
              <span className="text-sm font-medium text-text">
                {(TEAM_NAMES_ZH[match.awayTeam] ?? match.awayTeam)} {TEAM_FLAGS[(TEAM_NAMES_ZH[match.awayTeam] ?? match.awayTeam)] ?? '🏳️'}
              </span>
            </div>

            {match.status === 'finished' && match.homeScore !== null && (
              <div className="mt-2 text-xs text-text-muted text-center">
                实际比分: {match.homeScore} - {match.awayScore}
                {match.homePenalties !== null && ` (PK ${match.homePenalties} - ${match.awayPenalties})`}
              </div>
            )}
          </a>
        )
      })}
    </div>
  )
}
