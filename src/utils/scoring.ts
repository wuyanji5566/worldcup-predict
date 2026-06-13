import type { MatchStage, CachedMatch } from '@/types/match'
import type { Prediction } from '@/types/prediction'
import {
  STAGE_MULTIPLIERS,
  EXACT_SCORE_POINTS,
  CORRECT_OUTCOME_POINTS,
} from './constants'

export interface ScoreResult {
  basePoints: number
  stageMultiplier: number
  jokerMultiplier: number
  totalPoints: number
  isExactScore: boolean
  isCorrectOutcome: boolean
}

type Outcome = 'home' | 'away' | 'draw'

function getOutcome(home: number, away: number): Outcome {
  if (home > away) return 'home'
  if (home < away) return 'away'
  return 'draw'
}

export function calculatePredictionPoints(
  prediction: Pick<Prediction, 'predictedHomeScore' | 'predictedAwayScore' | 'jokerUsed'>,
  match: { homeScore: number; awayScore: number; stage: MatchStage },
): ScoreResult {
  const { predictedHomeScore, predictedAwayScore, jokerUsed } = prediction
  const { homeScore, awayScore, stage } = match

  let basePoints = 0
  let isExactScore = false
  let isCorrectOutcome = false

  if (predictedHomeScore === homeScore && predictedAwayScore === awayScore) {
    basePoints = EXACT_SCORE_POINTS
    isExactScore = true
  } else if (
    getOutcome(predictedHomeScore, predictedAwayScore) ===
    getOutcome(homeScore, awayScore)
  ) {
    basePoints = CORRECT_OUTCOME_POINTS
    isCorrectOutcome = true
  }

  const stageMultiplier = STAGE_MULTIPLIERS[stage] ?? 1
  const jokerMultiplier = jokerUsed ? 2 : 1
  const totalPoints = Math.round(basePoints * stageMultiplier * jokerMultiplier)

  return { basePoints, stageMultiplier, jokerMultiplier, totalPoints, isExactScore, isCorrectOutcome }
}

export function settlePrediction(
  prediction: Prediction,
  match: CachedMatch,
): Prediction {
  if (match.homeScore === null || match.awayScore === null) return prediction
  const result = calculatePredictionPoints(prediction, {
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    stage: match.stage,
  })
  return {
    ...prediction,
    points: result.totalPoints,
    basePoints: result.basePoints,
    stageMultiplier: result.stageMultiplier,
  }
}

export function computeAccuracy(
  predictions: Prediction[],
): { exactScores: number; correctOutcomes: number; total: number; accuracy: number } {
  const settled = predictions.filter((p) => p.points !== null)
  const exactScores = settled.filter((p) => p.basePoints === EXACT_SCORE_POINTS).length
  const correctOutcomes = settled.filter((p) => p.basePoints === CORRECT_OUTCOME_POINTS).length
  const total = settled.length
  const accuracy = total > 0 ? (exactScores * EXACT_SCORE_POINTS + correctOutcomes) / total : 0
  return { exactScores, correctOutcomes, total, accuracy }
}
