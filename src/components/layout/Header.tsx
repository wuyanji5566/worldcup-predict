import { Bell, Search, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { UserMenu } from '@/components/auth/UserMenu'
import { Button } from '@/components/ui/Button'
import { useMatchStore } from '@/store/matchStore'
import { useState, useEffect } from 'react'

export function Header() {
  const { user, isLoggedIn, openAuthModal } = useAuth()
  const dataSource = useMatchStore((s) => s.dataSource)
  const lastFetch = useMatchStore((s) => s.lastFetch)
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    const update = () => {
      if (!lastFetch) { setTimeAgo(''); return }
      const seconds = Math.floor((Date.now() - lastFetch) / 1000)
      if (seconds < 60) setTimeAgo(`${seconds}s 前更新`)
      else setTimeAgo(`${Math.floor(seconds / 60)}m 前更新`)
    }
    update()
    const t = setInterval(update, 10000)
    return () => clearInterval(t)
  }, [lastFetch])

  return (
    <header className="sticky top-0 z-20 glass border-b border-border-default">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        {/* Left: mobile menu + live indicator */}
        <div className="flex items-center gap-3">
          <span className="lg:hidden font-bold text-sm text-text-primary tracking-tight">
            World Cup 2026
          </span>
          {/* Auto-refresh indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-text-tertiary">
            <RefreshCw size={10} className="text-emerald-400" />
            <span>{dataSource.includes('ESPN') ? '实时' : dataSource}</span>
            {timeAgo && <span className="opacity-60">· {timeAgo}</span>}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button className="p-2 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-surface-2 transition-colors cursor-pointer">
            <Search size={18} />
          </button>
          <button className="p-2 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-surface-2 transition-colors cursor-pointer relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-live" />
          </button>
          <div className="w-px h-6 bg-border-default mx-1" />

          {isLoggedIn && user ? (
            <UserMenu />
          ) : (
            <Button variant="primary" size="sm" onClick={() => openAuthModal('login')}>
              登录
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
