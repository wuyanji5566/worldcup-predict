// ============================================================
// Real Sports API Service — API-Football v3 Integration
// Docs: https://www.api-football.com/documentation-v3
// ============================================================

import type { CachedMatch } from '@/types/match'
import { getItem, setItem } from '@/utils/storage'

// ---- Config from env ----
const API_KEY = import.meta.env.VITE_SPORTS_API_KEY ?? ''
const API_URL = import.meta.env.VITE_SPORTS_API_URL ?? 'https://v3.football.api-sports.io'

// World Cup 2026 league ID (API-Football)
const WORLD_CUP_LEAGUE_ID = 1
const SEASON = 2026

// ---- Types ----
interface ApiFixture {
  fixture: {
    id: number
    date: string
    timestamp: number
    status: { long: string; short: string; elapsed: number | null }
  }
  league: { id: number; name: string; round: string }
  teams: {
    home: { id: number; name: string; logo: string }
    away: { id: number; name: string; logo: string }
  }
  goals: { home: number | null; away: number | null }
  score: {
    halftime: { home: number | null; away: number | null }
    fulltime: { home: number | null; away: number | null }
    extratime: { home: number | null; away: number | null }
    penalty: { home: number | null; away: number | null }
  }
}

interface ApiResponse {
  get: string
  parameters: Record<string, unknown>
  errors: unknown[]
  results: number
  response: ApiFixture[]
}

// ---- Cache ----
const CACHE_KEY = 'real_sports_api_cache'
const CACHE_TTL = 30000 // 30 seconds

interface CacheEntry {
  data: CachedMatch[]
  timestamp: number
}

function getCached(): CachedMatch[] | null {
  const entry = getItem<CacheEntry | null>(CACHE_KEY, null)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) return null
  return entry.data
}

function setCached(data: CachedMatch[]): void {
  setItem(CACHE_KEY, { data, timestamp: Date.now() })
}

// ---- Fetch wrapper ----
async function apiGet<T>(endpoint: string): Promise<{ ok: boolean; data: T | null; error: string | null }> {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    return { ok: false, data: null, error: 'API Key 未配置，请在 .env.local 设置 VITE_SPORTS_API_KEY' }
  }

  const url = `${API_URL}${endpoint}`

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 12000)

    const res = await fetch(url, {
      headers: {
        'x-apisports-key': API_KEY,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timer)

    if (res.status === 429) {
      return { ok: false, data: null, error: 'API 请求频率超限，请稍后重试' }
    }

    if (!res.ok) {
      return { ok: false, data: null, error: `API 返回 HTTP ${res.status}` }
    }

    const json = await res.json() as T
    return { ok: true, data: json, error: null }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, data: null, error: 'API 请求超时' }
    }
    return { ok: false, data: null, error: err instanceof Error ? err.message : '网络错误' }
  }
}

// ---- Normalizer ----
function normalizeFixture(f: ApiFixture): CachedMatch {
  const date = f.fixture.date.split('T')[0] ?? ''
  const time = f.fixture.date.split('T')[1]?.slice(0, 5) ?? ''

  const statusMap: Record<string, CachedMatch['status']> = {
    'NS': 'scheduled', 'TBD': 'scheduled', 'PST': 'postponed',
    '1H': 'live', 'HT': 'live', '2H': 'live', 'ET': 'live',
    'BT': 'live', 'P': 'live', 'FT': 'finished', 'AET': 'finished',
    'PEN': 'finished', 'SUSP': 'postponed', 'INT': 'live',
    'CANC': 'postponed', 'ABD': 'postponed', 'WO': 'finished',
  }

  const shortStatus = f.fixture.status?.short ?? 'NS'
  const status = statusMap[shortStatus] ?? 'scheduled'

  return {
    id: `api_${f.fixture.id}`,
    date,
    time,
    homeTeam: f.teams.home.name,
    awayTeam: f.teams.away.name,
    group: f.league.round?.replace('Group ', '') ?? null,
    stadium: '',
    stage: 'group',
    status,
    homeScore: f.goals.home,
    awayScore: f.goals.away,
    homePenalties: f.score.penalty.home,
    awayPenalties: f.score.penalty.away,
    events: [],
    lastUpdated: Date.now(),
  }
}

// ---- Public API ----

/** Fetch today's World Cup matches */
export async function fetchTodayMatches(): Promise<CachedMatch[]> {
  const today = new Date().toISOString().split('T')[0]
  return fetchMatchesByDate(today)
}

/** Fetch matches for a specific date */
export async function fetchMatchesByDate(date: string): Promise<CachedMatch[]> {
  // Check cache first
  const cached = getCached()
  if (cached?.some((m) => m.date === date)) return cached

  const result = await apiGet<ApiResponse>(
    `/fixtures?date=${date}&league=${WORLD_CUP_LEAGUE_ID}&season=${SEASON}&timezone=Asia/Shanghai`,
  )

  if (!result.ok || !result.data) {
    console.warn('[realSportsApi] fetch failed:', result.error, '- using cached/local data')
    return cached ?? []
  }

  const matches = result.data.response.map(normalizeFixture)
  setCached(matches)
  return matches
}

/** Fetch live matches in progress */
export async function fetchLiveMatches(): Promise<CachedMatch[]> {
  const result = await apiGet<ApiResponse>(
    `/fixtures?live=all&league=${WORLD_CUP_LEAGUE_ID}&season=${SEASON}&timezone=Asia/Shanghai`,
  )

  if (!result.ok || !result.data) return []

  const matches = result.data.response.map(normalizeFixture)
  return matches
}

/** Fetch all World Cup fixtures for the tournament */
export async function fetchAllFixtures(): Promise<CachedMatch[]> {
  const result = await apiGet<ApiResponse>(
    `/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${SEASON}&timezone=Asia/Shanghai`,
  )

  if (!result.ok || !result.data) return []

  const matches = result.data.response.map(normalizeFixture)
  if (matches.length > 0) setCached(matches)
  return matches
}

/** Fetch matches for a date range */
export async function fetchMatchesByDateRange(from: string, to: string): Promise<CachedMatch[]> {
  const cached = getCached()
  if (cached) return cached

  const result = await apiGet<ApiResponse>(
    `/fixtures?from=${from}&to=${to}&league=${WORLD_CUP_LEAGUE_ID}&season=${SEASON}&timezone=Asia/Shanghai`,
  )

  if (!result.ok || !result.data) return cached ?? []

  const matches = result.data.response.map(normalizeFixture)
  setCached(matches)
  return matches
}
