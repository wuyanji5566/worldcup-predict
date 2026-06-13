// ============================================================
// Supabase Data Service — CRUD for matches, predictions, comments
// Falls back to localStorage when Supabase not configured
// ============================================================
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabase } from './supabase'
import type { DBPrediction, DBComment } from './database.types'

type SbClient = SupabaseClient | null

// ---- Matches ----
export async function fetchMatchesFromDB() {
  const sb: SbClient = getSupabase()
  if (!sb) return null
  const { data } = await sb.from('matches').select('*').order('date')
  return data
}

export async function upsertMatches(matches: Record<string, unknown>[]) {
  const sb: SbClient = getSupabase()
  if (!sb) return
  const rows = matches.map((m) => ({
    id: m.id,
    date: m.date,
    time: m.time,
    home_team: m.homeTeam,
    away_team: m.awayTeam,
    group_name: m.group,
    stadium: m.stadium,
    stage: m.stage,
    status: m.status,
    home_score: m.homeScore,
    away_score: m.awayScore,
    home_penalties: m.homePenalties,
    away_penalties: m.awayPenalties,
    events: m.events ?? [],
    last_updated: new Date().toISOString(),
  }))
  await sb.from('matches').upsert(rows, { onConflict: 'id' })
}

// ---- Predictions ----
export async function fetchPredictionsFromDB() {
  const sb: SbClient = getSupabase()
  if (!sb) return null
  const { data } = await sb.from('predictions').select('*')
  return data as DBPrediction[] | null
}

export async function submitPredictionToDB(prediction: {
  id: string; userId: string; matchId: string
  homeScore: number; awayScore: number; jokerUsed: boolean
}) {
  const sb: SbClient = getSupabase()
  if (!sb) return null
  const { data, error } = await sb.from('predictions').upsert({
    id: prediction.id,
    user_id: prediction.userId,
    match_id: prediction.matchId,
    predicted_home_score: prediction.homeScore,
    predicted_away_score: prediction.awayScore,
    joker_used: prediction.jokerUsed,
    submitted_at: new Date().toISOString(),
    settled: false,
    points: null,
    settlement_type: null,
    stage_multiplier: 1,
  }, { onConflict: 'user_id,match_id' })
  return { data, error }
}

export async function settlePredictionsInDB(
  settlements: Array<{
    id: string; points: number; settlementType: string
  }>,
) {
  const sb: SbClient = getSupabase()
  if (!sb) return
  for (const s of settlements) {
    await sb.from('predictions').update({
      settled: true,
      points: s.points,
      settlement_type: s.settlementType,
    }).eq('id', s.id)
  }
  // Refresh leaderboard materialized view
  await sb.rpc('refresh_leaderboard')
}

// ---- Comments ----
export async function fetchCommentsFromDB(matchId: string) {
  const sb: SbClient = getSupabase()
  if (!sb) return null
  const { data } = await sb.from('comments')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: false })
    .limit(50)
  return data as DBComment[] | null
}

export async function insertCommentToDB(comment: {
  id: string; userId: string; matchId: string; username: string; text: string
}) {
  const sb: SbClient = getSupabase()
  if (!sb) return null
  const { data, error } = await sb.from('comments').insert({
    id: comment.id,
    user_id: comment.userId,
    match_id: comment.matchId,
    username: comment.username,
    text: comment.text,
    created_at: new Date().toISOString(),
  })
  return { data, error }
}

export async function deleteCommentFromDB(commentId: string) {
  const sb: SbClient = getSupabase()
  if (!sb) return null
  await sb.from('comments').delete().eq('id', commentId)
}

// ---- Leaderboard ----
export async function fetchLeaderboardFromDB() {
  const sb: SbClient = getSupabase()
  if (!sb) return null
  const { data } = await sb.from('leaderboard').select('*')
  return data
}

// ---- Realtime Subscriptions ----
export function subscribeToMatches(callback: (payload: unknown) => void) {
  const sb = getSupabase()
  if (!sb) return { unsubscribe: () => {} }
  return sb.channel('matches-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (p) => callback(p))
    .subscribe()
}

export function subscribeToComments(matchId: string, callback: (payload: unknown) => void) {
  const sb = getSupabase()
  if (!sb) return { unsubscribe: () => {} }
  return sb.channel(`comments-${matchId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'comments',
      filter: `match_id=eq.${matchId}`,
    }, (p) => callback(p))
    .subscribe()
}
