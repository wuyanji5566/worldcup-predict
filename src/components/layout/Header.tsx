import { Bell, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { UserMenu } from '@/components/auth/UserMenu'
import { Button } from '@/components/ui/Button'

export function Header() {
  const { user, isLoggedIn, openAuthModal } = useAuth()

  return (
    <header className="sticky top-0 z-20 glass border-b border-border-default">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        {/* Left: mobile menu + page title (mobile shows "World Cup 2026") */}
        <div className="flex items-center gap-3">
          <span className="lg:hidden font-bold text-sm text-text-primary tracking-tight">
            World Cup 2026
          </span>
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
