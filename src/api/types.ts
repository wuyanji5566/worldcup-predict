export interface OpenfootballMatch {
  round: string
  date: string
  time: string
  team1: string
  team2: string
  group?: string
  ground: string
  score1?: number
  score2?: number
  score1et?: number
  score2et?: number
  score1p?: number
  score2p?: number
}

export interface HighlightlyMatch {
  id: number
  date: string
  time: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  status: string
  league: { id: number; name: string }
  events?: Array<Record<string, unknown>>
}

export interface HighlightlyStanding {
  position: number
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
