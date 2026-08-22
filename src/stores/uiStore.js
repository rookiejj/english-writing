import { create } from 'zustand'

const useUIStore = create((set) => ({
  isCommentPanelOpen: true,
  loginModalOpen: false,
  profileModalOpen: false,

  toggleCommentPanel: () => set(s => ({ isCommentPanelOpen: !s.isCommentPanelOpen })),
  openLoginModal: () => set({ loginModalOpen: true }),
  closeLoginModal: () => set({ loginModalOpen: false }),
  openProfileModal: () => set({ profileModalOpen: true }),
  closeProfileModal: () => set({ profileModalOpen: false }),
}))

export default useUIStore
