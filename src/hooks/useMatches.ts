import { useEffect } from 'react'
import { useMatchStore } from '@/store/matchStore'

export function useMatches() {
  const matches = useMatchStore((s) => s.matches)
  const isLoading = useMatchStore((s) => s.isLoading)
  const error = useMatchStore((s) => s.error)
  const init = useMatchStore((s) => s.init)
  const refresh = useMatchStore((s) => s.refresh)

  useEffect(() => {
    init()
  }, [init])

  const matchList = Object.values(matches).sort(
    (a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`),
  )

  const liveMatches = matchList.filter((m) => m.status === 'live')
  const upcomingMatches = matchList.filter((m) => m.status === 'scheduled')
  const finishedMatches = matchList.filter((m) => m.status === 'finished')

  return { matches: matchList, liveMatches, upcomingMatches, finishedMatches, isLoading, error, refresh }
}
