// Shared unlock system — pay once, get 5 unlocks
import { useState, useCallback } from 'react'
import { getItem, setItem } from '@/utils/storage'

const CREDITS_KEY = 'predict_unlock_credits'

export function useUnlock() {
  const [credits, setCredits] = useState(() => getItem<number>(CREDITS_KEY, 0))

  const consume = useCallback((): boolean => {
    const current = getItem<number>(CREDITS_KEY, 0)
    if (current <= 0) return false // locked — need to pay
    const updated = current - 1
    setItem(CREDITS_KEY, updated)
    setCredits(updated)
    return true // unlocked
  }, [])

  const addCredits = useCallback((amount: number) => {
    const current = getItem<number>(CREDITS_KEY, 0)
    const updated = current + amount
    setItem(CREDITS_KEY, updated)
    setCredits(updated)
  }, [])

  const isUnlocked = credits > 0

  return { credits, isUnlocked, consume, addCredits }
}
