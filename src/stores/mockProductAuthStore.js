import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useMockProductAuth = create(
  persist(
    (set) => ({
      user: null,
      login: (profile) => set({ user: profile }),
      logout: () => set({ user: null }),
    }),
    { name: 'mock-product-auth' }
  )
)

export default useMockProductAuth
