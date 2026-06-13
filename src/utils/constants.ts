import type { MatchStage } from '@/types/match'

export const TOURNAMENT_START = '2026-06-11'
export const TOURNAMENT_END = '2026-07-19'

export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const

export const STAGE_ORDER: MatchStage[] = [
  'group', 'round32', 'round16', 'quarter', 'semi', 'third', 'final',
]

export const STAGE_MULTIPLIERS: Record<MatchStage, number> = {
  group: 1, round32: 2, round16: 2.5, quarter: 3, semi: 4, third: 4.5, final: 5,
}

export const STAGE_LABELS: Record<MatchStage, string> = {
  group: '小组赛', round32: '32 强', round16: '16 强',
  quarter: '1/4 决赛', semi: '半决赛', third: '季军赛', final: '决赛',
}

export const JOKERS_PER_USER = 2
export const EXACT_SCORE_POINTS = 3
export const CORRECT_OUTCOME_POINTS = 1
export const PERFECT_GROUP_BONUS = 5
export const PERFECT_ROUND_BONUS = 10
export const CHAMPION_BONUS = 15

export const DEMO_USERS = [
  { username: 'football_fan', displayName: '足球迷小王', avatar: '⚽' },
  { username: 'predictor_zhang', displayName: '预言家老张', avatar: '🔮' },
  { username: 'messi_fan', displayName: '梅西铁粉', avatar: '🇦🇷' },
  { username: 'cr7_fan', displayName: 'C罗无敌', avatar: '🇵🇹' },
  { username: 'analyst_li', displayName: '理智分析师', avatar: '📊' },
]

// Chinese team names
export const TEAM_NAMES_ZH: Record<string, string> = {
  'Argentina': '阿根廷', 'Brazil': '巴西', 'England': '英格兰',
  'France': '法国', 'Germany': '德国', 'Italy': '意大利',
  'Netherlands': '荷兰', 'Portugal': '葡萄牙', 'Spain': '西班牙',
  'Belgium': '比利时', 'Croatia': '克罗地亚', 'Uruguay': '乌拉圭',
  'Mexico': '墨西哥', 'USA': '美国', 'Canada': '加拿大',
  'Japan': '日本', 'South Korea': '韩国', 'Australia': '澳大利亚',
  'Senegal': '塞内加尔', 'Morocco': '摩洛哥', 'Nigeria': '尼日利亚',
  'Cameroon': '喀麦隆', 'Ghana': '加纳', 'Tunisia': '突尼斯',
  'Egypt': '埃及', 'Ivory Coast': '科特迪瓦', 'Algeria': '阿尔及利亚',
  'South Africa': '南非',
  'Saudi Arabia': '沙特阿拉伯', 'Iran': '伊朗', 'Qatar': '卡塔尔',
  'Denmark': '丹麦', 'Switzerland': '瑞士', 'Serbia': '塞尔维亚',
  'Poland': '波兰', 'Ukraine': '乌克兰', 'Austria': '奥地利',
  'Chile': '智利', 'Colombia': '哥伦比亚', 'Ecuador': '厄瓜多尔',
  'Peru': '秘鲁', 'Paraguay': '巴拉圭',
  'New Zealand': '新西兰',
  'Costa Rica': '哥斯达黎加', 'Panama': '巴拿马', 'Jamaica': '牙买加',
  'Sweden': '瑞典', 'Norway': '挪威', 'Turkey': '土耳其',
  'Greece': '希腊', 'Czech Republic': '捷克', 'Romania': '罗马尼亚',
  'Slovakia': '斯洛伐克', 'Hungary': '匈牙利', 'Scotland': '苏格兰',
  'Wales': '威尔士', 'Finland': '芬兰', 'Iceland': '冰岛',
  'Russia': '俄罗斯', 'Bolivia': '玻利维亚', 'Venezuela': '委内瑞拉',
  'UAE': '阿联酋', 'Iraq': '伊拉克', 'China': '中国',
  'Ireland': '爱尔兰', 'Northern Ireland': '北爱尔兰',
}

export const TEAM_FLAGS: Record<string, string> = {
  'Argentina': '🇦🇷', 'Brazil': '🇧🇷', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'France': '🇫🇷', 'Germany': '🇩🇪', 'Italy': '🇮🇹',
  'Netherlands': '🇳🇱', 'Portugal': '🇵🇹', 'Spain': '🇪🇸',
  'Belgium': '🇧🇪', 'Croatia': '🇭🇷', 'Uruguay': '🇺🇾',
  'Mexico': '🇲🇽', 'USA': '🇺🇸', 'Canada': '🇨🇦',
  'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Australia': '🇦🇺',
  'Senegal': '🇸🇳', 'Morocco': '🇲🇦', 'Nigeria': '🇳🇬',
  'Cameroon': '🇨🇲', 'Ghana': '🇬🇭', 'Tunisia': '🇹🇳',
  'Egypt': '🇪🇬', 'Ivory Coast': '🇨🇮', 'Algeria': '🇩🇿',
  'South Africa': '🇿🇦',
  'Saudi Arabia': '🇸🇦', 'Iran': '🇮🇷', 'Qatar': '🇶🇦',
  'Denmark': '🇩🇰', 'Switzerland': '🇨🇭', 'Serbia': '🇷🇸',
  'Poland': '🇵🇱', 'Ukraine': '🇺🇦', 'Austria': '🇦🇹',
  'Chile': '🇨🇱', 'Colombia': '🇨🇴', 'Ecuador': '🇪🇨',
  'Peru': '🇵🇪', 'Paraguay': '🇵🇾',
  'New Zealand': '🇳🇿',
  'Costa Rica': '🇨🇷', 'Panama': '🇵🇦', 'Jamaica': '🇯🇲',
  'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Turkey': '🇹🇷',
  'Greece': '🇬🇷', 'Czech Republic': '🇨🇿', 'Romania': '🇷🇴',
  'Slovakia': '🇸🇰', 'Hungary': '🇭🇺', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'Finland': '🇫🇮', 'Iceland': '🇮🇸',
  'Russia': '🇷🇺', 'Bolivia': '🇧🇴', 'Venezuela': '🇻🇪',
  'UAE': '🇦🇪', 'Iraq': '🇮🇶', 'China': '🇨🇳',
  'Ireland': '🇮🇪', 'Northern Ireland': '🏴󠁧󠁢󠁮󠁩󠁲󠁿',
}

/** 2026 世界杯 12 个小组（基于 FIFA 排名实际分组模拟） */
export const WORLD_CUP_GROUPS: Record<string, string[]> = {
  A: ['Mexico', 'Netherlands', 'Senegal', 'New Zealand'],
  B: ['Argentina', 'Poland', 'South Korea', 'Canada'],
  C: ['England', 'Uruguay', 'Egypt', 'Jamaica'],
  D: ['Brazil', 'Denmark', 'Cameroon', 'Saudi Arabia'],
  E: ['France', 'Croatia', 'Nigeria', 'Qatar'],
  F: ['Germany', 'Colombia', 'Japan', 'Costa Rica'],
  G: ['Spain', 'Switzerland', 'Morocco', 'Australia'],
  H: ['Portugal', 'Chile', 'Iran', 'South Africa'],
  I: ['Italy', 'Belgium', 'Ghana', 'Iraq'],
  J: ['USA', 'Peru', 'Tunisia', 'Panama'],
  K: ['Netherlands', 'Serbia', 'Ivory Coast', 'UAE'],
  L: ['Argentina', 'Ukraine', 'Algeria', 'Paraguay'],
}

// Stadiums
export const STADIUMS: Record<string, string> = {
  'Mexico City': '阿兹特克球场 · 墨西哥城',
  'Toronto': 'BMO 球场 · 多伦多',
  'Los Angeles': 'SoFi 体育场 · 洛杉矶',
  'Miami': '硬石体育场 · 迈阿密',
  'New York': '大都会人寿体育场 · 纽约',
  'Dallas': 'AT&T 体育场 · 达拉斯',
  'San Francisco': '李维斯体育场 · 旧金山',
  'Seattle': '流明球场 · 西雅图',
  'Atlanta': '梅赛德斯-奔驰体育场 · 亚特兰大',
  'Philadelphia': '林肯金融球场 · 费城',
  'Boston': '吉列体育场 · 波士顿',
  'Houston': 'NRG 体育场 · 休斯顿',
  'Kansas City': '箭头体育场 · 堪萨斯城',
  'Vancouver': 'BC 广场 · 温哥华',
  'Monterrey': 'BBVA 球场 · 蒙特雷',
  'Guadalajara': '阿克伦球场 · 瓜达拉哈拉',
}
