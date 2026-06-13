import { useMemo } from 'react'
import { useMatchStore } from '@/store/matchStore'
import { TEAM_FLAGS, TEAM_NAMES_ZH, STAGE_LABELS } from '@/utils/constants'
import type { CachedMatch } from '@/types/match'

const ROUND_ORDER = ['round32', 'round16', 'quarter', 'semi', 'final', 'third'] as const

export function BracketView() {
  const matches = useMatchStore((s) => s.matches)

  const rounds = useMemo(() => {
    const result: Record<string, CachedMatch[]> = {}
    for (const round of ROUND_ORDER) {
      result[round] = Object.values(matches)
        .filter((m) => m.stage === round)
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    }
    return result
  }, [matches])

  if (Object.keys(matches).length === 0) return null

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 min-w-[800px] pb-4">
        {ROUND_ORDER.map((round) => {
          const roundMatches = rounds[round] ?? []
          if (roundMatches.length === 0) return null
          return (
            <div key={round} className="flex-1 min-w-[140px]">
              <h3 className="text-xs font-semibold text-text-muted mb-2 text-center sticky top-0">
                {STAGE_LABELS[round]}
              </h3>
              <div className="space-y-2">
                {roundMatches.map((match) => (
                  <a
                    key={match.id}
                    href={`#/matches/${match.id}`}
                    className="block bg-bg-card border border-border rounded-lg p-2 text-xs hover:border-accent/50 transition-colors no-underline"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-text truncate flex-1">
                        {TEAM_FLAGS[match.homeTeam] ?? ''} {TEAM_NAMES_ZH[match.homeTeam] ?? match.homeTeam}
                      </span>
                      {match.homeScore !== null && (
                        <span className="font-bold text-text">{match.homeScore}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="text-text truncate flex-1">
                        {TEAM_FLAGS[match.awayTeam] ?? ''} {TEAM_NAMES_ZH[match.awayTeam] ?? match.awayTeam}
                      </span>
                      {match.awayScore !== null && (
                        <span className="font-bold text-text">{match.awayScore}</span>
                      )}
                    </div>
                    {match.status === 'finished' && match.homeScore !== null && match.awayScore !== null && (
                      <div className="mt-1 text-center text-text-muted">
                        {match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam} 晋级
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
