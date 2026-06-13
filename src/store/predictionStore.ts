import { create } from 'zustand'
import type { Prediction } from '@/types/prediction'
import { getItem, setItem } from '@/utils/storage'
import { settlePrediction } from '@/utils/scoring'
import { useAuthStore } from './authStore'
import { useMatchStore } from './matchStore'

interface PredictionStore {
  predictions: Record<string, Prediction>
  submitPrediction: (matchId: string, homeScore: number, awayScore: number, jokerUsed: boolean) => boolean
  getPredictionsForUser: (userId: string) => Prediction[]
  getPredictionForMatch: (userId: string, matchId: string) => Prediction | undefined
  settleAllPredictions: () => void
  canPredict: (matchId: string) => boolean
  hasJokerInStage: (userId: string, stage: 'group' | 'knockout') => boolean
}

function makeKey(userId: string, matchId: string): string {
  return `${userId}_${matchId}`
}

export const usePredictionStore = create<PredictionStore>((set, get) => ({
  predictions: getItem<Record<string, Prediction>>('predictions', {}),

  submitPrediction: (matchId, homeScore, awayScore, jokerUsed) => {
    const user = useAuthStore.getState().currentUser
    if (!user) return false

    const match = useMatchStore.getState().getMatchById(matchId)
    if (!match) return false

    const key = makeKey(user.id, matchId)
    const prediction: Prediction = {
      userId: user.id,
      matchId,
      predictedHomeScore: homeScore,
      predictedAwayScore: awayScore,
      predictedWinner: null,
      submittedAt: Date.now(),
      lockedAt: match.status !== 'scheduled' ? Date.now() : null,
      points: null,
      basePoints: null,
      stageMultiplier: null,
      jokerUsed,
    }

    const newPredictions = { ...get().predictions, [key]: prediction }
    set({ predictions: newPredictions })
    setItem('predictions', newPredictions)
    return true
  },

  getPredictionsForUser: (userId) => {
    return Object.values(get().predictions).filter((p) => p.userId === userId)
  },

  getPredictionForMatch: (userId, matchId) => {
    return get().predictions[makeKey(userId, matchId)]
  },

  settleAllPredictions: () => {
    const matches = useMatchStore.getState().matches
    const newPredictions = { ...get().predictions }
    let changed = false

    for (const [key, pred] of Object.entries(newPredictions)) {
      if (pred.points !== null) continue
      const match = matches[pred.matchId]
      if (!match || match.status !== 'finished') continue
      if (match.homeScore === null || match.awayScore === null) continue

      newPredictions[key] = settlePrediction(pred, match)
      changed = true
    }

    if (changed) {
      set({ predictions: newPredictions })
      setItem('predictions', newPredictions)
    }
  },

  canPredict: (matchId) => {
    const match = useMatchStore.getState().getMatchById(matchId)
    if (!match) return false
    return match.status === 'scheduled'
  },

  hasJokerInStage: (userId, stage) => {
    const userPreds = get().getPredictionsForUser(userId)
    const isKnockout = stage === 'knockout'
    return userPreds.filter((p) => {
      const match = useMatchStore.getState().getMatchById(p.matchId)
      if (!match) return false
      const isMatchKnockout = match.stage !== 'group'
      return p.jokerUsed && isMatchKnockout === isKnockout
    }).length === 0
  },
}))
