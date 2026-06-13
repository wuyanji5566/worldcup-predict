// ============================================================
// Dashboard Mock Data — 2026 World Cup Score Prediction
// ============================================================

export interface UpcomingMatch {
  id: string
  date: string
  time: string
  homeTeam: string
  homeFlag: string
  awayTeam: string
  awayFlag: string
  group: string
  stadium: string
  stage: string
}

export interface PointsHistory {
  date: string
  points: number
}

export interface LeaderboardUser {
  rank: number
  name: string
  avatar: string
  points: number
  accuracy: number
  trend: 'up' | 'down' | 'flat'
}

export interface DashboardStats {
  totalMatches: number
  totalPlayers: number
  totalPredictions: string
  avgAccuracy: string
}

// ---- Upcoming Matches (5) ----
export const upcomingMatches: UpcomingMatch[] = [
  {
    id: 'match-001',
    date: '2026-06-15',
    time: '13:00 CST',
    homeTeam: '阿根廷',
    homeFlag: '🇦🇷',
    awayTeam: '加拿大',
    awayFlag: '🇨🇦',
    group: 'B 组',
    stadium: 'BMO 球场 · 多伦多',
    stage: '小组赛',
  },
  {
    id: 'match-002',
    date: '2026-06-15',
    time: '17:00 CST',
    homeTeam: '巴西',
    homeFlag: '🇧🇷',
    awayTeam: '丹麦',
    awayFlag: '🇩🇰',
    group: 'D 组',
    stadium: '硬石体育场 · 迈阿密',
    stage: '小组赛',
  },
  {
    id: 'match-003',
    date: '2026-06-15',
    time: '21:00 CST',
    homeTeam: '法国',
    homeFlag: '🇫🇷',
    awayTeam: '克罗地亚',
    awayFlag: '🇭🇷',
    group: 'E 组',
    stadium: '大都会人寿体育场 · 纽约',
    stage: '小组赛',
  },
  {
    id: 'match-004',
    date: '2026-06-16',
    time: '13:00 CST',
    homeTeam: '德国',
    homeFlag: '🇩🇪',
    awayTeam: '哥伦比亚',
    awayFlag: '🇨🇴',
    group: 'F 组',
    stadium: 'AT&T 体育场 · 达拉斯',
    stage: '小组赛',
  },
  {
    id: 'match-005',
    date: '2026-06-16',
    time: '17:00 CST',
    homeTeam: '西班牙',
    homeFlag: '🇪🇸',
    awayTeam: '瑞士',
    awayFlag: '🇨🇭',
    group: 'G 组',
    stadium: '李维斯体育场 · 旧金山',
    stage: '小组赛',
  },
]

// ---- Points History (last 7 matchdays) ----
export const pointsHistory: PointsHistory[] = [
  { date: '6/11', points: 12 },
  { date: '6/12', points: 18 },
  { date: '6/12', points: 24 },
  { date: '6/13', points: 20 },
  { date: '6/13', points: 30 },
  { date: '6/14', points: 28 },
  { date: '6/15', points: 36 },
]

// ---- Top 3 Leaderboard ----
export const topLeaderboard: LeaderboardUser[] = [
  {
    rank: 1,
    name: '足球预言家',
    avatar: '🔮',
    points: 248,
    accuracy: 0.62,
    trend: 'up',
  },
  {
    rank: 2,
    name: '梅西铁粉',
    avatar: '🇦🇷',
    points: 231,
    accuracy: 0.58,
    trend: 'up',
  },
  {
    rank: 3,
    name: '理智分析师',
    avatar: '📊',
    points: 218,
    accuracy: 0.55,
    trend: 'down',
  },
]

// ---- Dashboard Stats ----
export const dashboardStats: DashboardStats = {
  totalMatches: 104,
  totalPlayers: 12847,
  totalPredictions: '89.2K',
  avgAccuracy: '34.8%',
}

// ---- Current User Snapshot ----
export const currentUser = {
  name: '足球迷小王',
  avatar: '⚽',
  rank: 5,
  points: 207,
  accuracy: 0.53,
}

// ---- Recent Results (for context / second row) ----
export const recentResults: Array<{
  homeTeam: string; homeFlag: string; homeScore: number
  awayTeam: string; awayFlag: string; awayScore: number
  group: string
}> = [
  { homeTeam: '墨西哥', homeFlag: '🇲🇽', homeScore: 3, awayTeam: '南非', awayFlag: '🇿🇦', awayScore: 1, group: 'A 组' },
  { homeTeam: '阿根廷', homeFlag: '🇦🇷', homeScore: 4, awayTeam: '加拿大', awayFlag: '🇨🇦', awayScore: 0, group: 'B 组' },
  { homeTeam: '英格兰', homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', homeScore: 2, awayTeam: '日本', awayFlag: '🇯🇵', awayScore: 2, group: 'C 组' },
  { homeTeam: '巴西', homeFlag: '🇧🇷', homeScore: 3, awayTeam: '摩洛哥', awayFlag: '🇲🇦', awayScore: 1, group: 'D 组' },
]
