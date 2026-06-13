import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'

interface RegisterModalProps {
  open: boolean
  onClose: () => void
}

export function RegisterModal({ open, onClose }: RegisterModalProps) {
  const { register, openAuthModal } = useAuth()
  const addToast = useUIStore((s) => s.addToast)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async () => {
    setError('')
    if (!username || !displayName || !password) {
      setError('请填写所有字段')
      return
    }
    if (password !== confirmPassword) {
      setError('两次密码不一致')
      return
    }
    if (password.length < 6) {
      setError('密码至少 6 位')
      return
    }
    setLoading(true)
    const ok = await register(username, password, displayName)
    setLoading(false)
    if (ok) {
      addToast('注册成功！', 'success')
    } else {
      setError('用户名已被占用')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="创建账号" size="sm">
      <div className="flex flex-col gap-4">
        <Input
          label="用户名"
          placeholder="3-20 个字符"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          label="昵称"
          placeholder="显示在排行榜上"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <Input
          label="密码"
          type="password"
          placeholder="至少 6 位"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="确认密码"
          type="password"
          placeholder="再次输入密码"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button variant="primary" loading={loading} onClick={handleRegister} className="w-full">
          注册
        </Button>
        <p className="text-sm text-text-muted text-center">
          已有账号？{' '}
          <button
            onClick={() => openAuthModal('login')}
            className="text-accent hover:underline cursor-pointer"
          >
            登录
          </button>
        </p>
      </div>
    </Modal>
  )
}
