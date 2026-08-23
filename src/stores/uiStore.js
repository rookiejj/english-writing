import { create } from 'zustand'

const useUIStore = create((set) => ({
  isCommentPanelOpen: true,
  loginModalOpen: false,
  profileModalOpen: false,
  viewMode: 'prototype', // 'prototype' | 'definition' | 'spec'

  toggleCommentPanel: () => set(s => ({ isCommentPanelOpen: !s.isCommentPanelOpen })),
  openLoginModal: () => set({ loginModalOpen: true }),
  closeLoginModal: () => set({ loginModalOpen: false }),
  openProfileModal: () => set({ profileModalOpen: true }),
  closeProfileModal: () => set({ profileModalOpen: false }),
  setViewMode: (mode) => set({ viewMode: mode }),
}))

export default useUIStore
