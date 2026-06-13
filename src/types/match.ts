export type MatchStage =
  | 'group'
  | 'round32'
  | 'round16'
  | 'quarter'
  | 'semi'
  | 'third'
  | 'final'

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed'

export interface MatchEvent {
  type: 'goal' | 'penalty_goal' | 'yellow_card' | 'red_card' | 'substitution' | 'var'
  minute: number
  player: string
  team: 'home' | 'away'
  detail?: string
}

export interface CachedMatch {
  id: string
  date: string
  time: string
  homeTeam: string
  awayTeam: string
  group: string | null
  stadium: string
  stage: MatchStage
  status: MatchStatus
  homeScore: number | null
  awayScore: number | null
  homePenalties: number | null
  awayPenalties: number | null
  events: MatchEvent[]
  lastUpdated: number
}

export interface GroupStanding {
  group: string
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
}
