import { create } from 'zustand'
import type { CachedMatch } from '@/types/match'
import { setItem } from '@/utils/storage'
import { fetchSchedule } from '@/api/matchApi'
import { WORLD_CUP_GROUPS } from '@/utils/constants'
import { loadRealSchedule } from '@/services/baiduSync'
import { fetchMatchesByDateRange } from '@/services/realSportsApi'
import { fetchEspnScoreboard, fetchEspnAllFixtures } from '@/services/espnApi'

function getGroupStageMatches(): CachedMatch[] {
  const matches: CachedMatch[] = []
  let id = 1
  const startDate = new Date('2026-06-11')
  const groups = Object.entries(WORLD_CUP_GROUPS)

  // Each group: 4 teams, 6 matches (round-robin)
  for (const [groupIndex, [group, teams]] of groups.entries()) {
    const fixtures = [
      [0, 1], [2, 3], // Matchday 1
      [0, 2], [1, 3], // Matchday 2
      [0, 3], [1, 2], // Matchday 3
    ]
    // Spread matches across days
    const dayOffset = groupIndex

    for (let fi = 0; fi < fixtures.length; fi++) {
      const [h, a] = fixtures[fi]
      const matchDate = new Date(startDate)
      matchDate.setDate(matchDate.getDate() + dayOffset + fi * 4)

      const dateStr = matchDate.toISOString().split('T')[0]
      const homeName = teams[h]
      const awayName = teams[a]

      const homeScore: number | null = null
      const awayScore: number | null = null
      const events: CachedMatch['events'] = []

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
        status: 'scheduled',
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
  dataSource: string // where the data came from
  init: () => Promise<void>
  refresh: () => Promise<void>
  pollLiveScores: () => Promise<void>
  syncLiveMatch: (matchId: string, data: { homeScore: number; awayScore: number; status: string; minute: number }) => void
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
  dataSource: '未加载',

  init: async () => {
    // Skip stale cache
    localStorage.removeItem('wc2026_matches')

    set({ isLoading: true, error: null })

    // 1st: ESPN API (free, no key, real 2026 World Cup data)
    try {
      const espnMatches = await fetchEspnAllFixtures()
      if (espnMatches.length > 0) {
        const matchMap: Record<string, CachedMatch> = {}
        for (const m of espnMatches) matchMap[m.id] = m
        console.log('[数据来源] ✅ ESPN API 实时数据，共', espnMatches.length, '场比赛')
        set({ matches: matchMap, isLoading: false, error: null, lastFetch: Date.now(), dataSource: 'ESPN API 实时数据' })
        setItem('matches', matchMap)
        return
      }
    } catch { /* ESPN failed, try next */ }

    // 2nd: Try free openfootball GitHub API
    try {
      const { matches: ghMatches, error } = await fetchSchedule()
      if (!error && ghMatches.length > 0) {
        const matchMap: Record<string, CachedMatch> = {}
        for (const m of ghMatches) matchMap[m.id] = m
        console.log('[数据来源] ⚠️ GitHub开源数据，共', ghMatches.length, '场')
        set({ matches: matchMap, isLoading: false, error: null, lastFetch: Date.now(), dataSource: 'GitHub 开源数据' })
        setItem('matches', matchMap)
        return
      }
    } catch { /* GitHub API failed */ }

    // 3rd: Try api-football (if key configured)
    try {
      const apiMatches = await fetchMatchesByDateRange('2026-06-11', '2026-06-19')
      if (apiMatches.length > 0) {
        const matchMap: Record<string, CachedMatch> = {}
        for (const m of apiMatches) matchMap[m.id] = m
        console.log('[数据来源] ⚠️ API-Football，共', apiMatches.length, '场')
        set({ matches: matchMap, isLoading: false, error: null, lastFetch: Date.now(), dataSource: 'API-Football' })
        setItem('matches', matchMap)
        return
      }
    } catch { /* API failed */ }

    // 4th: Fallback to static real schedule (6月11-14日，20场)
    const realSchedule = loadRealSchedule()
    if (realSchedule.length > 0) {
      const matchMap: Record<string, CachedMatch> = {}
      for (const m of realSchedule) matchMap[m.id] = m
      console.log('[数据来源] ⚠️ 静态真实赛程，共', realSchedule.length, '场')
      set({ matches: matchMap, isLoading: false, lastFetch: Date.now(), dataSource: '静态真实赛程' })
      setItem('matches', matchMap)
      return
    }

    // Last resort: show schedule placeholders without fabricated results.
    const demos = getGroupStageMatches()
    const demoMap: Record<string, CachedMatch> = {}
    for (const m of demos) demoMap[m.id] = m
    console.log('[数据来源] ⚠️ 备用赛程（所有真实数据源不可用）')
    set({
      matches: demoMap,
      isLoading: false,
      error: '实时数据暂不可用，当前仅展示备用赛程，不包含比分',
      lastFetch: Date.now(),
      dataSource: '备用赛程',
    })
    setItem('matches', demoMap)
  },

  refresh: async () => {
    set({ isLoading: true, error: null })
    // Try ESPN first for refresh (fast, free, real data)
    try {
      const espnMatches = await fetchEspnAllFixtures()
      if (espnMatches.length > 0) {
        const matchMap: Record<string, CachedMatch> = {}
        for (const m of espnMatches) {
          matchMap[m.id] = m
        }
        set({
          matches: matchMap,
          isLoading: false,
          error: null,
          lastFetch: Date.now(),
          dataSource: 'ESPN API 实时数据',
        })
        setItem('matches', matchMap)
        return
      }
    } catch { /* ignore */ }
    // Fallback to other sources
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
    } catch { /* ignore */ }
    set({ isLoading: false })
  },

  /** Poll ESPN for live score updates */
  pollLiveScores: async () => {
    try {
      const espnMatches = await fetchEspnScoreboard()
      if (espnMatches.length === 0) return
      const matchMap = get().dataSource === '备用赛程' ? {} : { ...get().matches }
      let updated = false
      for (const em of espnMatches) {
        const existing = matchMap[em.id]
        if (!existing || existing.homeScore !== em.homeScore || existing.awayScore !== em.awayScore || existing.status !== em.status) {
          matchMap[em.id] = { ...(existing ?? em), ...em, lastUpdated: Date.now() }
          updated = true
        }
      }
      if (updated) {
        set({
          matches: matchMap,
          error: null,
          lastFetch: Date.now(),
          dataSource: 'ESPN API 实时数据',
        })
        setItem('matches', matchMap)
      }
    } catch { /* silent */ }
  },

  syncLiveMatch: (matchId, data) => {
    const matches = { ...get().matches }
    const match = matches[matchId]
    if (!match) return
    match.homeScore = data.homeScore
    match.awayScore = data.awayScore
    match.status = data.status === 'LIVE' ? 'live' : data.status === 'HT' ? 'live' : data.status === 'FINISHED' ? 'finished' : match.status
    match.lastUpdated = Date.now()
    if (data.status === 'LIVE' || data.status === 'HT') match.status = 'live'
    if (data.status === 'FINISHED') match.status = 'finished'
    set({ matches })
    setItem('matches', matches)
  },

  getMatchesByStage: (stage) => Object.values(get().matches).filter((m) => m.stage === stage),
  getMatchesByDate: (date) => Object.values(get().matches).filter((m) => m.date === date),
  getLiveMatches: () => Object.values(get().matches).filter((m) => m.status === 'live'),
  getMatchById: (id) => get().matches[id],
}))
