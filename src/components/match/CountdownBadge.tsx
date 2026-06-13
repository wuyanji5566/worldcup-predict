import { useCountdown } from '@/hooks/useCountdown'
import { parseKickoffTime } from '@/utils/time'

interface CountdownBadgeProps {
  date: string
  time: string
}

export function CountdownBadge({ date, time }: CountdownBadgeProps) {
  const ts = parseKickoffTime(date, time)
  const { days, hours, minutes, seconds, isExpired } = useCountdown(ts)

  if (isExpired) {
    return (
      <span className="text-xs text-text-muted">已开赛</span>
    )
  }

  if (days > 0) {
    return (
      <span className="text-xs text-accent font-medium">
        距开赛 {days}天 {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
      </span>
    )
  }

  return (
    <span className="text-xs text-accent font-medium">
      距开赛 {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </span>
  )
}
