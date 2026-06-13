import { useEffect, useRef, useState, useCallback } from 'react'
import { useLiveSyncStore } from '@/services/liveSync'
import type { GoalToastData } from '@/components/ui/GoalToast'
import { calculatePredictionPoints } from '@/services/settlementEngine'
import { useAuthStore } from '@/store/authStore'
import { usePredictionStore } from '@/store/predictionStore'
import { useLeaderboardStore } from '@/store/leaderboardStore'
import { useUIStore } from '@/store/uiStore'
import { nanoid } from 'nanoid'

interface UseLiveNotificationsReturn {
  goalToasts: GoalToastData[]
  dismissGoalToast: (id: string) => void
  showConfetti: boolean
  dismissConfetti: () => void
  settlementMessage: string | null
}

export function useLiveNotifications(): UseLiveNotificationsReturn {
  const [goalToasts, setGoalToasts] = useState<GoalToastData[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [settlementMessage, setSettlementMessage] = useState<string | null>(null)

  const prevEventCount = useRef(0)
  const prevStatus = useRef<string>('UPCOMING')
  const settled = useRef(false)

  const addToast = useUIStore((s) => s.addToast)

  const match = useLiveSyncStore((s) => s.match)
  const probability = useLiveSyncStore((s) => s.probability)
  const probBefore = useRef(probability.live.awayWin)

  const dismissGoalToast = useCallback((id: string) => {
    setGoalToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const dismissConfetti = useCallback(() => setShowConfetti(false), [])

  // ---- GOAL DETECTION ----
  useEffect(() => {
    const events = match.liveEvents
    if (events.length <= prevEventCount.current) {
      prevEventCount.current = events.length
      return
    }

    // New events added — find GOAL events
    const newEvents = events.slice(0, events.length - prevEventCount.current)
    for (const evt of newEvents) {
      if (evt.type === 'GOAL') {
        const teamName = evt.team === 'home' ? '海地' : '苏格兰'
        const before = probBefore.current
        const after = evt.team === 'home'
          ? probability.live.homeWin
          : probability.live.awayWin

        const toastData: GoalToastData = {
          id: nanoid(8),
          event: evt,
          homeScore: match.liveScore.home,
          awayScore: match.liveScore.away,
          probBefore: before,
          probAfter: after,
          createdAt: Date.now(),
        }

        setGoalToasts((prev) => [toastData, ...prev].slice(0, 5))

        // Also trigger global toast
        addToast(
          `⚽ ${teamName} ${evt.minute}' 进球！比分 ${match.liveScore.home}-${match.liveScore.away}`,
          'info',
        )

        probBefore.current = after
      }
    }

    prevEventCount.current = events.length
  }, [match.liveEvents, match.liveScore, probability, addToast])

  // ---- MATCH FINISHED → SETTLEMENT ----
  useEffect(() => {
    if (match.status === 'FINISHED' && prevStatus.current !== 'FINISHED' && !settled.current) {
      settled.current = true

      const user = useAuthStore.getState().currentUser
      if (!user) return

      const predStore = usePredictionStore.getState()
      const pred = predStore.getPredictionForMatch(user.id, match.matchId)

      const { points, type } = calculatePredictionPoints(
        pred?.predictedHomeScore ?? 0,
        pred?.predictedAwayScore ?? 0,
        match.liveScore.home,
        match.liveScore.away,
      )

      // Update prediction if exists
      if (pred) {
        predStore.submitPrediction(match.matchId, pred.predictedHomeScore, pred.predictedAwayScore, pred.jokerUsed)
      }

      // Re-rank leaderboard
      useLeaderboardStore.getState().recompute()

      // Settlement message
      const msg = type === 'exact'
        ? `🎯 完美命中！预测比分与结果完全一致！+${points} 分`
        : type === 'goal_diff'
          ? `📊 净胜球正确！+${points} 分`
          : type === 'outcome'
            ? `✅ 胜负正确！+${points} 分`
            : `❌ 未命中，继续加油`

      setSettlementMessage(msg)
      addToast(msg, type === 'exact' ? 'success' : type === 'wrong' ? 'error' : 'success')

      // Confetti for perfect prediction
      if (type === 'exact') {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)
      }
    }

    prevStatus.current = match.status
  }, [match.status, match.matchId, match.liveScore, addToast])

  // Reset settled flag on reset
  useEffect(() => {
    if (match.status === 'UPCOMING' && match.liveScore.home === 0 && match.liveScore.away === 0) {
      settled.current = false
      prevEventCount.current = 0
      probBefore.current = probability.live.awayWin
      setSettlementMessage(null)
    }
  }, [match.status, match.liveScore, probability])

  return {
    goalToasts,
    dismissGoalToast,
    showConfetti,
    dismissConfetti,
    settlementMessage,
  }
}
