import { create } from 'zustand'

interface AuthState {
  user: { id: string; email: string; name: string } | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    // Mock login for demo
    set({ user: { id: '1', email, name: 'Sbencompany' }, isAuthenticated: true })
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}))