import { create } from 'zustand'
import type { LeaderboardEntry } from '@/types/leaderboard'
import { computeAccuracy } from '@/utils/scoring'
import { useAuthStore } from './authStore'
import { usePredictionStore } from './predictionStore'

interface LeaderboardStore {
  entries: LeaderboardEntry[]
  recompute: () => void
}

export const useLeaderboardStore = create<LeaderboardStore>((set) => ({
  entries: [],

  recompute: () => {
    const users = useAuthStore.getState().users
    const predictions = usePredictionStore.getState().predictions
    const entries: LeaderboardEntry[] = []

    for (const user of users) {
      const userPreds = Object.values(predictions).filter((p) => p.userId === user.id)
      const { exactScores, correctOutcomes, total, accuracy } = computeAccuracy(userPreds)
      const totalPoints = userPreds.reduce((sum, p) => sum + (p.points ?? 0), 0)

      entries.push({
        rank: 0,
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        totalPoints,
        exactScores,
        correctOutcomes,
        totalPredictions: total,
        accuracy: Math.round(accuracy * 100) / 100,
      })
    }

    entries.sort((a, b) => b.totalPoints - a.totalPoints)
    entries.forEach((e, i) => { e.rank = i + 1 })

    set({ entries })
  },
}))
