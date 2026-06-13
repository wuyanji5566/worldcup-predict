import { Home, Calendar, BarChart3, User } from 'lucide-react'
import { cn } from '@/utils/cn'

const tabs = [
  { path: '/', label: '首页', icon: Home },
  { path: '/matches', label: '比赛', icon: Calendar },
  { path: '/analysis', label: '分析', icon: BarChart3 },
  { path: '/leaderboard', label: '排行', icon: BarChart3 },
  { path: '/profile', label: '我的', icon: User },
]

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/5 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = location.hash === `#${tab.path}` || (tab.path === '/' && location.hash === '')
          return (
            <a
              key={tab.path}
              href={`#${tab.path}`}
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
  )
}
