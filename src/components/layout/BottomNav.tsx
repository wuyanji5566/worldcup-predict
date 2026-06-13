import { useState } from 'react'
import { Home, Calendar, BarChart3, Trophy, User, Menu, X, Target, Swords, Users2, BookOpen, LayoutDashboard } from 'lucide-react'
import { cn } from '@/utils/cn'

const mainTabs = [
  { path: '/', label: '首页', icon: Home },
  { path: '/matches', label: '比赛', icon: Calendar },
  { path: '/analysis', label: '分析', icon: BarChart3 },
  { path: '/leaderboard', label: '排行', icon: Trophy },
  { path: '/more', label: '更多', icon: Menu, isMore: true },
]

const moreTabs = [
  { path: '/dashboard', label: '智能仪表盘', icon: LayoutDashboard },
  { path: '/predictions', label: '我的预测', icon: Target },
  { path: '/bracket', label: '淘汰赛对阵', icon: Swords },
  { path: '/groups', label: '小组积分', icon: Users2 },
  { path: '/rules', label: '计分规则', icon: BookOpen },
  { path: '/profile', label: '个人中心', icon: User },
]

export function BottomNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/5 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {mainTabs.map((tab) => {
            if (tab.isMore) {
              return (
                <button
                  key={tab.path}
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-2 py-1 min-w-0 transition-colors rounded-lg cursor-pointer border-none bg-transparent',
                    menuOpen ? 'text-accent' : 'text-text-muted',
                  )}
                >
                  <tab.icon size={20} strokeWidth={menuOpen ? 2.5 : 1.75} />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              )
            }
            const isActive = location.hash === `#${tab.path}` || (tab.path === '/' && location.hash === '')
            return (
              <a
                key={tab.path}
                href={`#${tab.path}`}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1 min-w-0 no-underline transition-colors rounded-lg',
                  isActive ? 'text-accent' : 'text-text-muted',
                )}
              >
                <tab.icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </a>
            )
          })}
        </div>
      </nav>

      {/* Slide-up more menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full bg-surface-2 border-t border-white/10 rounded-t-2xl p-5 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-200">全部功能</span>
              <button onClick={() => setMenuOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-3 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pb-6">
              {moreTabs.map((tab) => {
                const isActive = location.hash === `#${tab.path}`
                return (
                  <a
                    key={tab.path}
                    href={`#${tab.path}`}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 p-3.5 rounded-xl border no-underline transition-all',
                      isActive
                        ? 'bg-accent/10 border-accent/20 text-accent'
                        : 'bg-surface-3 border-white/5 text-slate-300 hover:text-white hover:border-white/10',
                    )}
                  >
                    <tab.icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                    <span className="text-[13px] font-medium">{tab.label}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
