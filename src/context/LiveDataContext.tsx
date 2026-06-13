// ============================================================
// Global Live Data Context — single source of truth for all
// 4 June 14 matches, consumed by Dashboard, Analysis, Leaderboard
// ============================================================

import { createContext, useContext, useMemo, useRef, useEffect, type ReactNode } from 'react'
import { useLiveSyncStore } from '@/services/liveSync'
import { recalculateProbabilities } from '@/services/liveEngine'
import { useUIStore } from '@/store/uiStore'
import { calculatePredictionPoints } from '@/services/settlementEngine'
import { useAuthStore } from '@/store/authStore'
import { usePredictionStore } from '@/store/predictionStore'
import { useLeaderboardStore } from '@/store/leaderboardStore'
import { useMatchStore } from '@/store/matchStore'
import type { LiveMatch, ProbabilitySnapshot, LiveEvent } from '@/services/liveTypes'

// ---- Context value shape ----
export interface LiveDataContextValue {
  // Current primary match
  match: LiveMatch
  probability: ProbabilitySnapshot
  isRunning: boolean
  isLive: boolean
  tickCount: number

  // Actions
  startSimulation: () => void
  stopSimulation: () => void
  resetSimulation: () => void

  // All 4 June 14 matches (for future expansion)
  allMatches: LiveMatch[]
  allProbabilities: ProbabilitySnapshot[]

  // Last event for real-time display
  lastEvent: LiveEvent | null
  lastUpdateTimestamp: number
}

const LiveDataContext = createContext<LiveDataContextValue | null>(null)

// ---- Match data for all 4 June 14 fixtures ----
const ALL_MATCHES = [
  { mid: 'j14-m1', home: { name: 'Haiti', flag: '🇭🇹', nameZh: '海地' }, away: { name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', nameZh: '苏格兰' }, baseline: { h: 6, d: 12, a: 82 }, kickoff: '2026-06-14T10:00:00Z' },
  { mid: 'j14-m2', home: { name: 'Qatar', flag: '🇶🇦', nameZh: '卡塔尔' }, away: { name: 'Switzerland', flag: '🇨🇭', nameZh: '瑞士' }, baseline: { h: 12, d: 20, a: 68 }, kickoff: '2026-06-14T14:00:00Z' },
  { mid: 'j14-m3', home: { name: 'Brazil', flag: '🇧🇷', nameZh: '巴西' }, away: { name: 'Morocco', flag: '🇲🇦', nameZh: '摩洛哥' }, baseline: { h: 48, d: 30, a: 22 }, kickoff: '2026-06-14T18:00:00Z' },
  { mid: 'j14-m4', home: { name: 'Australia', flag: '🇦🇺', nameZh: '澳大利亚' }, away: { name: 'Turkey', flag: '🇹🇷', nameZh: '土耳其' }, baseline: { h: 28, d: 26, a: 46 }, kickoff: '2026-06-14T22:00:00Z' },
]

export function LiveDataProvider({ children }: { children: ReactNode }) {
  const match = useLiveSyncStore((s) => s.match)
  const probability = useLiveSyncStore((s) => s.probability)
  const isRunning = useLiveSyncStore((s) => s.isRunning)
  const isLive = useLiveSyncStore((s) => s.isLive)
  const tickCount = useLiveSyncStore((s) => s.tickCount)
  const startSimulation = useLiveSyncStore((s) => s.startSimulation)
  const stopSimulation = useLiveSyncStore((s) => s.stopSimulation)
  const resetSimulation = useLiveSyncStore((s) => s.resetSimulation)

  // Settlement refs
  const settledRef = useRef(false)
  const prevStatusRef = useRef(match.status)
  const addToast = useUIStore((s) => s.addToast)

  // ---- Sync live data into matchStore so "比赛" page shows real-time scores ----
  useEffect(() => {
    const store = useMatchStore.getState()
    store.syncLiveMatch(match.matchId, {
      homeScore: match.liveScore.home,
      awayScore: match.liveScore.away,
      status: match.status,
      minute: match.currentMinute,
    })
  }, [match.matchId, match.liveScore, match.status, match.currentMinute])

  // ---- Auto-settlement on FINISHED (memoized via ref) ----
  useEffect(() => {
    if (match.status === 'FINISHED' && prevStatusRef.current !== 'FINISHED' && !settledRef.current) {
      settledRef.current = true
      const user = useAuthStore.getState().currentUser
      if (user) {
        const pred = usePredictionStore.getState().getPredictionForMatch(user.id, match.matchId)
        const { points, type } = calculatePredictionPoints(
          pred?.predictedHomeScore ?? 0, pred?.predictedAwayScore ?? 0,
          match.liveScore.home, match.liveScore.away,
        )
        useLeaderboardStore.getState().recompute()
        const msg = type === 'exact' ? `🎯 完美命中！+${points} 分`
          : type === 'goal_diff' ? `📊 净胜球正确！+${points} 分`
          : type === 'outcome' ? `✅ 胜负正确！+${points} 分`
          : `❌ 未命中`
        addToast(msg, type === 'exact' ? 'success' : type === 'wrong' ? 'error' : 'success')
      }
    }
    if (match.status === 'UPCOMING' && match.liveScore.home === 0 && match.liveScore.away === 0) {
      settledRef.current = false
    }
    prevStatusRef.current = match.status
  }, [match.status, match.matchId, match.liveScore, addToast])

  // ---- Memoized probability for all 4 matches ----
  const allProbabilities = useMemo(() => {
    return ALL_MATCHES.map((m) => {
      if (m.mid === match.matchId) return probability
      return recalculateProbabilities({
        baseline: { homeWin: m.baseline.h, draw: m.baseline.d, awayWin: m.baseline.a, homeGoals: 0, awayGoals: 0, confidence: 3, bestScores: '?' },
        live: { homeWin: m.baseline.h, draw: m.baseline.d, awayWin: m.baseline.a, homeGoals: 0, awayGoals: 0, confidence: 3, bestScores: '?' },
        momentum: 'neutral', momentumStrength: 0,
        redCardHome: false, redCardAway: false,
        goalsHome: 0, goalsAway: 0, minutesPlayed: 0,
        lastEvent: '未开赛', updatedAt: Date.now(),
      })
    })
  }, [match.matchId, probability])

  const lastEvent = match.liveEvents[0] ?? null

  const value = useMemo<LiveDataContextValue>(() => ({
    match, probability, isRunning, isLive, tickCount,
    startSimulation, stopSimulation, resetSimulation,
    allMatches: [match], // Future: expand to all 4
    allProbabilities,
    lastEvent,
    lastUpdateTimestamp: match.lastUpdated,
  }), [match, probability, isRunning, isLive, tickCount,
      startSimulation, stopSimulation, resetSimulation,
      allProbabilities, lastEvent])

  return (
    <LiveDataContext.Provider value={value}>
      {children}
    </LiveDataContext.Provider>
  )
}

export function useLiveData(): LiveDataContextValue {
  const ctx = useContext(LiveDataContext)
  if (!ctx) throw new Error('useLiveData must be used within LiveDataProvider')
  return ctx
}
