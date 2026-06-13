const BASE_TIMEOUT = 10000

interface FetchResult<T> {
  ok: boolean
  data: T | null
  error: string | null
}

export async function fetchJSON<T>(url: string, timeout = BASE_TIMEOUT): Promise<FetchResult<T>> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) {
      return { ok: false, data: null, error: `HTTP ${res.status}` }
    }
    const data = (await res.json()) as T
    return { ok: true, data, error: null }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return { ok: false, data: null, error: message }
  } finally {
    clearTimeout(timer)
  }
}
