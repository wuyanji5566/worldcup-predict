export interface Prediction {
  userId: string
  matchId: string
  predictedHomeScore: number
  predictedAwayScore: number
  predictedWinner: string | null
  submittedAt: number
  lockedAt: number | null
  points: number | null
  basePoints: number | null
  stageMultiplier: number | null
  jokerUsed: boolean
}

export interface PredictionInput {
  matchId: string
  homeScore: number
  awayScore: number
  jokerUsed: boolean
}

export type PredictionLockStatus = 'open' | 'locked' | 'settled'
