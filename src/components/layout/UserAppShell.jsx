import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useRef, useEffect, useCallback } from 'react'

const ROOT_PATHS = new Set(['/home', '/practice', '/review', '/my', '/community'])

const TAB_ITEMS = [
  {
    path: '/home', label: '홈',
    icon: ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#006241' : 'none'}
        stroke={active ? '#006241' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    path: '/practice', label: '학습',
    icon: ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#006241' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    path: '/review', label: '복습',
    icon: ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#006241' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" />
      </svg>
    ),
  },
  {
    path: '/my', label: '마이',
    icon: ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#006241' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    path: '/community', label: '커뮤니티',
    icon: ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#006241' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

export default function UserAppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const isRoot = ROOT_PATHS.has(location.pathname)
  const scrollRef = useRef(null)
  const scrollPositions = useRef({})

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      scrollPositions.current[location.pathname] = scrollRef.current.scrollTop
    }
  }, [location.pathname])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollPositions.current[location.pathname] ?? 0
    }
  }, [location.pathname])

  return (
    <div className="w-full h-full min-h-0 flex items-start justify-center bg-[#edebe9] overflow-hidden">
      <div className="relative w-full max-w-[420px] h-full flex flex-col bg-[#f2f0eb] shadow-2xl overflow-hidden border-x border-black/5">
        {/* Back-header for detail screens */}
        {!isRoot && (
          <header className="shrink-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-[#006241] text-sm font-medium active:scale-95 transition-transform"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              뒤로
            </button>
          </header>
        )}

        {/* Scrollable content area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto min-h-0"
          onScroll={handleScroll}
        >
          <Outlet />
          {isRoot && <div style={{ height: 'calc(4rem + env(safe-area-inset-bottom))' }} />}
        </div>

        {/* Bottom tab bar — root screens only */}
        {isRoot && (
          <nav className="shrink-0 bg-white border-t border-gray-100 z-10" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex">
              {TAB_ITEMS.map(({ path, label, icon: Icon }) => {
                const active = location.pathname === path
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={`flex-1 flex flex-col items-center pt-2 pb-1 gap-0.5 transition-colors active:scale-95 ${
                      active ? 'text-[#006241]' : 'text-gray-400'
                    }`}
                  >
                    <Icon active={active} />
                    <span className="text-[10px] font-medium tracking-tight">{label}</span>
                  </button>
                )
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}
