import type { CachedMatch } from '@/types/match'
import { MatchCard } from './MatchCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatMatchDateCST } from '@/utils/time'

interface MatchListProps {
  matches: CachedMatch[]
  groupByDate?: boolean
}

export function MatchList({ matches, groupByDate = true }: MatchListProps) {
  if (matches.length === 0) {
    return <EmptyState icon="⚽" title="暂无比赛" description="请稍后刷新重试" />
  }

  if (!groupByDate) {
    return (
      <div className="grid gap-3">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    )
  }

  const grouped = new Map<string, CachedMatch[]>()
  for (const match of matches) {
    const date = match.date
    if (!grouped.has(date)) grouped.set(date, [])
    grouped.get(date)!.push(match)
  }

  return (
    <div className="flex flex-col gap-6">
      {Array.from(grouped.entries()).map(([date, dayMatches]) => {
        const stadium = dayMatches[0]?.stadium
        const label = formatMatchDateCST(date, stadium)
        return (
          <div key={date}>
            <h3 className="text-sm font-semibold text-text-muted mb-3 sticky top-14 bg-bg py-2 z-10">
              📅 {label} · {dayMatches.length} 场比赛
            </h3>
            <div className="grid gap-3">
              {dayMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
