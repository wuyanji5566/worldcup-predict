import { useMemo } from 'react'
import { useMatchStore } from '@/store/matchStore'
import { GROUPS, TEAM_FLAGS, TEAM_NAMES_ZH } from '@/utils/constants'
import { EmptyState } from '@/components/ui/EmptyState'
import type { GroupStanding } from '@/types/match'

export function GroupsPage() {
  const matches = useMatchStore((s) => s.matches)
  const matchList = Object.values(matches)

  const standings = useMemo(() => {
    const map = new Map<string, GroupStanding>()

    // Initialize standings
    for (const m of matchList) {
      if (m.stage !== 'group' || !m.group) continue
      for (const team of [m.homeTeam, m.awayTeam]) {
        if (!map.has(team)) {
          map.set(team, {
            group: m.group,
            team,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDiff: 0,
            points: 0,
          })
        }
      }
    }

    // Calculate from finished matches
    for (const m of matchList) {
      if (m.stage !== 'group' || m.status !== 'finished' || !m.group) continue
      if (m.homeScore === null || m.awayScore === null) continue

      const home = map.get(m.homeTeam)
      const away = map.get(m.awayTeam)
      if (!home || !away) continue

      home.played++
      away.played++
      home.goalsFor += m.homeScore
      home.goalsAgainst += m.awayScore
      away.goalsFor += m.awayScore
      away.goalsAgainst += m.homeScore

      if (m.homeScore > m.awayScore) { home.won++; home.points += 3; away.lost++ }
      else if (m.homeScore < m.awayScore) { away.won++; away.points += 3; home.lost++ }
      else { home.drawn++; away.drawn++; home.points++; away.points++ }
    }

    for (const s of map.values()) {
      s.goalDiff = s.goalsFor - s.goalsAgainst
    }

    const result = new Map<string, GroupStanding[]>()
    for (const group of GROUPS) {
      const groupTeams = Array.from(map.values())
        .filter((s) => s.group === group)
        .sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor)
      if (groupTeams.length > 0) result.set(group, groupTeams)
    }

    return result
  }, [matchList])

  if (standings.size === 0) {
    return <EmptyState icon="📊" title="暂无小组赛数据" description="比赛开始后会显示积分表" />
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text">📊 小组积分</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from(standings.entries()).map(([group, teams]) => (
          <div key={group} className="bg-bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-2 bg-bg-card-hover border-b border-border">
              <span className="text-sm font-semibold text-text">{group} 组</span>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-muted border-b border-border">
                  <th className="py-2 pl-3 text-left">球队</th>
                  <th className="py-2 w-6">P</th>
                  <th className="py-2 w-6">W</th>
                  <th className="py-2 w-6">D</th>
                  <th className="py-2 w-6">L</th>
                  <th className="py-2 w-8">GD</th>
                  <th className="py-2 pr-3 w-8">Pts</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t, i) => (
                  <tr key={t.team} className={`border-b border-border/50 ${i < 2 ? 'bg-accent/5' : ''}`}>
                    <td className="py-2 pl-3">
                      <span className="mr-1">{(TEAM_FLAGS[t.team] ?? '🏳️')}</span>
                      <span className="text-text">{TEAM_NAMES_ZH[t.team] ?? t.team}</span>
                    </td>
                    <td className="py-2 text-center text-text-muted">{t.played}</td>
                    <td className="py-2 text-center text-text-muted">{t.won}</td>
                    <td className="py-2 text-center text-text-muted">{t.drawn}</td>
                    <td className="py-2 text-center text-text-muted">{t.lost}</td>
                    <td className="py-2 text-center text-text-muted">{t.goalDiff > 0 ? '+' : ''}{t.goalDiff}</td>
                    <td className="py-2 pr-3 text-center font-bold text-text">{t.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
