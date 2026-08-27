import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const ADMIN_NAV = [
  { path: '/admin', label: '대시보드', exact: true },
  { path: '/admin/questions', label: '문제 관리' },
  { path: '/admin/scoring', label: '채점 로직' },
  { path: '/admin/users', label: '사용자 관리' },
  { path: '/admin/stats', label: '통계·리포트' },
]

export default function AdminShell() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)

  return (
    <div className="flex h-full min-h-0 w-full bg-[#f9f9f9]">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 bg-[#1E3932] flex flex-col overflow-y-auto">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="text-white/50 text-xs tracking-widest uppercase font-medium">Admin</p>
          <p className="text-white text-sm font-semibold mt-0.5 tracking-tight">영작 연습 앱</p>
        </div>
        <nav className="flex-1 py-3">
          {ADMIN_NAV.map(({ path, label, exact }) => {
            const active = exact ? location.pathname === path : location.pathname.startsWith(path)
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            )
          })}
        </nav>
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-white/40 text-xs">관리자 패널</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-h-0 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
