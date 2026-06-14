// ============================================================
// Live Match Sync Engine — Simulation + Real API Polling
// ============================================================

import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type {
  LiveMatch, LiveEvent,
  ProbabilitySnapshot, SimulatorConfig,
} from './liveTypes'
import { createSnapshot, recalculateProbabilities } from './liveEngine'
import { fetchLiveMatches } from './realSportsApi'
import type { CachedMatch } from '@/types/match'

// ---- Player name pools for simulation ----
const PLAYER_POOLS: Record<string, string[]> = {
  Scotland: ['McGinn', 'McTominay', 'Robertson', 'Adams', 'Christie', 'Gilmour'],
  Haiti: ['Nazon', 'Pierrot', 'Antoine', 'Lafrance', 'Arcus', 'Placide'],
  Brazil: ['Vinicius', 'Rodrygo', 'Raphinha', 'Paqueta', 'Guimaraes', 'Marquinhos'],
  Morocco: ['Hakimi', 'En-Nesyri', 'Ziyech', 'Amrabat', 'Boufal', 'Saiss'],
  Qatar: ['Afif', 'Ali', 'Al-Haydos', 'Boudiaf', 'Khoukhi', 'Barsham'],
  Switzerland: ['Shaqiri', 'Embolo', 'Akanji', 'Xhaka', 'Freuler', 'Sommer'],
  Australia: ['Souttar', 'McGree', 'Duke', 'Irvine', 'Behich', 'Ryan'],
  Turkey: ['Calhanoglu', 'Guler', 'Yilmaz', 'Akturkoglu', 'Demiral', 'Gunok'],
  Italy: ['Barella', 'Chiesa', 'Donnarumma', 'Bastoni', 'Tonali', 'Retegui'],
  Ghana: ['Kudus', 'Partey', 'Williams', 'Salisu', 'Ayew', 'Ati-Zigi'],
  USA: ['Pulisic', 'McKennie', 'Reyna', 'Adams', 'Robinson', 'Turner'],
  Tunisia: ['Khazri', 'Msakni', 'Jaziri', 'Sassi', 'Bronn', 'Dahmen'],
}

function getPlayerPool(teamName: string): string[] {
  for (const [key, players] of Object.entries(PLAYER_POOLS)) {
    if (teamName.includes(key) || key.includes(teamName)) return players
  }
  return [`${teamName}-1`, `${teamName}-2`, `${teamName}-3`, `${teamName}-4`, `${teamName}-5`, `${teamName}-6`]
}

// ---- Default match data (fallback if store has no live matches) ----
const DEFAULT_MATCH = {
  matchId: 'default-live',
  homeTeam: { name: 'Haiti', flag: '🇭🇹', nameZh: '海地' },
  awayTeam: { name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', nameZh: '苏格兰' },
  kickoffTime: new Date('2026-06-14T10:00:00Z').getTime(),
  baselineProbs: { homeWin: 6, draw: 12, awayWin: 82 },
}

// ---- Live Sync Store ----
interface LiveSyncStore {
  match: LiveMatch
  probability: ProbabilitySnapshot
  isRunning: boolean
  tickCount: number
  isLive: boolean
  startSimulation: (config?: Partial<SimulatorConfig>) => void
  stopSimulation: () => void
  resetSimulation: () => void
  /** Update match identity from real data */
  setMatchFromReal: (realMatch: CachedMatch, baseline?: { h: number; d: number; a: number }) => void
}

let _intervalId: ReturnType<typeof setInterval> | null = null
let _pollIntervalId: ReturnType<typeof setInterval> | null = null

function createInitialMatch(): LiveMatch {
  return {
    matchId: DEFAULT_MATCH.matchId,
    status: 'UPCOMING',
    homeTeam: DEFAULT_MATCH.homeTeam,
    awayTeam: DEFAULT_MATCH.awayTeam,
    liveScore: { home: 0, away: 0 },
    currentMinute: 0,
    stoppageTime: 0,
    liveEvents: [],
    kickoffTime: DEFAULT_MATCH.kickoffTime,
    startedAt: null,
    lastUpdated: Date.now(),
  }
}

export const useLiveSyncStore = create<LiveSyncStore>((set, get) => ({
  match: createInitialMatch(),
  probability: createSnapshot(
    DEFAULT_MATCH.baselineProbs.homeWin,
    DEFAULT_MATCH.baselineProbs.draw,
    DEFAULT_MATCH.baselineProbs.awayWin,
  ),
  isRunning: false,
  tickCount: 0,
  isLive: false,

  setMatchFromReal: (realMatch, baseline) => {
    const bp = baseline ?? { h: 33, d: 34, a: 33 }
    const m: LiveMatch = {
      matchId: realMatch.id,
      status: realMatch.status === 'live' ? 'LIVE' : realMatch.status === 'finished' ? 'FINISHED' : 'UPCOMING',
      homeTeam: { name: realMatch.homeTeam, flag: '⚽', nameZh: realMatch.homeTeam },
      awayTeam: { name: realMatch.awayTeam, flag: '⚽', nameZh: realMatch.awayTeam },
      liveScore: { home: realMatch.homeScore ?? 0, away: realMatch.awayScore ?? 0 },
      currentMinute: 0,
      stoppageTime: 0,
      liveEvents: [],
      kickoffTime: new Date(`${realMatch.date}T${realMatch.time}:00`).getTime(),
      startedAt: realMatch.status === 'live' ? Date.now() : null,
      lastUpdated: Date.now(),
    }
    const snap = createSnapshot(bp.h, bp.d, bp.a)
    // Stop any existing simulation when switching matches
    if (_intervalId) { clearInterval(_intervalId); _intervalId = null }
    set({ match: m, probability: snap, isRunning: false, tickCount: 0, isLive: realMatch.status === 'live' })
  },

  startSimulation: (config) => {
    if (_intervalId) return

    const state = get()
    const matchData = state.match

    const cfg: SimulatorConfig = {
      matchId: matchData.matchId,
      intervalMs: config?.intervalMs ?? 10000,
      goalChancePerTick: config?.goalChancePerTick ?? 0.15,
      cardChancePerTick: config?.cardChancePerTick ?? 0.08,
      autoStart: true,
    }

    const homePool = getPlayerPool(matchData.homeTeam.name)
    const awayPool = getPlayerPool(matchData.awayTeam.name)

    // Auto-start: switch to LIVE
    set((s) => {
      const m = { ...s.match }
      m.status = 'LIVE'
      m.startedAt = Date.now()
      m.currentMinute = 1
      m.lastUpdated = Date.now()
      return { match: m, isRunning: true, isLive: true, tickCount: 0 }
    })

    // --- Real API polling (background) ---
    if (_pollIntervalId) clearInterval(_pollIntervalId)
    _pollIntervalId = setInterval(async () => {
      try {
        const liveMatches = await fetchLiveMatches()
        const current = liveMatches.find((rm) => rm.id === matchData.matchId)
        if (current && current.homeScore != null) {
          const s = get()
          const m = { ...s.match }
          const hadGoal = m.liveScore.home !== current.homeScore || m.liveScore.away !== (current.awayScore ?? 0)
          m.liveScore.home = current.homeScore
          m.liveScore.away = current.awayScore ?? 0
          m.lastUpdated = Date.now()
          if (current.status === 'finished') m.status = 'FINISHED'
          if (hadGoal) {
            m.liveEvents = [{
              id: nanoid(8),
              minute: m.currentMinute,
              type: 'GOAL',
              team: 'home',
              player: '球员',
              description: `⚽ 比分更新: ${current.homeScore}-${current.awayScore}`,
              timestamp: Date.now(),
            }, ...m.liveEvents]
          }
          const prob = recalculateProbabilities({
            ...s.probability,
            goalsHome: m.liveScore.home,
            goalsAway: m.liveScore.away,
            minutesPlayed: m.currentMinute,
            lastEvent: m.liveEvents[0]?.description ?? '实时数据同步',
          })
          set({ match: m, probability: prob })
          if (m.status === 'FINISHED') { const { stopSimulation } = get(); stopSimulation() }
        }
      } catch { /* Real API not available, use simulation */ }
    }, 30000) // Poll real API every 30s

    // --- Simulation ticker ---
    _intervalId = setInterval(() => {
      const state = get()
      const m = { ...state.match }
      const tick = state.tickCount + 1

      // Advance clock: ~2-4 minutes per tick
      const advMin = 2 + Math.floor(Math.random() * 3)
      m.currentMinute = Math.min(m.currentMinute + advMin, 90)
      m.stoppageTime = m.currentMinute >= 45 && m.currentMinute < 50
        ? Math.floor(Math.random() * 4)
        : m.currentMinute >= 90 ? Math.floor(Math.random() * 6) : 0

      // Half-time check
      if (m.currentMinute >= 45 && m.status === 'LIVE') m.status = 'HT'
      if (m.currentMinute >= 46 && m.status === 'HT') m.status = 'LIVE'
      if (m.currentMinute >= 90 && m.status === 'LIVE') {
        m.currentMinute = 90
        if (tick > 20) m.status = 'FINISHED'
      }

      // Random event generation
      const roll = Math.random()
      let eventType: LiveEvent['type'] | null = null
      let team: 'home' | 'away' = 'away'
      let player = ''

      // Goal bias: stronger team scores more
      const probHomeWin = state.probability.live.homeWin / 100
      if (roll < cfg.goalChancePerTick) {
        team = Math.random() < probHomeWin ? 'home' : 'away'
        eventType = 'GOAL'
        player = team === 'home'
          ? homePool[Math.floor(Math.random() * homePool.length)]
          : awayPool[Math.floor(Math.random() * awayPool.length)]
      } else if (roll < cfg.goalChancePerTick + cfg.cardChancePerTick) {
        // Card — weaker team more likely to foul
        team = Math.random() < (1 - probHomeWin) * 0.7 + 0.15 ? 'home' : 'away'
        eventType = Math.random() < 0.25 ? 'RED_CARD' : 'YELLOW_CARD'
        player = team === 'home'
          ? homePool[Math.floor(Math.random() * homePool.length)]
          : awayPool[Math.floor(Math.random() * awayPool.length)]
      }

      if (eventType) {
        const evt: LiveEvent = {
          id: nanoid(8),
          minute: m.currentMinute,
          type: eventType,
          team,
          player,
          description: eventType === 'GOAL'
            ? `⚽ ${player} 进球！${team === 'home' ? m.homeTeam.nameZh : m.awayTeam.nameZh} ${m.liveScore.home + (team === 'home' ? 1 : 0)}-${m.liveScore.away + (team === 'away' ? 1 : 0)}`
            : eventType === 'RED_CARD'
              ? `🟥 ${player} 被红牌罚下！`
              : `🟨 ${player} 吃到黄牌`,
          timestamp: Date.now(),
        }

        m.liveEvents = [evt, ...m.liveEvents]

        if (eventType === 'GOAL') {
          if (team === 'home') m.liveScore.home++
          else m.liveScore.away++
        }
      }

      m.lastUpdated = Date.now()

      // Recalculate probabilities
      const snap = { ...state.probability }
      const update: Partial<ProbabilitySnapshot> = {
        goalsHome: m.liveScore.home,
        goalsAway: m.liveScore.away,
        minutesPlayed: m.currentMinute,
        momentum: m.liveScore.home > m.liveScore.away ? 'home'
          : m.liveScore.away > m.liveScore.home ? 'away' : 'neutral',
        momentumStrength: Math.abs(m.liveScore.home - m.liveScore.away) * 25,
        redCardHome: m.liveEvents.some((e) => e.type === 'RED_CARD' && e.team === 'home'),
        redCardAway: m.liveEvents.some((e) => e.type === 'RED_CARD' && e.team === 'away'),
        lastEvent: m.liveEvents[0]?.description ?? '比赛中',
      }

      const recalc = recalculateProbabilities({ ...snap, ...update })

      set({
        match: m,
        probability: recalc,
        tickCount: tick,
        isLive: m.status !== 'FINISHED',
      })

      if (m.status === 'FINISHED') {
        const { stopSimulation } = get()
        stopSimulation()
      }
    }, cfg.intervalMs)
  },

  stopSimulation: () => {
    if (_intervalId) { clearInterval(_intervalId); _intervalId = null }
    if (_pollIntervalId) { clearInterval(_pollIntervalId); _pollIntervalId = null }
    set((s) => ({
      isRunning: false,
      match: { ...s.match, status: s.match.status === 'LIVE' || s.match.status === 'HT' ? 'FINISHED' : s.match.status },
    }))
  },

  resetSimulation: () => {
    if (_intervalId) { clearInterval(_intervalId); _intervalId = null }
    if (_pollIntervalId) { clearInterval(_pollIntervalId); _pollIntervalId = null }
    const state = get()
    set({
      match: {
        ...state.match,
        status: 'UPCOMING',
        liveScore: { home: 0, away: 0 },
        currentMinute: 0,
        stoppageTime: 0,
        liveEvents: [],
        startedAt: null,
        lastUpdated: Date.now(),
      },
      probability: createSnapshot(
        state.probability.baseline.homeWin,
        state.probability.baseline.draw,
        state.probability.baseline.awayWin,
      ),
      isRunning: false,
      tickCount: 0,
      isLive: false,
    })
  },
}))
