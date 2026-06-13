import { useState, useRef, useEffect } from 'react'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bg-card border border-border hover:bg-bg-card-hover transition-colors cursor-pointer"
      >
        <span className="text-lg">{user.avatar}</span>
        <span className="text-sm font-medium text-text hidden sm:block">{user.displayName}</span>
        <ChevronDown size={14} className="text-text-muted" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          <a
            href="#/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-bg-card-hover transition-colors no-underline"
          >
            <User size={16} />
            个人中心
          </a>
          <button
            onClick={() => { logout(); setOpen(false) }}
            className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-bg-card-hover transition-colors w-full cursor-pointer border-t border-border"
          >
            <LogOut size={16} />
            退出登录
          </button>
        </div>
      )}
    </div>
  )
}
