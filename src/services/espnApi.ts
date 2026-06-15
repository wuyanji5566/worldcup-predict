// ============================================================
// ESPN Public API Client — Free, no API key required
// Endpoint: https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard
// Returns real 2026 World Cup data: live scores, fixtures, results
// ============================================================

import type { CachedMatch, MatchStatus } from '@/types/match'
import { getItem, setItem } from '@/utils/storage'
import { currentDateCST, stadiumTimezone } from '@/utils/time'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world'
const CACHE_KEY = 'espn_match_cache'
const CACHE_TTL = 60000 // 1 minute

// ---- ESPN API Response Types ----
interface EspnEvent {
  id: string
  uid: string
  date: string
  name: string
  shortName: string
  competitions: Array<{
    id: string
    date: string
    startDate: string
    attendance?: number
    status: {
      clock: number
      displayClock: string
      period: number
      type: {
        id: string
        name: string
        state: string
        completed: boolean
        description: string
        detail: string
        shortDetail: string
      }
    }
    venue?: {
      id?: string
      fullName?: string
      address?: { city?: string; country?: string }
    }
    altGameNote?: string
    competitors: Array<{
      id: string
      uid: string
      homeAway: 'home' | 'away'
      winner: boolean
      score: string
      team: {
        id: string
        abbreviation: string
        displayName: string
        shortDisplayName: string
        name: string
        location: string
        logo: string
      }
    }>
    notes?: Array<{ headline?: string }>
    broadcasts?: Array<{ market: string; names: string[] }>
  }>
}

interface EspnScoreboard {
  leagues?: Array<{
    id: string
    name: string
    slug: string
    season: {
      year: number
      startDate: string
      endDate: string
      displayName: string
    }
    calendar?: Array<{
      label: string
      entries: Array<{
        label: string
        detail: string
        startDate: string
        endDate: string
      }>
    }>
  }>
  day: { date: string }
  events: EspnEvent[]
}

// ---- Cache ----
interface CacheEntry {
  data: CachedMatch[]
  timestamp: number
  date: string
}

function getCache(date: string): CachedMatch[] | null {
  const entry = getItem<CacheEntry | null>(`${CACHE_KEY}_${date}`, null)
  if (!entry || entry.date !== date) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) return null
  return entry.data
}

function setCache(date: string, data: CachedMatch[]): void {
  setItem(`${CACHE_KEY}_${date}`, { data, timestamp: Date.now(), date })
}

// ---- Status Mapping ----
function mapStatus(state: string): MatchStatus {
  if (state === 'post') return 'finished'
  if (state === 'in') return 'live'
  return 'scheduled'
}

// ---- Normalizer ----
function normalizeEvent(event: EspnEvent): CachedMatch {
  const comp = event.competitions[0]
  const home = comp.competitors.find((c) => c.homeAway === 'home')
  const away = comp.competitors.find((c) => c.homeAway === 'away')

  // --- Extract venue name and timezone ---
  const venueName = comp.venue?.fullName ?? ''
  const tz = stadiumTimezone(venueName) // will fall back to DEFAULT_MATCH_TIMEZONE

  // --- Convert ESPN UTC date to venue-local date+time ---
  // ESPN returns ISO dates like "2026-06-14T17:00Z" (UTC)
  const utcTs = dayjs.utc(event.date).valueOf()
  let localDate: string
  let localTime: string
  if (utcTs > 0) {
    const local = dayjs.utc(utcTs).tz(tz)
    localDate = local.format('YYYY-MM-DD')
    localTime = local.format('HH:mm')
  } else {
    localDate = event.date.split('T')[0] ?? ''
    localTime = event.date.split('T')[1]?.slice(0, 5) ?? ''
  }

  if (!home || !away) {
    return {
      id: `espn_${event.id}`,
      date: localDate,
      time: localTime,
      homeTeam: 'Unknown',
      awayTeam: 'Unknown',
      group: null,
      stadium: venueName,
      stage: 'group',
      status: 'scheduled',
      homeScore: null,
      awayScore: null,
      homePenalties: null,
      awayPenalties: null,
      events: [],
      lastUpdated: Date.now(),
    }
  }

  const statusType = comp.status?.type
  const status = mapStatus(statusType?.state ?? 'pre')

  // Extract group from altGameNote or notes
  const gameNote = comp.altGameNote ?? comp.notes?.[0]?.headline ?? ''
  const groupMatch = gameNote.match(/Group\s+([A-L])/)

  return {
    id: `espn_${event.id}`,
    date: localDate,
    time: localTime,
    homeTeam: home.team.name,
    awayTeam: away.team.name,
    group: groupMatch ? groupMatch[1] : null,
    stadium: venueName,
    stage: 'group',
    status,
    homeScore: status === 'scheduled' ? null : parseInt(home.score, 10),
    awayScore: status === 'scheduled' ? null : parseInt(away.score, 10),
    homePenalties: null,
    awayPenalties: null,
    events: [],
    lastUpdated: Date.now(),
  }
}

// ---- Public API ----

/**
 * Fetch today's World Cup matches from ESPN
 */
export async function fetchEspnScoreboard(date?: string): Promise<CachedMatch[]> {
  const targetDate = date ?? currentDateCST()

  // Historical/future dates may use the short cache. Today's scores always refresh.
  if (targetDate !== currentDateCST()) {
    const cached = getCache(targetDate)
    if (cached) return cached
  }

  const url = `${ESPN_BASE}/scoreboard?dates=${targetDate.replace(/-/g, '')}`

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) {
      console.warn('[espnApi] HTTP', res.status)
      return getCache(targetDate) ?? []
    }

    const data: EspnScoreboard = await res.json()
    const matches = (data.events ?? []).map(normalizeEvent)

    if (matches.length > 0) {
      setCache(targetDate, matches)
    }

    return matches
  } catch (err) {
    console.warn('[espnApi] fetch error:', err instanceof Error ? err.message : err)
    return getCache(targetDate) ?? []
  }
}

/**
 * Fetch all available World Cup fixtures — today first, then nearby dates in parallel
 */
export async function fetchEspnAllFixtures(): Promise<CachedMatch[]> {
  const allMatches: CachedMatch[] = []
  const seen = new Set<string>()

  // Fetch the China calendar date first, then nearby dates in parallel.
  const todayMatches = await fetchEspnScoreboard(currentDateCST())
  for (const m of todayMatches) {
    seen.add(m.id)
    allMatches.push(m)
  }

  // 2. Fetch nearby dates in PARALLEL (background)
  const dateStrs: string[] = []
  for (let offset = -2; offset <= 3; offset++) {
    if (offset === 0) continue // already fetched today
    dateStrs.push(currentDateCST(offset))
  }

  const results = await Promise.allSettled(
    dateStrs.map((dateStr) => fetchEspnScoreboard(dateStr)),
  )

  for (const r of results) {
    if (r.status === 'fulfilled') {
      for (const m of r.value) {
        if (!seen.has(m.id)) {
          seen.add(m.id)
          allMatches.push(m)
        }
      }
    }
  }

  return allMatches
}

/**
 * Extract group standings info from ESPN response metadata
 */
export function extractTournamentInfo(data: EspnScoreboard): {
  season: string
  groups: string[]
} {
  const league = data.leagues?.[0]
  return {
    season: league?.season?.displayName ?? '2026 FIFA World Cup',
    groups: [],
  }
}
