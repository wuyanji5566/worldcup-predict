// ============================================================
// Dynamic Probability Recalculation Engine
// Adjusts McKinsey predictive probabilities based on live events
// ============================================================

import type { ProbabilityState, ProbabilitySnapshot } from './liveTypes'

/** Goal scored → boost that team's win probability, slash opponent's */
const GOAL_BOOST = 12      // percentage points per goal
const GOAL_DRAW_REDUCE = 6 // draw chance reduction per goal

/** Red card → slash that team's win probability */
const RED_CARD_PENALTY = 25  // percentage points
const RED_CARD_DRAW_BOOST = 3

/** Time decay: as minutes go by with a lead, increase leading team's probability */
const TIME_DECAY_PER_10MIN = 2  // every 10 min with lead = +2% for leader

/** Expected goals model — Poisson inspired */
function expectedGoalsFromScore(goals: number, minutes: number): number {
  const remaining = 90 - minutes
  const rate = goals / Math.max(minutes, 1)
  return goals + (rate * remaining)
}

/** Constrain to 0-100 and normalize */
function clamp(v: number): number { return Math.max(0, Math.min(100, Math.round(v))) }

function normalize(h: number, d: number, a: number): ProbabilityState {
  const total = h + d + a
  if (total === 0) return { homeWin: 33, draw: 34, awayWin: 33, homeGoals: 0, awayGoals: 0, confidence: 1, bestScores: '?' }
  return {
    homeWin: clamp(Math.round((h / total) * 100)),
    draw: clamp(Math.round((d / total) * 100)),
    awayWin: clamp(Math.round((a / total) * 100)),
    homeGoals: 0,
    awayGoals: 0,
    confidence: 1,
    bestScores: '?',
  }
}

/**
 * Recalculate live probabilities from baseline + events
 */
export function recalculateProbabilities(snapshot: ProbabilitySnapshot): ProbabilitySnapshot {
  const { baseline, momentum, momentumStrength, redCardHome, redCardAway, goalsHome, goalsAway, minutesPlayed } = snapshot

  let h = baseline.homeWin
  let d = baseline.draw
  let a = baseline.awayWin

  // --- 1. Goal adjustments ---
  // Each goal scored = +GOAL_BOOST for scorer, -GOAL_DRAW_REDUCE for draw
  if (goalsHome > 0) {
    h += goalsHome * GOAL_BOOST
    a -= goalsHome * (GOAL_BOOST / 2)
    d -= goalsHome * GOAL_DRAW_REDUCE
  }
  if (goalsAway > 0) {
    a += goalsAway * GOAL_BOOST
    h -= goalsAway * (GOAL_BOOST / 2)
    d -= goalsAway * GOAL_DRAW_REDUCE
  }

  // --- 2. Red card penalties ---
  if (redCardHome) { h -= RED_CARD_PENALTY; d += RED_CARD_DRAW_BOOST; a += RED_CARD_PENALTY - RED_CARD_DRAW_BOOST }
  if (redCardAway) { a -= RED_CARD_PENALTY; d += RED_CARD_DRAW_BOOST; h += RED_CARD_PENALTY - RED_CARD_DRAW_BOOST }

  // --- 3. Time decay (leading team gains probability as time passes) ---
  const lead = goalsHome - goalsAway
  const timeBonus = Math.floor(minutesPlayed / 10) * TIME_DECAY_PER_10MIN
  if (lead > 0) { h += timeBonus; a -= timeBonus / 2; d -= timeBonus / 2 }
  if (lead < 0) { a += timeBonus; h -= timeBonus / 2; d -= timeBonus / 2 }

  // --- 4. Expected goals ---
  const xgHome = Math.round(expectedGoalsFromScore(goalsHome, Math.max(minutesPlayed, 1)) * 10) / 10
  const xgAway = Math.round(expectedGoalsFromScore(goalsAway, Math.max(minutesPlayed, 1)) * 10) / 10

  // --- 5. Momentum factor ---
  const momBonus = momentum !== 'neutral' ? Math.round(momentumStrength * 0.15) : 0
  if (momentum === 'home') { h += momBonus; a -= momBonus / 2 }
  if (momentum === 'away') { a += momBonus; h -= momBonus / 2 }

  // --- 6. Best scores prediction ---
  const predHome = Math.round(xgHome)
  const predAway = Math.round(xgAway)
  const bestScores = `${predHome}-${predAway}`

  // --- 7. Confidence ---
  const maxProb = Math.max(h, a, d)
  const confidence = maxProb >= 85 ? 5 : maxProb >= 70 ? 4 : maxProb >= 55 ? 3 : maxProb >= 40 ? 2 : 1

  const live = normalize(h, d, a)

  return {
    ...snapshot,
    live: { ...live, homeGoals: xgHome, awayGoals: xgAway, confidence, bestScores },
    updatedAt: Date.now(),
  }
}

/** Create initial snapshot from baseline probabilities */
export function createSnapshot(
  homeWin: number, draw: number, awayWin: number,
): ProbabilitySnapshot {
  return {
    baseline: { homeWin: clamp(homeWin), draw: clamp(draw), awayWin: clamp(awayWin), homeGoals: 0, awayGoals: 0, confidence: 3, bestScores: '?' },
    live: { homeWin: clamp(homeWin), draw: clamp(draw), awayWin: clamp(awayWin), homeGoals: 0, awayGoals: 0, confidence: 3, bestScores: '?' },
    momentum: 'neutral',
    momentumStrength: 0,
    redCardHome: false,
    redCardAway: false,
    goalsHome: 0,
    goalsAway: 0,
    minutesPlayed: 0,
    lastEvent: '比赛尚未开始',
    updatedAt: Date.now(),
  }
}
