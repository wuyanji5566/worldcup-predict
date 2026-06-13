// ============================================================
// Sports API Client — Live Football Data Fetching
// Target: Football-Data.org / API-Football compatible
// ============================================================

import type {
  ApiResponse,
  ApiConfig,
  MatchLiveStatus,
  LiveScore,
  MatchResult,
} from './types'

// ---- Default config (mock environment) ----
const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: 'https://api.football-data.org/v4',
  apiKey: '', // Set via environment or user input
  leagueId: 2026, // World Cup
  season: 2026,
  refreshIntervalMs: 30000, // 30s polling
}

let activeConfig: ApiConfig = { ...DEFAULT_CONFIG }

export function configureApi(config: Partial<ApiConfig>): void {
  activeConfig = { ...activeConfig, ...config }
}

export function getApiConfig(): Readonly<ApiConfig> {
  return activeConfig
}

// ---- Fetch wrapper with timeout & retry ----
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 10000,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }

  if (activeConfig.apiKey) {
    headers['X-Auth-Token'] = activeConfig.apiKey
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    })
    return res
  } finally {
    clearTimeout(timer)
  }
}

// ---- Public API methods ----

/** Fetch live match status for a specific match */
export async function fetchLiveMatchStatus(matchId: string): Promise<ApiResponse<MatchLiveStatus>> {
  const url = `${activeConfig.baseUrl}/matches/${matchId}`
  try {
    const res = await fetchWithTimeout(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw = await res.json()
    return {
      ok: true,
      data: normalizeLiveStatus(raw),
      error: null,
      cached: false,
      timestamp: Date.now(),
    }
  } catch (err) {
    return {
      ok: false,
      data: null,
      error: err instanceof Error ? err.message : 'Network error',
      cached: false,
      timestamp: Date.now(),
    }
  }
}

/** Fetch all live scores for the tournament */
export async function fetchLiveScores(): Promise<ApiResponse<LiveScore[]>> {
  const url = `${activeConfig.baseUrl}/competitions/${activeConfig.leagueId}/matches?season=${activeConfig.season}&status=LIVE`
  try {
    const res = await fetchWithTimeout(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw = await res.json()
    return {
      ok: true,
      data: (raw.matches ?? []).map(normalizeLiveScore),
      error: null,
      cached: false,
      timestamp: Date.now(),
    }
  } catch (err) {
    return {
      ok: false,
      data: null,
      error: err instanceof Error ? err.message : 'Network error',
      cached: false,
      timestamp: Date.now(),
    }
  }
}

/** Fetch match results for a specific date (for settlement) */
export async function fetchResultsByDate(date: string): Promise<ApiResponse<MatchResult[]>> {
  const url = `${activeConfig.baseUrl}/competitions/${activeConfig.leagueId}/matches?season=${activeConfig.season}&dateFrom=${date}&dateTo=${date}`
  try {
    const res = await fetchWithTimeout(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw = await res.json()
    const results: MatchResult[] = ((raw.matches ?? []) as RawResultMatch[])
      .filter((m) => m.status === 'FINISHED')
      .map((m) => ({
        matchId: String(m.id),
        homeTeam: String(m.homeTeam?.name ?? 'Unknown'),
        awayTeam: String(m.awayTeam?.name ?? 'Unknown'),
        homeScore: Number(m.score?.fullTime?.home ?? 0),
        awayScore: Number(m.score?.fullTime?.away ?? 0),
        stage: String(m.stage ?? 'GROUP'),
        group: String(m.group ?? '?'),
      }))
    return {
      ok: true,
      data: results,
      error: null,
      cached: false,
      timestamp: Date.now(),
    }
  } catch (err) {
    return {
      ok: false,
      data: null,
      error: err instanceof Error ? err.message : 'Network error',
      cached: false,
      timestamp: Date.now(),
    }
  }
}

// ---- Raw API types ----
interface RawMatch {
  id: unknown
  status: unknown
  minute: unknown
  stage: unknown
  group: unknown
  homeTeam?: { name?: string }
  awayTeam?: { name?: string }
  score?: {
    fullTime?: { home?: number; away?: number }
    penalties?: { home?: number; away?: number }
  }
}

interface RawResultMatch {
  id: unknown
  status: unknown
  stage: unknown
  group: unknown
  homeTeam?: { name?: string }
  awayTeam?: { name?: string }
  score?: { fullTime?: { home?: number; away?: number } }
}

// ---- Normalizers (API response → our types) ----

function normalizeLiveStatus(raw: RawMatch): MatchLiveStatus {
  const score = raw.score
  return {
    matchId: String(raw.id),
    status: (raw.status as MatchLiveStatus['status']) ?? 'NS',
    minute: (raw.minute as number) ?? null,
    homeScore: Number(score?.fullTime?.home ?? 0),
    awayScore: Number(score?.fullTime?.away ?? 0),
    homePenalties: score?.penalties?.home != null ? Number(score.penalties.home) : null,
    awayPenalties: score?.penalties?.away != null ? Number(score.penalties.away) : null,
    lastUpdated: Date.now(),
    events: [],
  }
}

function normalizeLiveScore(raw: RawMatch): LiveScore {
  const score = raw.score
  return {
    matchId: String(raw.id),
    homeTeam: String(raw.homeTeam?.name ?? '?'),
    awayTeam: String(raw.awayTeam?.name ?? '?'),
    homeFlag: '',
    awayFlag: '',
    homeScore: Number(score?.fullTime?.home ?? 0),
    awayScore: Number(score?.fullTime?.away ?? 0),
    minute: (raw.minute as number) ?? null,
    status: (raw.status as LiveScore['status']) ?? 'NS',
    stage: String(raw.stage ?? 'GROUP'),
    group: String(raw.group ?? '?'),
  }
}
