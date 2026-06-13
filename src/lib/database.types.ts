// ============================================================
// Supabase Database Types — matches SQL schema below
// ============================================================

export interface DBUser {
  id: string
  username: string
  display_name: string
  avatar: string
  created_at: string
  is_demo: boolean
}

export interface DBMatch {
  id: string
  date: string
  time: string
  home_team: string
  away_team: string
  group_name: string | null
  stadium: string
  stage: string
  status: string
  home_score: number | null
  away_score: number | null
  home_penalties: number | null
  away_penalties: number | null
  events: Record<string, unknown>[]
  last_updated: string
}

export interface DBPrediction {
  id: string
  user_id: string
  match_id: string
  predicted_home_score: number
  predicted_away_score: number
  joker_used: boolean
  submitted_at: string
  settled: boolean
  points: number | null
  settlement_type: string | null
  stage_multiplier: number
}

export interface DBComment {
  id: string
  user_id: string
  match_id: string
  username: string
  text: string
  created_at: string
}

export interface DBLeaderboard {
  user_id: string
  display_name: string
  total_points: number
  exact_count: number
  goal_diff_count: number
  outcome_count: number
  total_predictions: number
  accuracy: number
  updated_at: string
}

export type Tables = {
  users: DBUser
  matches: DBMatch
  predictions: DBPrediction
  comments: DBComment
  leaderboard: DBLeaderboard
}
