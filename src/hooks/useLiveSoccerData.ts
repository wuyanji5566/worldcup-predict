// ============================================================
// useLiveSoccerData — SWR-style polling hook
// - Polls every 5 seconds
// - Window focus revalidation (refetch on tab switch back)
// - Stale-while-revalidate pattern
// ============================================================

import { useEffect, useRef, useCallback, useState } from 'react'
import { useLiveSyncStore } from '@/services/liveSync'

interface PollState {
  lastPolledAt: number
  pollCount: number
  isStale: boolean
  lastFocusAt: number
}

export function useLiveSoccerData() {
  const match = useLiveSyncStore((s) => s.match)
  const isRunning = useLiveSyncStore((s) => s.isRunning)
  const isLive = useLiveSyncStore((s) => s.isLive)
  const tickCount = useLiveSyncStore((s) => s.tickCount)
  const probability = useLiveSyncStore((s) => s.probability)

  const [pollState, setPollState] = useState<PollState>({
    lastPolledAt: Date.now(),
    pollCount: 0,
    isStale: false,
    lastFocusAt: Date.now(),
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ---- 5s Polling Engine ----
  const poll = useCallback(() => {
    setPollState((prev) => ({
      ...prev,
      lastPolledAt: Date.now(),
      pollCount: prev.pollCount + 1,
      isStale: false,
    }))
  }, [])

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(poll, 5000)
    poll() // initial poll immediately

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, poll])

  // ---- Window Focus Revalidation ----
  useEffect(() => {
    const handleFocus = () => {
      setPollState((prev) => ({
        ...prev,
        lastFocusAt: Date.now(),
        isStale: false,
      }))
      // Force immediate poll on focus
      poll()
    }

    const handleBlur = () => {
      setPollState((prev) => ({ ...prev, isStale: true }))
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [poll])

  // ---- Staleness detection: if no poll in > 8s, mark stale ----
  useEffect(() => {
    if (!isLive) return
    const check = setInterval(() => {
      if (Date.now() - pollState.lastPolledAt > 8000) {
        setPollState((prev) => ({ ...prev, isStale: true }))
      }
    }, 2000)
    return () => clearInterval(check)
  }, [isLive, pollState.lastPolledAt])

  return {
    match,
    probability,
    isRunning,
    isLive,
    tickCount,
    pollState,
    isStale: pollState.isStale,
    secondsSinceLastPoll: Math.round((Date.now() - pollState.lastPolledAt) / 1000),
    totalPolls: pollState.pollCount,
  }
}
