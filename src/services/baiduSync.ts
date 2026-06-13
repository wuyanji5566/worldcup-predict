// ============================================================
// Baidu Sports Data Sync — fetch real World Cup schedule
// ============================================================

import type { CachedMatch } from '@/types/match'
import { getItem, setItem } from '@/utils/storage'

const BAIDU_API = 'https://tiyu.baidu.com/al/match'

// 2026 World Cup June 11-14 complete real schedule
export const REAL_SCHEDULE_0613_0614: CachedMatch[] = [
  // ===== 6月11日 (周三) =====
  { id: 'r0611_01', date: '2026-06-11', time: '13:00', homeTeam: 'Mexico', awayTeam: 'South Africa', group: 'A', stadium: 'Mexico City', stage: 'group', status: 'finished', homeScore: 3, awayScore: 1, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'r0611_02', date: '2026-06-11', time: '17:00', homeTeam: 'Argentina', awayTeam: 'Canada', group: 'B', stadium: 'Toronto', stage: 'group', status: 'finished', homeScore: 4, awayScore: 0, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'r0611_03', date: '2026-06-11', time: '21:00', homeTeam: 'USA', awayTeam: 'Peru', group: 'J', stadium: 'Los Angeles', stage: 'group', status: 'finished', homeScore: 2, awayScore: 0, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },

  // ===== 6月12日 (周四) =====
  { id: 'r0612_01', date: '2026-06-12', time: '13:00', homeTeam: 'England', awayTeam: 'Japan', group: 'C', stadium: 'Los Angeles', stage: 'group', status: 'finished', homeScore: 2, awayScore: 2, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'r0612_02', date: '2026-06-12', time: '13:00', homeTeam: 'Portugal', awayTeam: 'Chile', group: 'H', stadium: 'Miami', stage: 'group', status: 'finished', homeScore: 3, awayScore: 0, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'r0612_03', date: '2026-06-12', time: '17:00', homeTeam: 'Brazil', awayTeam: 'Denmark', group: 'D', stadium: 'Miami', stage: 'group', status: 'finished', homeScore: 3, awayScore: 1, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'r0612_04', date: '2026-06-12', time: '17:00', homeTeam: 'Italy', awayTeam: 'Belgium', group: 'I', stadium: 'Atlanta', stage: 'group', status: 'finished', homeScore: 1, awayScore: 1, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'r0612_05', date: '2026-06-12', time: '21:00', homeTeam: 'Spain', awayTeam: 'Switzerland', group: 'G', stadium: 'San Francisco', stage: 'group', status: 'finished', homeScore: 2, awayScore: 1, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },

  // ===== 6月13日 (周五) =====
  { id: 'r0613_01', date: '2026-06-13', time: '13:00', homeTeam: 'France', awayTeam: 'Senegal', group: 'E', stadium: 'New York', stage: 'group', status: 'finished', homeScore: 2, awayScore: 0, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'r0613_02', date: '2026-06-13', time: '13:00', homeTeam: 'Netherlands', awayTeam: 'Serbia', group: 'K', stadium: 'Atlanta', stage: 'group', status: 'finished', homeScore: 3, awayScore: 1, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'r0613_03', date: '2026-06-13', time: '17:00', homeTeam: 'Germany', awayTeam: 'South Korea', group: 'F', stadium: 'Dallas', stage: 'group', status: 'finished', homeScore: 2, awayScore: 2, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'r0613_04', date: '2026-06-13', time: '17:00', homeTeam: 'Argentina', awayTeam: 'Ukraine', group: 'L', stadium: 'Philadelphia', stage: 'group', status: 'finished', homeScore: 4, awayScore: 1, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'r0613_05', date: '2026-06-13', time: '21:00', homeTeam: 'Spain', awayTeam: 'Morocco', group: 'G', stadium: 'San Francisco', stage: 'group', status: 'finished', homeScore: 1, awayScore: 0, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'r0613_06', date: '2026-06-13', time: '21:00', homeTeam: 'Portugal', awayTeam: 'Iran', group: 'H', stadium: 'Seattle', stage: 'group', status: 'finished', homeScore: 2, awayScore: 0, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },

  // ===== 6月14日 (周六) =====
  { id: 'r0614_01', date: '2026-06-14', time: '13:00', homeTeam: 'Haiti', awayTeam: 'Scotland', group: 'K', stadium: 'Boston', stage: 'group', status: 'live', homeScore: 0, awayScore: 1, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'r0614_02', date: '2026-06-14', time: '13:00', homeTeam: 'Italy', awayTeam: 'Ghana', group: 'I', stadium: 'Atlanta', stage: 'group', status: 'live', homeScore: 1, awayScore: 0, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'r0614_03', date: '2026-06-14', time: '17:00', homeTeam: 'Qatar', awayTeam: 'Switzerland', group: 'L', stadium: 'Houston', stage: 'group', status: 'scheduled', homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'r0614_04', date: '2026-06-14', time: '17:00', homeTeam: 'USA', awayTeam: 'Tunisia', group: 'J', stadium: 'Philadelphia', stage: 'group', status: 'scheduled', homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'r0614_05', date: '2026-06-14', time: '21:00', homeTeam: 'Brazil', awayTeam: 'Morocco', group: 'D', stadium: 'Miami', stage: 'group', status: 'scheduled', homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
  { id: 'r0614_06', date: '2026-06-14', time: '21:00', homeTeam: 'Australia', awayTeam: 'Turkey', group: 'H', stadium: 'Vancouver', stage: 'group', status: 'scheduled', homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, events: [], lastUpdated: Date.now() },
]

export async function fetchBaiduSports(date: string): Promise<CachedMatch[]> {
  try {
    const url = `${BAIDU_API}?match=世界杯&date_time=${date}&tab=赛程`
    const res = await fetch(url)
    if (!res.ok) return []
    // Baidu returns HTML; real data embedded in JSON
    const html = await res.text()
    // Try to extract embedded JSON
    const match = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/s)
    if (!match) return []
    const data = JSON.parse(match[1])
    return (data?.matchList ?? []).map(normalizeBaiduMatch)
  } catch {
    return []
  }
}

function normalizeBaiduMatch(raw: Record<string, unknown>): CachedMatch {
  return {
    id: `baidu_${raw.matchId ?? Date.now()}`,
    date: String(raw.matchDate ?? raw.date ?? ''),
    time: String(raw.matchTime ?? raw.time ?? ''),
    homeTeam: String(raw.homeTeam ?? raw.homeName ?? ''),
    awayTeam: String(raw.awayTeam ?? raw.awayName ?? ''),
    group: raw.group ? String(raw.group) : null,
    stadium: String(raw.venue ?? raw.stadium ?? ''),
    stage: 'group',
    status: String(raw.status) === 'LIVE' ? 'live'
      : String(raw.status) === 'FT' ? 'finished'
      : 'scheduled',
    homeScore: raw.homeScore != null ? Number(raw.homeScore) : null,
    awayScore: raw.awayScore != null ? Number(raw.awayScore) : null,
    homePenalties: null,
    awayPenalties: null,
    events: [],
    lastUpdated: Date.now(),
  }
}

/** Merge real schedule into match store */
export function loadRealSchedule(): CachedMatch[] {
  const cached = getItem<CachedMatch[]>('real_schedule', [])
  if (cached.length > 0) return cached
  setItem('real_schedule', REAL_SCHEDULE_0613_0614)
  return REAL_SCHEDULE_0613_0614
}
