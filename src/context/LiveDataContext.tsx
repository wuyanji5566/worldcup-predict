// ============================================================
// Global Live Data Context — single source of truth
// Uses real match data from matchStore + live simulation engine
// ============================================================

import { createContext, useContext, useMemo, useRef, useEffect, type ReactNode } from 'react'
import { useLiveSyncStore } from '@/services/liveSync'
import { useUIStore } from '@/store/uiStore'
import { calculatePredictionPoints } from '@/services/settlementEngine'
import { useAuthStore } from '@/store/authStore'
import { usePredictionStore } from '@/store/predictionStore'
import { useLeaderboardStore } from '@/store/leaderboardStore'
import { useMatchStore } from '@/store/matchStore'
import type { LiveMatch, ProbabilitySnapshot, LiveEvent } from '@/services/liveTypes'

// ---- Context value shape ----
export interface LiveDataContextValue {
  match: LiveMatch
  probability: ProbabilitySnapshot
  isRunning: boolean
  isLive: boolean
  tickCount: number

  startSimulation: () => void
  stopSimulation: () => void
  resetSimulation: () => void

  allMatches: LiveMatch[]
  allProbabilities: ProbabilitySnapshot[]

  lastEvent: LiveEvent | null
  lastUpdateTimestamp: number
}

const LiveDataContext = createContext<LiveDataContextValue | null>(null)

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
  const settledRef = useRef(new Set<string>())
  const prevStatusRef = useRef(match.status)

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

  // ---- Auto-settlement on FINISHED ----
  useEffect(() => {
    const matchKey = `${match.matchId}-${match.status}`
    if (match.status === 'FINISHED' && prevStatusRef.current !== 'FINISHED' && !settledRef.current.has(matchKey)) {
      settledRef.current.add(matchKey)
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
        useUIStore.getState().addToast(msg, type === 'exact' ? 'success' : type === 'wrong' ? 'error' : 'success')
      }
    }
    if (match.status === 'UPCOMING' && match.liveScore.home === 0 && match.liveScore.away === 0) {
      // Reset for new match
    }
    prevStatusRef.current = match.status
  }, [match.status, match.matchId, match.liveScore])

  // ---- Attempt to auto-start simulation for today's real live matches ----
  useEffect(() => {
    const store = useMatchStore.getState()
    const liveMatches = Object.values(store.matches).filter(
      (m) => m.status === 'live' && m.date === new Date().toISOString().split('T')[0],
    )
    if (liveMatches.length > 0 && !isRunning) {
      // Auto-start simulation for the first live match
      const timer = setTimeout(() => {
        startSimulation()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, []) // eslint-disable-line

  const lastEvent = match.liveEvents[0] ?? null

  const value = useMemo<LiveDataContextValue>(() => ({
    match, probability, isRunning, isLive, tickCount,
    startSimulation, stopSimulation, resetSimulation,
    allMatches: [match],
    allProbabilities: [probability],
    lastEvent,
    lastUpdateTimestamp: match.lastUpdated,
  }), [match, probability, isRunning, isLive, tickCount,
      startSimulation, stopSimulation, resetSimulation,
      lastEvent])

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
