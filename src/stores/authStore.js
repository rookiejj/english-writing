import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authService from '@/services/auth.service'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: async (email, password) => {
        const { user, token } = await authService.login(email, password)
        set({ user, token })
      },

      signup: async (email, password, nickname) => {
        const { user, token } = await authService.signup(email, password, nickname)
        set({ user, token })
      },

      logout: () => set({ user: null, token: null }),

      updateNickname: async (nickname) => {
        await authService.updateNickname(nickname, get().token)
        set(s => ({ user: { ...s.user, nickname } }))
      },

      updatePassword: async (currentPassword, newPassword) => {
        await authService.updatePassword(currentPassword, newPassword, get().token)
      },
    }),
    {
      name: 'auth',
      partialize: s => ({ user: s.user, token: s.token }),
    }
  )
)

export default useAuthStore
