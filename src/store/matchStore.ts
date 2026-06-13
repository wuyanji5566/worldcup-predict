import { create } from 'zustand'
import type { CachedMatch } from '@/types/match'
import { getItem, setItem } from '@/utils/storage'
import { fetchSchedule } from '@/api/matchApi'
import { WORLD_CUP_GROUPS, TEAM_NAMES_ZH } from '@/utils/constants'

function getGroupStageMatches(): CachedMatch[] {
  const matches: CachedMatch[] = []
  let id = 1
  const startDate = new Date('2026-06-11')
  const groups = Object.entries(WORLD_CUP_GROUPS)

  // Each group: 4 teams, 6 matches (round-robin)
  for (const [group, teams] of groups) {
    const fixtures = [
      [0, 1], [2, 3], // Matchday 1
      [0, 2], [1, 3], // Matchday 2
      [0, 3], [1, 2], // Matchday 3
    ]
    // Spread matches across days
    const dayOffset = groups.indexOf([group, teams] as unknown as typeof groups[number])

    for (let fi = 0; fi < fixtures.length; fi++) {
      const [h, a] = fixtures[fi]
      const matchDate = new Date(startDate)
      matchDate.setDate(matchDate.getDate() + dayOffset + fi * 4)

      const dateStr = matchDate.toISOString().split('T')[0]
      const isPast = matchDate < new Date('2026-06-13')
      const homeName = teams[h]
      const awayName = teams[a]

      let homeScore: number | null = null
      let awayScore: number | null = null
      const events: CachedMatch['events'] = []

      if (isPast) {
        homeScore = Math.floor(Math.random() * 4)
        awayScore = Math.floor(Math.random() * 4)
        if (homeScore > 0) {
          for (let g = 0; g < homeScore; g++) {
            events.push({ type: 'goal', minute: 10 + g * 30 + Math.floor(Math.random() * 15), player: `${TEAM_NAMES_ZH[homeName] ?? homeName} 球员`, team: 'home' })
          }
        }
        if (awayScore > 0) {
          for (let g = 0; g < awayScore; g++) {
            events.push({ type: 'goal', minute: 15 + g * 25 + Math.floor(Math.random() * 10), player: `${TEAM_NAMES_ZH[awayName] ?? awayName} 球员`, team: 'away' })
          }
        }
        events.sort((a, b) => a.minute - b.minute)
      }

      matches.push({
        id: `match_${String(id).padStart(3, '0')}`,
        date: dateStr,
        time: `${13 + (fi % 2) * 4}:00`,
        homeTeam: homeName,
        awayTeam: awayName,
        group,
        stadium: Object.keys({
          'Mexico City': 1, 'Toronto': 1, 'Los Angeles': 1, 'Miami': 1,
          'New York': 1, 'Dallas': 1, 'San Francisco': 1, 'Seattle': 1,
          'Atlanta': 1, 'Philadelphia': 1, 'Boston': 1, 'Houston': 1,
        })[id % 12],
        stage: 'group',
        status: isPast ? 'finished' : 'scheduled',
        homeScore,
        awayScore,
        homePenalties: null,
        awayPenalties: null,
        events,
        lastUpdated: Date.now(),
      })
      id++
    }
  }

  return matches
}

interface MatchStore {
  matches: Record<string, CachedMatch>
  isLoading: boolean
  error: string | null
  lastFetch: number
  init: () => Promise<void>
  refresh: () => Promise<void>
  getMatchesByStage: (stage: string) => CachedMatch[]
  getMatchesByDate: (date: string) => CachedMatch[]
  getLiveMatches: () => CachedMatch[]
  getMatchById: (id: string) => CachedMatch | undefined
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  matches: {},
  isLoading: false,
  error: null,
  lastFetch: 0,

  init: async () => {
    const cached = getItem<Record<string, CachedMatch>>('matches', {})
    if (Object.keys(cached).length > 0) {
      set({ matches: cached, lastFetch: Date.now() })
      return
    }

    set({ isLoading: true, error: null })
    try {
      const { matches: apiMatches, error } = await fetchSchedule()
      if (!error && apiMatches.length > 0) {
        const matchMap: Record<string, CachedMatch> = {}
        for (const m of apiMatches) {
          matchMap[m.id] = m
        }
        set({ matches: matchMap, isLoading: false, lastFetch: Date.now() })
        setItem('matches', matchMap)
        return
      }
    } catch { /* fallback to demo data */ }

    const demos = getGroupStageMatches()
    const demoMap: Record<string, CachedMatch> = {}
    for (const m of demos) {
      demoMap[m.id] = m
    }
    set({ matches: demoMap, isLoading: false, error: null, lastFetch: Date.now() })
    setItem('matches', demoMap)
  },

  refresh: async () => {
    set({ isLoading: true, error: null })
    try {
      const { matches: apiMatches, error } = await fetchSchedule()
      if (!error && apiMatches.length > 0) {
        const matchMap: Record<string, CachedMatch> = { ...get().matches }
        for (const m of apiMatches) {
          matchMap[m.id] = m
        }
        set({ matches: matchMap, isLoading: false, lastFetch: Date.now() })
        setItem('matches', matchMap)
        return
      }
    } catch { /* ignore */ }
    set({ isLoading: false })
  },

  getMatchesByStage: (stage) => Object.values(get().matches).filter((m) => m.stage === stage),
  getMatchesByDate: (date) => Object.values(get().matches).filter((m) => m.date === date),
  getLiveMatches: () => Object.values(get().matches).filter((m) => m.status === 'live'),
  getMatchById: (id) => get().matches[id],
}))
