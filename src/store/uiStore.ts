import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface UIStore {
  sidebarOpen: boolean
  toasts: Toast[]
  toggleSidebar: () => void
  addToast: (message: string, type: Toast['type']) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  sidebarOpen: false,
  toasts: [],

  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

  addToast: (message, type) => {
    const id = Date.now().toString(36)
    set({ toasts: [...get().toasts, { id, message, type }] })
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) })
    }, 3000)
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) })
  },
}))
