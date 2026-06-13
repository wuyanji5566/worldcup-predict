import { useCallback } from 'react'
import { usePredictionStore } from '@/store/predictionStore'
import { useAuthStore } from '@/store/authStore'

export function usePredictions() {
  const user = useAuthStore((s) => s.currentUser)
  const submitPrediction = usePredictionStore((s) => s.submitPrediction)
  const canPredict = usePredictionStore((s) => s.canPredict)
  const hasJokerInStage = usePredictionStore((s) => s.hasJokerInStage)
  const getPredictionsForUser = usePredictionStore((s) => s.getPredictionsForUser)
  const getPredictionForMatch = usePredictionStore((s) => s.getPredictionForMatch)

  const myPredictions = user ? getPredictionsForUser(user.id) : []

  const submit = useCallback(
    (matchId: string, homeScore: number, awayScore: number, jokerUsed: boolean) => {
      return submitPrediction(matchId, homeScore, awayScore, jokerUsed)
    },
    [submitPrediction],
  )

  const getMatchPoints = useCallback(
    (matchId: string): number | null => {
      if (!user) return null
      const pred = getPredictionForMatch(user.id, matchId)
      return pred?.points ?? null
    },
    [user, getPredictionForMatch],
  )

  return {
    myPredictions,
    submitPrediction: submit,
    canPredict,
    hasJokerInStage,
    getPredictionForMatch,
    getMatchPoints,
  }
}
