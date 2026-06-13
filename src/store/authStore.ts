import { create } from 'zustand'
import type { User } from '@/types/user'
import { getItem, setItem } from '@/utils/storage'
import { DEMO_USERS } from '@/utils/constants'
import { nanoid } from 'nanoid'
import { getSupabase } from '@/lib/supabase'

interface AuthStore {
  users: User[]
  currentUser: Omit<User, 'password'> | null
  isLoggedIn: boolean
  isAuthModalOpen: boolean
  authModalMode: 'login' | 'register'
  authProvider: 'local' | 'supabase'
  openAuthModal: (mode: 'login' | 'register') => void
  closeAuthModal: () => void
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, displayName: string) => Promise<boolean>
  logout: () => Promise<void>
  setAuthProvider: (p: 'local' | 'supabase') => void
  initAuth: () => Promise<void>
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(password))
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function seedDemoUsers(): User[] {
  return DEMO_USERS.map((demo, i) => ({
    id: `demo_${i + 1}`,
    username: demo.username,
    password: '',
    displayName: demo.displayName,
    avatar: demo.avatar,
    createdAt: Date.now() - 86400000 * (i + 1),
  }))
}

async function initLocalAuth(set: (s: Partial<AuthStore>) => void) {
  const existing = getItem<User[]>('users', [])
  if (existing.length === 0) {
    const demos = seedDemoUsers()
    await Promise.all(demos.map(async (d) => {
      d.password = await hashPassword('demo1234')
    }))
    setItem('users', demos)
    set({ users: demos })
  } else {
    set({ users: existing })
  }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  users: [],
  currentUser: null,
  isLoggedIn: false,
  isAuthModalOpen: false,
  authModalMode: 'login',
  authProvider: 'local',

  openAuthModal: (mode) => set({ isAuthModalOpen: true, authModalMode: mode }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setAuthProvider: (p) => set({ authProvider: p }),

  initAuth: async () => {
    const sb = getSupabase()
    if (sb) {
      // Try restore Supabase session
      const { data } = await sb.auth.getSession()
      if (data.session?.user) {
        const u = data.session.user
        set({
          currentUser: {
            id: u.id,
            username: u.email ?? '',
            displayName: (u.user_metadata?.display_name as string) ?? u.email ?? '',
            avatar: '👤',
            createdAt: Date.now(),
          },
          isLoggedIn: true,
          authProvider: 'supabase',
        })
        // Also init local users for demo
        await initLocalAuth(set)
        return
      }
    }
    // Fallback to localStorage
    set({ authProvider: 'local' })
    await initLocalAuth(set)
  },

  login: async (email, password) => {
    const sb = getSupabase()
    // Try Supabase first
    if (sb) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password })
      if (!error && data.user) {
        const u = data.user
        set({
          currentUser: {
            id: u.id, username: u.email ?? '',
            displayName: (u.user_metadata?.display_name as string) ?? email,
            avatar: '👤', createdAt: Date.now(),
          },
          isLoggedIn: true,
          isAuthModalOpen: false,
          authProvider: 'supabase',
        })
        return true
      }
    }

    // Fallback to local auth
    const { users } = get()
    const user = users.find((u) => u.username === email)
    if (!user) return false
    const hashed = await hashPassword(password)
    if (user.password !== hashed) return false
    const { password: _, ...safeUser } = user
    set({ currentUser: safeUser, isLoggedIn: true, isAuthModalOpen: false, authProvider: 'local' })
    return true
  },

  register: async (email, password, displayName) => {
    const sb = getSupabase()
    if (sb) {
      const { data, error } = await sb.auth.signUp({
        email, password,
        options: { data: { display_name: displayName } },
      })
      if (!error && data.user) {
        const u = data.user
        set({
          currentUser: {
            id: u.id, username: email,
            displayName, avatar: '👤', createdAt: Date.now(),
          },
          isLoggedIn: true,
          isAuthModalOpen: false,
          authProvider: 'supabase',
        })
        return true
      }
    }

    // Fallback to local
    const { users } = get()
    if (users.some((u) => u.username === email)) return false
    const hashed = await hashPassword(password)
    const newUser: User = { id: nanoid(), username: email, password: hashed, displayName, avatar: '👤', createdAt: Date.now() }
    const allUsers = [...users, newUser]
    set({ users: allUsers })
    setItem('users', allUsers)
    const { password: _, ...safeUser } = newUser
    set({ currentUser: safeUser, isLoggedIn: true, isAuthModalOpen: false, authProvider: 'local' })
    return true
  },

  logout: async () => {
    const sb = getSupabase()
    if (sb) await sb.auth.signOut()
    set({ currentUser: null, isLoggedIn: false })
  },
}))

// Backward compat
export const initAuth = () => useAuthStore.getState().initAuth()
