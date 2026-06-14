import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, Trophy, UserCircle,
  LogIn, Swords, Target, ChevronLeft, ChevronRight, Flame, Zap,
  BarChart3, Home, X,
} from 'lucide-react'

const ZapIcon = Zap
const BarChart3Icon = BarChart3
import { useState } from 'react'
import { cn } from '@/utils/cn'

const navSections = [
  {
    label: '主导航',
    items: [
      { to: '/', icon: ZapIcon, label: '首页' },
      { to: '/dashboard', icon: LayoutDashboard, label: '智能仪表盘' },
      { to: '/matches', icon: CalendarDays, label: '赛事预测' },
      { to: '/analysis', icon: BarChart3Icon, label: '概率分析' },
      { to: '/leaderboard', icon: Trophy, label: '排行榜' },
      { to: '/bracket', icon: Swords, label: '淘汰赛' },
      { to: '/predictions', icon: Target, label: '我的预测' },
      { to: '/groups', icon: Flame, label: '小组积分' },
    ],
  },
  {
    label: '账户',
    items: [
      { to: '/profile', icon: UserCircle, label: '个人中心' },
      { to: '/login', icon: LogIn, label: '登录' },
    ],
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30 transition-all duration-300',
          'bg-surface-1 border-r border-border-default',
          collapsed ? 'w-[72px]' : 'w-[240px]',
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 border-b border-border-default px-4',
          collapsed ? 'justify-center' : 'gap-3',
        )}>
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
            <Trophy size={20} className="text-accent" />
          </div>
          {!collapsed && (
            <span className="font-bold text-base text-text-primary tracking-tight whitespace-nowrap">
              World Cup 2026
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-tertiary mb-2 px-3">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 no-underline',
                        collapsed && 'justify-center px-2',
                        isActive
                          ? 'bg-accent/10 text-accent font-semibold'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-2',
                      )
                    }
                  >
                    <item.icon
                      size={20}
                      strokeWidth={1.75}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-border-default p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-text-tertiary hover:text-text-secondary hover:bg-surface-2 transition-all cursor-pointer"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span className="text-xs">收起菜单</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </>
  )
}

function MobileBottomNav() {
  const [moreOpen, setMoreOpen] = useState(false)

  const mainTabs = [
    { to: '/', icon: Home, label: '首页' },
    { to: '/dashboard', icon: LayoutDashboard, label: '仪表盘' },
    { to: '/matches', icon: CalendarDays, label: '比赛' },
    { to: '/leaderboard', icon: Trophy, label: '排行' },
    { to: '/more', icon: ChevronRight, label: '更多', isMore: true },
  ]

  const moreTabs = [
    { to: '/predictions', icon: Target, label: '我的预测' },
    { to: '/bracket', icon: Swords, label: '淘汰赛' },
    { to: '/groups', icon: Flame, label: '小组积分' },
    { to: '/analysis', icon: BarChart3Icon, label: '概率分析' },
    { to: '/rules', icon: Flame, label: '计分规则' },
    { to: '/profile', icon: UserCircle, label: '个人中心' },
  ]

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-border-default safe-area-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {mainTabs.map((tab) => {
            if (tab.isMore) {
              return (
                <button
                  key={tab.to}
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors cursor-pointer border-none bg-transparent',
                    moreOpen ? 'text-accent' : 'text-text-tertiary',
                  )}
                >
                  <tab.icon size={20} strokeWidth={moreOpen ? 2.5 : 1.75} />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              )
            }
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === '/'}
                onClick={() => setMoreOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg no-underline transition-colors',
                    isActive ? 'text-accent' : 'text-text-tertiary',
                  )
                }
              >
                <tab.icon size={20} strokeWidth={1.75} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* Slide-up "More" menu */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full bg-surface-1 border-t border-border-strong rounded-t-2xl p-5 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-text-primary">全部功能</span>
              <button onClick={() => setMoreOpen(false)} className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-2 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pb-6">
              {moreTabs.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 p-3.5 rounded-xl no-underline border transition-all',
                      isActive
                        ? 'bg-accent/10 border-accent/20 text-accent'
                        : 'bg-surface-2 border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong',
                    )
                  }
                >
                  <tab.icon size={18} strokeWidth={1.5} />
                  <span className="text-[13px] font-medium">{tab.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
