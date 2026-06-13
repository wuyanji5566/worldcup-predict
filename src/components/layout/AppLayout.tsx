import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ToastContainer } from '@/components/ui/Toast'
import { LoginModal } from '@/components/auth/LoginModal'
import { RegisterModal } from '@/components/auth/RegisterModal'
import { useAuth } from '@/hooks/useAuth'

export function AppLayout() {
  const { isAuthModalOpen, authModalMode, closeAuthModal } = useAuth()

  return (
    <div className="min-h-dvh bg-surface-0">
      <Sidebar />

      {/* Main content area - offset by sidebar width on desktop */}
      <div className="lg:pl-[240px] flex flex-col min-h-dvh">
        <Header />
        <main className="flex-1 px-4 md:px-6 lg:px-8 py-4 md:py-6 pb-24 lg:pb-8 max-w-[1400px] mx-auto w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <ToastContainer />

      {isAuthModalOpen && authModalMode === 'login' && (
        <LoginModal open={isAuthModalOpen} onClose={closeAuthModal} />
      )}
      {isAuthModalOpen && authModalMode === 'register' && (
        <RegisterModal open={isAuthModalOpen} onClose={closeAuthModal} />
      )}
    </div>
  )
}
