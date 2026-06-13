import { useState, useEffect } from 'react'

interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
  totalSeconds: number
}

export function useCountdown(targetTs: number): Countdown {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const diff = targetTs - now
  const isExpired = diff <= 0
  const absDiff = Math.max(0, diff)

  const totalSeconds = Math.floor(absDiff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, isExpired, totalSeconds }
}
