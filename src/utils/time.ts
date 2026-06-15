import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { STADIUM_TIMEZONES, STADIUMS, DEFAULT_MATCH_TIMEZONE } from './constants'

dayjs.extend(utc)
dayjs.extend(timezone)

// Reverse mapping: Chinese stadium name → English key
const _stadiumKeyByChinese: Record<string, string> = {}
for (const [key, zh] of Object.entries(STADIUMS)) {
  _stadiumKeyByChinese[zh] = key
}

// Fuzzy venue→timezone mapping: city/detail keywords → IANA timezone
const _cityTimezoneHints: Array<[string[], string]> = [
  [['mexico city', 'azteca', 'mexico'], 'America/Mexico_City'],
  [['toronto', 'bmo'], 'America/Toronto'],
  [['los angeles', 'sofi', 'inglewood'], 'America/Los_Angeles'],
  [['miami', 'hard rock', 'miami gardens'], 'America/New_York'],
  [['new york', 'metlife', 'east rutherford', 'ny/nj'], 'America/New_York'],
  [['dallas', 'at&t', 'arlington'], 'America/Chicago'],
  [['san francisco', 'levi', 'santa clara', 'bay area'], 'America/Los_Angeles'],
  [['seattle', 'lumen', 'centurylink'], 'America/Los_Angeles'],
  [['atlanta', 'mercedes-benz'], 'America/New_York'],
  [['philadelphia', 'lincoln financial'], 'America/New_York'],
  [['boston', 'gillette', 'foxborough', 'foxboro'], 'America/New_York'],
  [['houston', 'nrg'], 'America/Chicago'],
  [['kansas city', 'arrowhead'], 'America/Chicago'],
  [['vancouver', 'bc place'], 'America/Vancouver'],
  [['monterrey', 'bbva'], 'America/Monterrey'],
  [['guadalajara', 'akron', 'estadio akron'], 'America/Mexico_City'],
]

/** Look up the IANA timezone for a stadium name (English key, Chinese display name, or ESPN venue name) */
export function stadiumTimezone(stadium: string): string {
  if (!stadium) return DEFAULT_MATCH_TIMEZONE
  const lower = stadium.toLowerCase()

  // Direct match on English key
  if (STADIUM_TIMEZONES[stadium]) return STADIUM_TIMEZONES[stadium]

  // Try reverse lookup from Chinese display name
  const key = _stadiumKeyByChinese[stadium]
  if (key && STADIUM_TIMEZONES[key]) return STADIUM_TIMEZONES[key]

  // Fuzzy match: check if the venue name contains any known city/stadium keywords
  for (const [keywords, tz] of _cityTimezoneHints) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return tz
    }
  }

  return DEFAULT_MATCH_TIMEZONE
}

/**
 * Parse openfootball date+time into a UTC timestamp.
 * `date` is YYYY-MM-DD, `time` is venue-local (e.g. "13:00" or "13:00 UTC-4").
 * `venueTimezone` is the IANA timezone for the venue (e.g. "America/New_York").
 */
export function parseKickoffTime(date: string, time: string, venueTimezone?: string): number {
  const match = time.match(/^(\d{1,2}:\d{2})\s*(UTC[+-]\d+)?/)
  if (!match) {
    // Fallback: treat as venue-local, or UTC if no timezone provided
    const tz = venueTimezone ?? 'UTC'
    return dayjs.tz(`${date}T${time}`, tz).valueOf()
  }

  const timePart = match[1]
  const tzPart = match[2]

  if (tzPart) {
    // Time string includes explicit UTC offset — parse as UTC then apply offset
    return dayjs.utc(`${date}T${timePart}${tzPart}`).valueOf()
  }

  // No explicit offset in time string — interpret as venue-local time
  const tz = venueTimezone ?? DEFAULT_MATCH_TIMEZONE
  return dayjs.tz(`${date}T${timePart}`, tz).valueOf()
}

/** Format a UTC timestamp to China Standard Time (UTC+8) */
export function formatCST(ts: number, fmt = 'MM月DD日 ddd HH:mm'): string {
  return dayjs.utc(ts).tz('Asia/Shanghai').locale('zh-cn').format(fmt)
}

/**
 * Format a match's date+time to China Standard Time display string.
 * Uses the venue's timezone to correctly convert to CST.
 */
export function formatMatchTimeCST(
  date: string,
  time: string,
  stadium?: string,
  fmt = 'MM月DD日 HH:mm',
): string {
  const tz = stadium ? stadiumTimezone(stadium) : DEFAULT_MATCH_TIMEZONE
  const ts = parseKickoffTime(date, time, tz)
  return formatCST(ts, fmt)
}

/**
 * Format just the time portion of a match in CST.
 * e.g. "13:00 ET" → "01:00" (next day in China)
 */
export function formatMatchTimeOnlyCST(date: string, time: string, stadium?: string): string {
  return formatMatchTimeCST(date, time, stadium, 'HH:mm')
}

/**
 * Format a match date in CST with day-of-week.
 * e.g. "2026-06-14" → "6月14日 周日"
 */
export function formatMatchDateCST(date: string, stadium?: string): string {
  const tz = stadium ? stadiumTimezone(stadium) : DEFAULT_MATCH_TIMEZONE
  // Use noon UTC of that date to avoid day-boundary issues
  const ts = dayjs.tz(`${date}T12:00`, tz).valueOf()
  return formatCST(ts, 'M月D日 dddd')
}

export function formatRelative(ts: number): string {
  const now = Date.now()
  const diff = ts - now
  const absDiff = Math.abs(diff)

  const mins = Math.floor(absDiff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  if (diff < 0) {
    if (mins < 1) return '刚刚'
    if (mins < 60) return `${mins} 分钟前`
    if (hours < 24) return `${hours} 小时前`
    return `${days} 天前`
  } else {
    if (mins < 1) return '即将开始'
    if (mins < 60) return `${mins} 分钟后`
    if (hours < 24) return `${hours} 小时后`
    return `${days} 天后`
  }
}

export function isBeforeKickoff(kickoffTs: number): boolean {
  return Date.now() < kickoffTs
}

export function isAfterMatch(kickoffTs: number): boolean {
  // Assume 120 minutes for a match
  return Date.now() > kickoffTs + 120 * 60 * 1000
}
