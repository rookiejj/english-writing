import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import useUIStore from '@/stores/uiStore'
import LoginModal from '@/components/auth/LoginModal'
import ProfileModal from '@/components/auth/ProfileModal'

const VIEW_TABS = [
  { key: 'prototype',  label: '프로토타입' },
  { key: 'definition', label: '기능정의서' },
  { key: 'spec',       label: '기능명세서' },
]

// IA areas — derived from the current project's two IA areas
const IA_AREAS = [
  { key: 'user',  label: '사용자', home: '/' },
  { key: 'admin', label: '관리자', home: '/admin' },
]

function getCurrentArea(pathname) {
  if (pathname.startsWith('/admin')) return 'admin'
  return 'user'
}

export default function TopNav() {
  const { user, logout } = useAuthStore()
  const {
    isCommentPanelOpen, toggleCommentPanel,
    loginModalOpen, openLoginModal, closeLoginModal,
    profileModalOpen, openProfileModal, closeProfileModal,
    viewMode, setViewMode,
  } = useUIStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [switcherOpen, setSwitcherOpen] = useState(false)

  const currentArea = getCurrentArea(location.pathname)

  return (
    <>
      <nav className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-white shrink-0 z-10">
        {/* Top-left: IA area switcher (2 areas → dropdown; shown only in prototype mode) */}
        {viewMode === 'prototype' ? (
          <div className="relative">
            <button
              onClick={() => setSwitcherOpen((o) => !o)}
              className="flex items-center gap-1 text-sm font-semibold text-gray-800 hover:text-[#006241] transition-colors"
            >
              {IA_AREAS.find((a) => a.key === currentArea)?.label ?? '사용자'}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {switcherOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSwitcherOpen(false)} />
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[120px]">
                  {IA_AREAS.map((area) => (
                    <button
                      key={area.key}
                      onClick={() => { navigate(area.home); setSwitcherOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        area.key === currentArea
                          ? 'text-[#006241] font-medium bg-[#d4e9e2]/30'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {area.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <span className="font-semibold text-sm text-gray-800">Prototype</span>
        )}

        {/* View mode tabs — all breakpoints */}
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
          {VIEW_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={`px-3 py-1 text-xs rounded-md transition-all duration-150 ${
                viewMode === key
                  ? 'bg-white shadow-sm text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* PC: auth + comment toggle */}
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
          {viewMode === 'prototype' && (
            <button
              onClick={toggleCommentPanel}
              className="text-xs text-gray-500 hover:text-gray-800 border rounded px-2 py-1"
            >
              {isCommentPanelOpen ? '코멘트 닫기 ›' : '‹ 코멘트'}
            </button>
          )}
        </div>
      </nav>

      {loginModalOpen && <LoginModal onClose={closeLoginModal} />}
      {profileModalOpen && <ProfileModal onClose={closeProfileModal} />}
    </>
  )
}
