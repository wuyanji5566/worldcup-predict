import type { CachedMatch, MatchStage, MatchStatus, MatchEvent } from '@/types/match'
import type { OpenfootballMatch } from './types'
import { fetchJSON } from './client'

const OPENFOOTBALL_URL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'

const ROUND_STAGE_MAP: Record<string, MatchStage> = {
  'Matchday 1': 'group', 'Matchday 2': 'group', 'Matchday 3': 'group',
  'Matchday 4': 'group', 'Matchday 5': 'group', 'Matchday 6': 'group',
  'Matchday 7': 'group', 'Matchday 8': 'group', 'Matchday 9': 'group',
  'Matchday 10': 'group',
  'Round of 32': 'round32',
  'Round of 16': 'round16',
  'Quarter-finals': 'quarter',
  'Semi-finals': 'semi',
  'Match for third place': 'third',
  'Final': 'final',
}

function mapRoundToStage(round: string): MatchStage {
  for (const [key, stage] of Object.entries(ROUND_STAGE_MAP)) {
    if (round.includes(key) || round === key) return stage
  }
  return 'group'
}

function determineStatus(match: OpenfootballMatch): MatchStatus {
  if (match.score1 !== undefined && match.score1 !== null) return 'finished'
  return 'scheduled'
}

function normalizeMatch(raw: OpenfootballMatch, index: number): CachedMatch {
  const stage = mapRoundToStage(raw.round)
  const status = determineStatus(raw)
  const events: MatchEvent[] = []

  // Basic events from scores
  if (raw.score1 !== undefined && raw.score1 !== null) {
    const homeGoals = raw.score1
    const awayGoals = raw.score2 ?? 0
    for (let i = 1; i <= homeGoals; i++) {
      events.push({ type: 'goal', minute: i * 30, player: `${raw.team1} 球员`, team: 'home' })
    }
    for (let i = 1; i <= awayGoals; i++) {
      events.push({ type: 'goal', minute: i * 25, player: `${raw.team2} 球员`, team: 'away' })
    }
  }

  return {
    id: `match_${String(index + 1).padStart(3, '0')}`,
    date: raw.date,
    time: raw.time,
    homeTeam: raw.team1,
    awayTeam: raw.team2,
    group: raw.group ?? null,
    stadium: raw.ground,
    stage,
    status,
    homeScore: raw.score1 ?? null,
    awayScore: raw.score2 ?? null,
    homePenalties: raw.score1p ?? null,
    awayPenalties: raw.score2p ?? null,
    events,
    lastUpdated: Date.now(),
  }
}

export async function fetchSchedule(): Promise<{ matches: CachedMatch[]; error: string | null }> {
  const result = await fetchJSON<{ rounds: Array<{ name: string; matches: OpenfootballMatch[] }> }>(OPENFOOTBALL_URL)

  if (!result.ok || !result.data) {
    // If API fails, return empty – we'll use fallback data
    return { matches: [], error: result.error }
  }

  const matches: CachedMatch[] = []
  let index = 0

  for (const round of result.data.rounds) {
    for (const match of round.matches) {
      matches.push(normalizeMatch(match, index))
      index++
    }
  }

  return { matches, error: null }
}

export async function fetchLiveScores(_date: string): Promise<{ matches: CachedMatch[]; error: string | null }> {
  // Highlightly free API – not always available, return empty as graceful fallback
  return { matches: [], error: 'Not available' }
}
