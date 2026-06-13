// ============================================================
// Sports API — TypeScript Type Definitions
// ============================================================

/** Real-time match status from API feed */
export interface MatchLiveStatus {
  matchId: string
  status: 'NS' | 'LIVE' | 'HT' | 'FT' | 'PST' | 'CANC'
  minute: number | null
  homeScore: number
  awayScore: number
  homePenalties: number | null
  awayPenalties: number | null
  lastUpdated: number
  events: LiveEvent[]
}

export interface LiveEvent {
  type: 'goal' | 'penalty_goal' | 'own_goal' | 'yellow_card' | 'red_card' | 'substitution'
  minute: number
  player: string
  team: 'home' | 'away'
  assistPlayer?: string
}

/** User prediction record for settlement */
export interface UserPrediction {
  predictionId: string
  userId: string
  matchId: string
  predictedHomeScore: number
  predictedAwayScore: number
  submittedAt: number
  settled: boolean
  pointsAwarded: number | null
  settlementType: SettlementType | null
}

/** Tiered settlement result type */
export type SettlementType =
  | 'exact'        // 10 pts — exact score match
  | 'goal_diff'    // 5 pts  — goal difference + outcome match
  | 'outcome'      // 3 pts  — outcome only match
  | 'wrong'        // 0 pts  — completely wrong

/** Settlement result returned by the engine */
export interface SettlementResult {
  predictionId: string
  matchId: string
  userId: string
  predicted: { home: number; away: number }
  actual: { home: number; away: number }
  settlementType: SettlementType
  points: number
  settledAt: number
}

/** Live score snapshot for UI display */
export interface LiveScore {
  matchId: string
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  homeScore: number
  awayScore: number
  minute: number | null
  status: MatchLiveStatus['status']
  stage: string
  group: string
}

/** Real match result (June 14 data) */
export interface MatchResult {
  matchId: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  stage: string
  group: string
}

/** API response wrapper */
export interface ApiResponse<T> {
  ok: boolean
  data: T | null
  error: string | null
  cached: boolean
  timestamp: number
}

/** API feed configuration */
export interface ApiConfig {
  baseUrl: string
  apiKey: string
  leagueId: number
  season: number
  refreshIntervalMs: number
}

/** Dev simulation summary */
export interface DevSimulationSummary {
  totalMatches: number
  totalPredictions: number
  settled: number
  exactMatches: number
  goalDiffMatches: number
  outcomeMatches: number
  wrongPredictions: number
  totalPointsAwarded: number
  leaderboardUpdated: boolean
  timestamp: number
}
