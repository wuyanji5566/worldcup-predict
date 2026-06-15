// Shared unlock system
// Single: ¥39.9, valid today only (auto-resets at midnight)
// Member: ¥399, valid for the month
import { useState, useCallback } from 'react'
import { getItem, setItem } from '@/utils/storage'

const CREDITS_KEY = 'predict_unlock_credits'
const DATE_KEY = 'predict_unlock_date'
const MEMBER_KEY = 'predict_unlock_member'

function today(): string {
  // Use China timezone so daily credits reset at midnight Beijing time
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }))
    .toISOString().split('T')[0]
}

function initCredits(): number {
  // Member: always unlocked
  const member = getItem<string | null>(MEMBER_KEY, null)
  if (member === 'member') return 999

  // Single: check if credits are from today
  const credits = getItem<number>(CREDITS_KEY, 0)
  const date = getItem<string | null>(DATE_KEY, null)

  if (credits > 0 && date === today()) {
    return credits
  }

  // Expired — reset
  setItem(CREDITS_KEY, 0)
  setItem(DATE_KEY, null)
  return 0
}

export function useUnlock() {
  const [credits, setCredits] = useState(initCredits)

  const consume = useCallback((): boolean => {
    const current = getItem<number>(CREDITS_KEY, 0)
    const date = getItem<string | null>(DATE_KEY, null)
    const member = getItem<string | null>(MEMBER_KEY, null)

    // Member: unlimited
    if (member === 'member') return true

    // Single: must have credits AND be today
    if (current > 0 && date === today()) {
      const updated = current - 1
      setItem(CREDITS_KEY, updated)
      setCredits(updated)
      return true
    }

    // Expired or no credits
    setItem(CREDITS_KEY, 0)
    setCredits(0)
    return false
  }, [])

  const addCredits = useCallback((amount: number, isMember?: boolean) => {
    if (isMember) {
      setItem(MEMBER_KEY, 'member')
      setCredits(999)
    } else {
      setItem(CREDITS_KEY, amount)
      setItem(DATE_KEY, today())
      // Also clear member if upgrading from single
      setCredits(amount)
    }
  }, [])

  const isMember = getItem<string | null>(MEMBER_KEY, null) === 'member'
  const unlockDate = getItem<string | null>(DATE_KEY, null)
  const isUnlocked = isMember || (credits > 0 && unlockDate === today())

  return { credits, isUnlocked, isMember, consume, addCredits, unlockDate }
}
