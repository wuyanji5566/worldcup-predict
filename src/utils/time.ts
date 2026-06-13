import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

/** Parse openfootball date+time into UTC timestamp */
export function parseKickoffTime(date: string, time: string): number {
  const match = time.match(/^(\d{1,2}:\d{2})\s*(UTC[+-]\d+)?/)
  if (!match) return dayjs.utc(`${date}T${time}`).valueOf()

  const timePart = match[1]
  const tzPart = match[2]
  if (tzPart) {
    return dayjs.utc(`${date}T${timePart}${tzPart}`).valueOf()
  }
  return dayjs.utc(`${date}T${timePart}`).valueOf()
}

/** Format UTC timestamp to China Standard Time (UTC+8) */
export function formatCST(ts: number, fmt = 'MM月DD日 ddd HH:mm'): string {
  return dayjs.utc(ts).tz('Asia/Shanghai').locale('zh-cn').format(fmt)
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
