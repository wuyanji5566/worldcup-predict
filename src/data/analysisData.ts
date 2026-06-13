// June 14, 2026 World Cup — 4 Match Probability Analysis Data

export interface MatchProbability {
  id: string
  homeTeam: string
  homeFlag: string
  awayTeam: string
  awayFlag: string
  homeWin: number   // percentage 0-100
  draw: number
  awayWin: number
  bestScores: string
  certainty: number  // 1-5 stars
  kickoff: string
  venue: string
  group: string
}

export const june14Matches: MatchProbability[] = [
  {
    id: 'j14-m1',
    homeTeam: '海地',
    homeFlag: '🇭🇹',
    awayTeam: '苏格兰',
    awayFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    homeWin: 6,
    draw: 12,
    awayWin: 82,
    bestScores: '0-2, 0-3',
    certainty: 5,
    kickoff: '13:00 CST',
    venue: '吉列体育场 · 波士顿',
    group: 'K 组',
  },
  {
    id: 'j14-m2',
    homeTeam: '卡塔尔',
    homeFlag: '🇶🇦',
    awayTeam: '瑞士',
    awayFlag: '🇨🇭',
    homeWin: 12,
    draw: 20,
    awayWin: 68,
    bestScores: '0-1, 0-2',
    certainty: 4,
    kickoff: '17:00 CST',
    venue: 'NRG 体育场 · 休斯顿',
    group: 'L 组',
  },
  {
    id: 'j14-m3',
    homeTeam: '巴西',
    homeFlag: '🇧🇷',
    awayTeam: '摩洛哥',
    awayFlag: '🇲🇦',
    homeWin: 48,
    draw: 30,
    awayWin: 22,
    bestScores: '1-0, 2-1',
    certainty: 3,
    kickoff: '21:00 CST',
    venue: '李维斯体育场 · 旧金山',
    group: 'D 组',
  },
  {
    id: 'j14-m4',
    homeTeam: '澳大利亚',
    homeFlag: '🇦🇺',
    awayTeam: '土耳其',
    awayFlag: '🇹🇷',
    homeWin: 28,
    draw: 26,
    awayWin: 46,
    bestScores: '1-1, 1-2',
    certainty: 2,
    kickoff: '21:00 CST',
    venue: 'BC 广场 · 温哥华',
    group: 'H 组',
  },
]

export interface McKinseyInsight {
  id: number
  icon: string
  title: string
  body: string
  tags: string[]
}

export const mckinseyInsights: McKinseyInsight[] = [
  {
    id: 1,
    icon: '🎯',
    title: '稳胆选择',
    body: '苏格兰与瑞士是当日最稳的两场——硬实力断层式碾压，确定性超 68%。苏格兰 82% 客胜概率为全天最高置信度选项，适合作为串关基石。',
    tags: ['高置信度', '串关基石'],
  },
  {
    id: 2,
    icon: '💰',
    title: '黄金博弈点',
    body: '巴西 - 摩洛哥的平局 (30%) 是当日最大价值博弈点。摩洛哥 5-4-1 铁桶阵防守体系极强，对阵强队时擅长消耗战，需重点防范上半场 0-0 僵局及下半场 70 分钟后的突变窗口。',
    tags: ['高赔率价值', '防守反击'],
  },
  {
    id: 3,
    icon: '⚠️',
    title: 'AI 模型陷阱',
    body: '土耳其初始 AI 胜率 72.5% 严重虚高——模型过度拟合其近期欧国联数据。结合 FIFA 排名偏低（第 41 位）与澳大利亚的主场场地优势及长途旅行对土耳其体能的影响，综合修正胜率至 46%，此场变数为四场中最不可控。',
    tags: ['模型修正', '高变数'],
  },
  {
    id: 4,
    icon: '🧩',
    title: '行动策略建议',
    body: '【稳健型组合】双选苏格兰胜 + 瑞士胜，预期回报稳定，确定性最高。【博弈型组合】切入巴西防平，同时关注澳大利亚 vs 土耳其大球方向——两队防线均有明显漏洞，预期总进球 > 2.5。',
    tags: ['稳健', '博弈', '策略组合'],
  },
]
