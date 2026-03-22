import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      role: null,
      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      logout: () => set({ user: null, role: null }),
    }),
    {
      name: 'campus-connect-auth',
    }
  )
)

export const useThemeStore = create(
  persist(
    (set) => ({
      darkMode: true,
      toggleTheme: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: 'campus-connect-theme',
    }
  )
)
