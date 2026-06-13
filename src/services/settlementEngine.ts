// ============================================================
// Settlement Engine — Core scoring logic + batch settlement
// ============================================================

import type {
  SettlementType,
  SettlementResult,
  MatchResult,
  DevSimulationSummary,
} from './types'
import { usePredictionStore } from '@/store/predictionStore'
import { useAuthStore } from '@/store/authStore'
import { useLeaderboardStore } from '@/store/leaderboardStore'
import { useUIStore } from '@/store/uiStore'

// ---- JUNE 14 REAL MATCH RESULTS (hardcoded for dev simulation) ----
export const JUNE14_RESULTS: MatchResult[] = [
  {
    matchId: 'j14-m1',
    homeTeam: '海地',
    awayTeam: '苏格兰',
    homeScore: 0,
    awayScore: 3,
    stage: '小组赛',
    group: 'K 组',
  },
  {
    matchId: 'j14-m2',
    homeTeam: '卡塔尔',
    awayTeam: '瑞士',
    homeScore: 0,
    awayScore: 2,
    stage: '小组赛',
    group: 'L 组',
  },
  {
    matchId: 'j14-m3',
    homeTeam: '巴西',
    awayTeam: '摩洛哥',
    homeScore: 1,
    awayScore: 1,
    stage: '小组赛',
    group: 'D 组',
  },
  {
    matchId: 'j14-m4',
    homeTeam: '澳大利亚',
    awayTeam: '土耳其',
    homeScore: 1,
    awayScore: 2,
    stage: '小组赛',
    group: 'H 组',
  },
]

// ---- CORE SCORING FUNCTION ----
/**
 * Calculate prediction points based on tiered accuracy.
 *
 * Tier 1 — Exact Score Match (10 pts):
 *   predicted === actual (e.g. predict 1-0, actual 1-0)
 *
 * Tier 2 — Goal Difference + Outcome Match (5 pts):
 *   Same outcome AND same goal difference, but not exact (e.g. predict 2-0, actual 3-1)
 *
 * Tier 3 — Outcome Only Match (3 pts):
 *   Correct winner/draw, but different goal difference (e.g. predict 1-0, actual 2-1)
 *
 * Tier 4 — Wrong (0 pts):
 *   Everything else
 */
export function calculatePredictionPoints(
  userPredictHome: number,
  userPredictAway: number,
  actualHome: number,
  actualAway: number,
): { points: number; type: SettlementType } {
  const predDiff = userPredictHome - userPredictAway
  const actualDiff = actualHome - actualAway

  // Helper: determine outcome direction
  const predOutcome = predDiff > 0 ? 'home' : predDiff < 0 ? 'away' : 'draw'
  const actualOutcome = actualDiff > 0 ? 'home' : actualDiff < 0 ? 'away' : 'draw'

  // Tier 1: Exact score match
  if (userPredictHome === actualHome && userPredictAway === actualAway) {
    return { points: 10, type: 'exact' }
  }

  // Tier 2: Same outcome AND same goal difference (but not exact score)
  if (predOutcome === actualOutcome && predDiff === actualDiff) {
    return { points: 5, type: 'goal_diff' }
  }

  // Tier 3: Same outcome only (different goal difference)
  if (predOutcome === actualOutcome) {
    return { points: 3, type: 'outcome' }
  }

  // Tier 4: Wrong
  return { points: 0, type: 'wrong' }
}

// ---- BATCH SETTLEMENT ENGINE ----
/**
 * Run full settlement for all users against real match results.
 * Called by the "Simulate Dev Run" button on Profile page.
 */
export function runBatchSettlement(results: MatchResult[]): DevSimulationSummary {
  const predictionState = usePredictionStore.getState()
  const allPredictions = predictionState.predictions

  const summary: DevSimulationSummary = {
    totalMatches: results.length,
    totalPredictions: 0,
    settled: 0,
    exactMatches: 0,
    goalDiffMatches: 0,
    outcomeMatches: 0,
    wrongPredictions: 0,
    totalPointsAwarded: 0,
    leaderboardUpdated: false,
    timestamp: Date.now(),
  }

  // Build lookup: result by matchId
  const resultMap = new Map<string, MatchResult>()
  for (const r of results) {
    resultMap.set(r.matchId, r)
  }

  // Collect settlement results
  const settlements: SettlementResult[] = []

  for (const [, pred] of Object.entries(allPredictions)) {
    const result = resultMap.get(pred.matchId)
    if (!result) continue // prediction for match not in this batch

    summary.totalPredictions++

    const { points, type } = calculatePredictionPoints(
      pred.predictedHomeScore,
      pred.predictedAwayScore,
      result.homeScore,
      result.awayScore,
    )

    settlements.push({
      predictionId: `${pred.userId}_${pred.matchId}`,
      matchId: pred.matchId,
      userId: pred.userId,
      predicted: { home: pred.predictedHomeScore, away: pred.predictedAwayScore },
      actual: { home: result.homeScore, away: result.awayScore },
      settlementType: type,
      points,
      settledAt: Date.now(),
    })

    summary.totalPointsAwarded += points

    switch (type) {
      case 'exact': summary.exactMatches++; break
      case 'goal_diff': summary.goalDiffMatches++; break
      case 'outcome': summary.outcomeMatches++; break
      case 'wrong': summary.wrongPredictions++; break
    }
  }

  // Update all predictions with settlement results
  const updatedPredictions = { ...allPredictions }
  for (const s of settlements) {
    const key = `${s.userId}_${s.matchId}`
    if (updatedPredictions[key]) {
      updatedPredictions[key] = {
        ...updatedPredictions[key],
        points: s.points,
        basePoints: s.points,
        stageMultiplier: 1,
      }
    }
  }

  // Persist to store
  usePredictionStore.setState({ predictions: updatedPredictions })
  summary.settled = settlements.length

  // Recompute leaderboard
  useLeaderboardStore.getState().recompute()
  summary.leaderboardUpdated = true

  // Toast summary
  const toast = useUIStore.getState().addToast
  toast(
    `结算完成: ${summary.settled} 条预测已处理 | ` +
    `精确 ${summary.exactMatches} | 净胜 ${summary.goalDiffMatches} | ` +
    `胜负 ${summary.outcomeMatches} | 错误 ${summary.wrongPredictions}`,
    'success',
  )

  return summary
}

// ---- MOCK PREDICTION GENERATOR (for dev/demo) ----
/** Generate mock predictions for all users against June 14 matches */
export function seedMockPredictions(): void {
  const users = useAuthStore.getState().users
  const store = usePredictionStore.getState()

  const matchIds = JUNE14_RESULTS.map((r) => r.matchId)

  for (const user of users) {
    for (const matchId of matchIds) {
      // Skip if already predicted
      const existing = store.getPredictionForMatch(user.id, matchId)
      if (existing) continue

      // Generate random-ish plausible predictions
      const homeScore = Math.floor(Math.random() * 4)
      const awayScore = Math.floor(Math.random() * 4)

      store.submitPrediction(matchId, homeScore, awayScore, false)
    }
  }
}
