import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const isAuthModalOpen = useAuthStore((s) => s.isAuthModalOpen)
  const authModalMode = useAuthStore((s) => s.authModalMode)
  const openAuthModal = useAuthStore((s) => s.openAuthModal)
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal)
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const logout = useAuthStore((s) => s.logout)

  return {
    user: currentUser,
    isLoggedIn,
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    logout,
  }
}
