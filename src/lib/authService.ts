// ============================================================
// Supabase Auth Service — replaces mock localStorage auth
// ============================================================
import { getSupabase, getSupabaseOrThrow } from './supabase'

export interface AuthUser {
  id: string
  email: string
  username: string
  displayName: string
  avatar: string
}

export async function signUp(email: string, password: string, displayName: string) {
  const sb = getSupabaseOrThrow()
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName, username: email.split('@')[0] },
    },
  })
  if (error) return { user: null, error: error.message }
  return {
    user: data.user ? mapUser(data.user) : null,
    error: null,
  }
}

export async function signIn(email: string, password: string) {
  const sb = getSupabaseOrThrow()
  const { data, error } = await sb.auth.signInWithPassword({ email, password })
  if (error) return { user: null, error: error.message }
  return { user: data.user ? mapUser(data.user) : null, error: null }
}

export async function signOut() {
  const sb = getSupabase()
  if (sb) await sb.auth.signOut()
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const sb = getSupabase()
  if (!sb) return null
  const { data } = await sb.auth.getUser()
  return data.user ? mapUser(data.user) : null
}

export function onAuthChange(callback: (user: AuthUser | null) => void) {
  const sb = getSupabase()
  if (!sb) return { unsubscribe: () => {} }
  return sb.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? mapUser(session.user) : null)
  })
}

function mapUser(u: { id: string; email?: string; user_metadata?: Record<string, unknown> }): AuthUser {
  return {
    id: u.id,
    email: u.email ?? '',
    username: (u.user_metadata?.username as string) ?? u.email?.split('@')[0] ?? '',
    displayName: (u.user_metadata?.display_name as string) ?? (u.user_metadata?.username as string) ?? '',
    avatar: '👤',
  }
}
