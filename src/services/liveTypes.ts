// ============================================================
// Live Match Sync — Type Definitions
// ============================================================

export type MatchLiveStatus = 'UPCOMING' | 'LIVE' | 'HT' | 'FINISHED'

export interface LiveScore {
  home: number
  away: number
}

export interface LiveEvent {
  id: string
  minute: number
  type: 'GOAL' | 'PENALTY_GOAL' | 'OWN_GOAL' | 'RED_CARD' | 'YELLOW_CARD' | 'SUBSTITUTION' | 'VAR_CHECK'
  team: 'home' | 'away'
  player: string
  assistPlayer?: string
  description: string
  timestamp: number
}

export interface TeamInfo {
  name: string
  flag: string
  nameZh: string
}

export interface LiveMatch {
  matchId: string
  status: MatchLiveStatus
  homeTeam: TeamInfo
  awayTeam: TeamInfo
  liveScore: LiveScore
  currentMinute: number
  stoppageTime: number
  liveEvents: LiveEvent[]
  kickoffTime: number     // unix ms
  startedAt: number | null
  lastUpdated: number
}

export interface ProbabilityState {
  homeWin: number    // 0-100
  draw: number       // 0-100
  awayWin: number    // 0-100
  homeGoals: number  // expected goals
  awayGoals: number
  confidence: number // 1-5
  bestScores: string
}

export interface ProbabilitySnapshot {
  baseline: ProbabilityState
  live: ProbabilityState
  momentum: 'home' | 'away' | 'neutral'
  momentumStrength: number  // 0-100
  redCardHome: boolean
  redCardAway: boolean
  goalsHome: number
  goalsAway: number
  minutesPlayed: number
  lastEvent: string
  updatedAt: number
}

export interface SimulatorConfig {
  matchId: string
  intervalMs: number       // how often to tick (default 10000)
  goalChancePerTick: number // 0-1 (default 0.15)
  cardChancePerTick: number // 0-1 (default 0.08)
  autoStart: boolean
}
