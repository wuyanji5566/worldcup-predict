import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'

export function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login, openAuthModal } = useAuth()
  const addToast = useUIStore((s) => s.addToast)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!username || !password) return
    setLoading(true)
    const ok = await login(username, password)
    setLoading(false)
    if (ok) {
      addToast('登录成功', 'success')
      setUsername(''); setPassword('')
    } else {
      addToast('用户名或密码错误', 'error')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="登录" size="sm">
      <div className="space-y-4">
        <Input label="用户名" placeholder="输入用户名" value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
        <Input label="密码" type="password" placeholder="输入密码" value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
        <Button variant="primary" loading={loading} onClick={handleLogin} className="w-full">登录</Button>
        <p className="text-xs text-center text-text-tertiary">
          没有账号？{' '}
          <button onClick={() => openAuthModal('register')} className="text-accent hover:underline cursor-pointer">注册</button>
        </p>
        <p className="text-[11px] text-text-tertiary text-center">演示账号: football_fan / demo1234</p>
      </div>
    </Modal>
  )
}
