import useAuthStore from '@/stores/authStore'
import useUIStore from '@/stores/uiStore'
import LoginModal from '@/components/auth/LoginModal'
import ProfileModal from '@/components/auth/ProfileModal'

export default function TopNav({ title = 'Prototype' }) {
  const { user, logout } = useAuthStore()
  const {
    isCommentPanelOpen, toggleCommentPanel,
    loginModalOpen, openLoginModal, closeLoginModal,
    profileModalOpen, openProfileModal, closeProfileModal,
  } = useUIStore()

  return (
    <>
      <nav className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-white shrink-0 z-10">
        <span className="font-semibold text-sm text-gray-800">{title}</span>

        {/* Mobile: notice only */}
        <p className="md:hidden text-xs text-gray-400">코멘트는 PC에서만 가능합니다</p>

        {/* PC: auth controls + toggle */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-xs text-gray-500">{user.nickname}</span>
              <button onClick={openProfileModal} className="text-xs text-gray-500 hover:text-gray-800">
                프로필
              </button>
              <button onClick={logout} className="text-xs text-gray-500 hover:text-gray-800">
                로그아웃
              </button>
            </>
          ) : (
            <button onClick={openLoginModal} className="text-xs text-gray-700 hover:text-gray-900 font-medium">
              로그인
            </button>
          )}
          <button
            onClick={toggleCommentPanel}
            className="text-xs text-gray-500 hover:text-gray-800 border rounded px-2 py-1"
          >
            {isCommentPanelOpen ? '코멘트 닫기 ›' : '‹ 코멘트'}
          </button>
        </div>
      </nav>

      {loginModalOpen && <LoginModal onClose={closeLoginModal} />}
      {profileModalOpen && <ProfileModal onClose={closeProfileModal} />}
    </>
  )
}
