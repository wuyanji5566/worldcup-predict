import { useEffect } from 'react'
import { useLeaderboardStore } from '@/store/leaderboardStore'

export function useLeaderboard() {
  const entries = useLeaderboardStore((s) => s.entries)
  const recompute = useLeaderboardStore((s) => s.recompute)

  useEffect(() => {
    recompute()
  }, [recompute])

  return { entries, recompute }
}
