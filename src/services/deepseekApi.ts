// ============================================================
// DeepSeek AI API Client
// Base: https://api.deepseek.com/v1/chat/completions
// ============================================================

import { getItem, setItem } from '@/utils/storage'

const DEEPSEEK_CONFIG_KEY = 'deepseek_api_config'

interface DeepSeekConfig {
  apiKey: string
  model: string
  baseUrl: string
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

interface ChatCompletionResponse {
  id: string
  choices: Array<{
    index: number
    message: { role: string; content: string }
    finish_reason: string
  }>
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

const DEFAULT_CONFIG: DeepSeekConfig = {
  apiKey: '',
  model: 'deepseek-chat',
  baseUrl: 'https://api.deepseek.com/v1',
}

let config: DeepSeekConfig = { ...DEFAULT_CONFIG }

export function getDeepSeekConfig(): DeepSeekConfig {
  return { ...config }
}

export function setDeepSeekApiKey(key: string): void {
  config.apiKey = key
  setItem(DEEPSEEK_CONFIG_KEY, { apiKey: key, model: config.model, baseUrl: config.baseUrl })
}

export function loadDeepSeekConfig(): void {
  const saved = getItem<DeepSeekConfig | null>(DEEPSEEK_CONFIG_KEY, null)
  if (saved?.apiKey) {
    config = { ...DEFAULT_CONFIG, ...saved }
  }
}

export async function chat(
  messages: ChatMessage[],
  options?: { temperature?: number; max_tokens?: number },
): Promise<{ ok: boolean; content: string; error: string | null }> {
  if (!config.apiKey) {
    return { ok: false, content: '', error: 'API Key 未配置' }
  }

  const body: ChatCompletionRequest = {
    model: config.model,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.max_tokens ?? 2000,
    stream: false,
  }

  try {
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      return { ok: false, content: '', error: `HTTP ${res.status}: ${err}` }
    }

    const data = (await res.json()) as ChatCompletionResponse
    const content = data.choices?.[0]?.message?.content ?? ''
    return { ok: true, content, error: null }
  } catch (err) {
    return { ok: false, content: '', error: err instanceof Error ? err.message : 'Network error' }
  }
}

// ---- AI Match Prediction ----
export interface AIMatchAnalysis {
  homeTeam: string
  awayTeam: string
  predictedHomeScore: number
  predictedAwayScore: number
  confidence: number
  reasoning: string
  keyFactors: string[]
  riskLevel: '低' | '中' | '高'
}

const PREDICTION_SYSTEM_PROMPT = `你是一位世界顶级的足球量化分析师，精通基于数据的比赛预测。
你需要分析一场世界杯比赛并给出预测结果。

请严格按照以下 JSON 格式回复，不要加任何其他文字：
{
  "homeScore": 数字,
  "awayScore": 数字,
  "confidence": 0-100的数字,
  "reasoning": "分析理由(中文，50字以内)",
  "keyFactors": ["因素1", "因素2", "因素3"],
  "riskLevel": "低" | "中" | "高"
}`

export async function predictMatchWithAI(
  homeTeam: string,
  awayTeam: string,
): Promise<{ ok: boolean; analysis: AIMatchAnalysis | null; error: string | null }> {
  const userPrompt = `请分析并预测以下世界杯比赛的比分：
主队：${homeTeam}
客队：${awayTeam}
比赛类型：2026 世界杯小组赛

请综合考虑球队实力、近期状态、历史交锋、战术风格等因素。`

  const result = await chat(
    [
      { role: 'system', content: PREDICTION_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    { temperature: 0.5, max_tokens: 1000 },
  )

  if (!result.ok) {
    return { ok: false, analysis: null, error: result.error }
  }

  try {
    // Extract JSON from response (handle markdown code blocks)
    let json = result.content.trim()
    if (json.startsWith('```')) {
      json = json.replace(/```\w*\n?/g, '').replace(/```/g, '').trim()
    }
    const parsed = JSON.parse(json)

    return {
      ok: true,
      analysis: {
        homeTeam,
        awayTeam,
        predictedHomeScore: parsed.homeScore,
        predictedAwayScore: parsed.awayScore,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
        keyFactors: parsed.keyFactors ?? [],
        riskLevel: parsed.riskLevel ?? '中',
      },
      error: null,
    }
  } catch {
    return {
      ok: false,
      analysis: null,
      error: 'AI 返回格式解析失败，请重试',
    }
  }
}

// ---- Batch prediction for multiple matches ----
export async function batchPredictMatches(
  matches: Array<{ homeTeam: string; awayTeam: string }>,
): Promise<AIMatchAnalysis[]> {
  const results: AIMatchAnalysis[] = []
  for (const match of matches) {
    const res = await predictMatchWithAI(match.homeTeam, match.awayTeam)
    if (res.ok && res.analysis) {
      results.push(res.analysis)
    }
    // Small delay between calls to avoid rate limiting
    await new Promise((r) => setTimeout(r, 500))
  }
  return results
}
