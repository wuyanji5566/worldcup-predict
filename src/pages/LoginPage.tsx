import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Eye, EyeOff, User, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const addToast = useUIStore((s) => s.addToast)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username || !password) { setError('请填写用户名和密码'); return }
    setLoading(true)
    const ok = await login(username, password)
    setLoading(false)
    if (ok) {
      addToast('登录成功！', 'success')
      navigate('/')
    } else {
      setError('用户名或密码错误')
    }
  }

  return (
    <div className="min-h-[80dvh] flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
            <Trophy size={28} className="text-accent" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">欢迎回来</h1>
          <p className="text-sm text-text-tertiary mt-1">登录你的世界杯预测账户</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-surface-2 border border-border-default rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">用户名</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="输入用户名"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-1 border border-border-default rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">密码</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入密码"
                className="w-full pl-10 pr-10 py-2.5 bg-surface-1 border border-border-default rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary cursor-pointer"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-live font-medium">{error}</p>
          )}

          <Button type="submit" variant="primary" loading={loading} className="w-full">
            登录
          </Button>

          <p className="text-xs text-center text-text-tertiary">
            演示账号: football_fan / demo1234
          </p>
        </form>
      </div>
    </div>
  )
}
