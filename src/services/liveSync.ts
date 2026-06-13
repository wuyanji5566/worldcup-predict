// ============================================================
// Live Match Sync Engine — Mock Simulator + Zustand Store
// ============================================================

import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type {
  LiveMatch, LiveEvent,
  ProbabilitySnapshot, SimulatorConfig,
} from './liveTypes'
import { createSnapshot, recalculateProbabilities } from './liveEngine'

// ---- June 14 Match Data ----
const MATCH_DATA = {
  matchId: 'j14-m1',
  homeTeam: { name: 'Haiti', flag: '🇭🇹', nameZh: '海地' },
  awayTeam: { name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', nameZh: '苏格兰' },
  kickoffTime: new Date('2026-06-14T10:00:00Z').getTime(),
  baselineProbs: { homeWin: 6, draw: 12, awayWin: 82 },
}

// ---- Player name pools ----
const SCOTLAND_PLAYERS = ['McGinn', 'McTominay', 'Robertson', 'Adams', 'Christie', 'Gilmour']
const HAITI_PLAYERS = ['Nazon', 'Pierrot', 'Antoine', 'Lafrance', 'Arcus', 'Placide']

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
}

let _intervalId: ReturnType<typeof setInterval> | null = null

function createInitialMatch(): LiveMatch {
  return {
    matchId: MATCH_DATA.matchId,
    status: 'UPCOMING',
    homeTeam: MATCH_DATA.homeTeam,
    awayTeam: MATCH_DATA.awayTeam,
    liveScore: { home: 0, away: 0 },
    currentMinute: 0,
    stoppageTime: 0,
    liveEvents: [],
    kickoffTime: MATCH_DATA.kickoffTime,
    startedAt: null,
    lastUpdated: Date.now(),
  }
}

export const useLiveSyncStore = create<LiveSyncStore>((set, get) => ({
  match: createInitialMatch(),
  probability: createSnapshot(
    MATCH_DATA.baselineProbs.homeWin,
    MATCH_DATA.baselineProbs.draw,
    MATCH_DATA.baselineProbs.awayWin,
  ),
  isRunning: false,
  tickCount: 0,
  isLive: false,

  startSimulation: (config) => {
    if (_intervalId) return

    const cfg: SimulatorConfig = {
      matchId: MATCH_DATA.matchId,
      intervalMs: config?.intervalMs ?? 10000,
      goalChancePerTick: config?.goalChancePerTick ?? 0.15,
      cardChancePerTick: config?.cardChancePerTick ?? 0.08,
      autoStart: true,
    }

    // Auto-start: switch to LIVE
    set((s) => {
      const m = { ...s.match }
      m.status = 'LIVE'
      m.startedAt = Date.now()
      m.currentMinute = 1
      m.lastUpdated = Date.now()
      return { match: m, isRunning: true, isLive: true, tickCount: 0 }
    })

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

      if (roll < cfg.goalChancePerTick) {
        // Goal — Scotland stronger (82% win prob), so bias toward them
        team = Math.random() < 0.82 ? 'away' : 'home'
        eventType = 'GOAL'
        player = team === 'away'
          ? SCOTLAND_PLAYERS[Math.floor(Math.random() * SCOTLAND_PLAYERS.length)]
          : HAITI_PLAYERS[Math.floor(Math.random() * HAITI_PLAYERS.length)]
      } else if (roll < cfg.goalChancePerTick + cfg.cardChancePerTick) {
        // Card — bias toward Haiti (weaker team more likely to foul)
        team = Math.random() < 0.55 ? 'home' : 'away'
        eventType = Math.random() < 0.3 ? 'RED_CARD' : 'YELLOW_CARD'
        player = team === 'home'
          ? HAITI_PLAYERS[Math.floor(Math.random() * HAITI_PLAYERS.length)]
          : SCOTLAND_PLAYERS[Math.floor(Math.random() * SCOTLAND_PLAYERS.length)]
      }

      if (eventType) {
        const evt: LiveEvent = {
          id: nanoid(8),
          minute: m.currentMinute,
          type: eventType,
          team,
          player,
          description: eventType === 'GOAL'
            ? `⚽ ${player} 进球！${team === 'home' ? '海地' : '苏格兰'} ${m.liveScore.home + (team === 'home' ? 1 : 0)}-${m.liveScore.away + (team === 'away' ? 1 : 0)}`
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
    set((s) => ({
      isRunning: false,
      match: { ...s.match, status: s.match.status === 'LIVE' || s.match.status === 'HT' ? 'FINISHED' : s.match.status },
    }))
  },

  resetSimulation: () => {
    if (_intervalId) { clearInterval(_intervalId); _intervalId = null }
    set({
      match: createInitialMatch(),
      probability: createSnapshot(
        MATCH_DATA.baselineProbs.homeWin,
        MATCH_DATA.baselineProbs.draw,
        MATCH_DATA.baselineProbs.awayWin,
      ),
      isRunning: false,
      tickCount: 0,
      isLive: false,
    })
  },
}))
