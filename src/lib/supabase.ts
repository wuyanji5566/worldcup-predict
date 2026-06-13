// ============================================================
// Supabase Client — single instance, lazy init
// ============================================================
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getItem, setItem } from '@/utils/storage'

const STORAGE_KEY = 'supabase_config'

export interface SupabaseConfig {
  url: string
  anonKey: string
}

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client

  const config = getItem<SupabaseConfig | null>(STORAGE_KEY, null)
  if (!config?.url || !config?.anonKey) return null

  _client = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'wc2026_auth',
    },
  })

  return _client
}

export function initSupabase(config: SupabaseConfig): SupabaseClient {
  setItem(STORAGE_KEY, config)
  _client = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'wc2026_auth',
    },
  })
  return _client
}

export function getSupabaseOrThrow(): SupabaseClient {
  const client = getSupabase()
  if (!client) throw new Error('Supabase 未配置——请先设置 URL 和 anon key')
  return client
}
