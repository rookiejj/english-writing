import { useNavigate } from 'react-router-dom'
import useMockProductAuth from '@/stores/mockProductAuthStore'

const STATS = [
  { label: '총 세션', value: '24', unit: '회' },
  { label: '연속 학습', value: '5', unit: '일' },
  { label: '교정 표현', value: '87', unit: '개' },
  { label: '평균 점수', value: '81', unit: '점' },
]

const MENU_ITEMS = [
  { icon: '🔖', label: '북마크', path: '/bookmarks' },
  { icon: '⚙️', label: '설정', path: '/my/settings' },
  { icon: '📊', label: '학습 리포트', path: null },
  { icon: '🏆', label: '내 레벨 & 배지', path: null },
  { icon: '❓', label: '고객센터', path: null },
]

export default function MyPage() {
  const navigate = useNavigate()
  const { user, logout } = useMockProductAuth()

  if (!user) {
    return (
      <div className="min-h-full bg-[#f2f0eb] flex flex-col items-center justify-center px-6 py-16">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <p className="text-[#171A20] font-semibold mb-1">로그인이 필요합니다</p>
        <p className="text-sm text-[#8E8E8E] mb-8">로그인하면 학습 기록을 볼 수 있어요</p>
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3.5 bg-[#00754A] text-white font-semibold rounded-full shadow-md active:scale-95 transition-transform"
        >
          로그인 / 회원가입
        </button>
      </div>
    )
  }

  return (
    <div className="bg-[#f2f0eb] min-h-full">
      {/* Profile header */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#006241] flex items-center justify-center text-white text-xl font-bold shadow-md">
            {user.nickname?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-lg font-bold text-[#171A20]">{user.nickname}</p>
            <p className="text-sm text-[#8E8E8E]">{user.email}</p>
            <span className="mt-1 inline-block text-xs font-bold bg-[#d4e9e2] text-[#006241] px-2.5 py-0.5 rounded-full">
              레벨 {user.level ?? 'B1'}
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2">
          {STATS.map(({ label, value, unit }) => (
            <div key={label} className="bg-white rounded-xl px-2 py-3 text-center shadow-card">
              <p className="text-lg font-bold text-[#006241]">{value}<span className="text-xs font-medium text-[#8E8E8E] ml-0.5">{unit}</span></p>
              <p className="text-[10px] text-[#8E8E8E] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly streak calendar */}
      <div className="mx-5 mb-4 bg-white rounded-xl px-4 py-4 shadow-card">
        <p className="text-xs font-semibold text-[#8E8E8E] uppercase tracking-widest mb-3">이번 주 학습</p>
        <div className="flex gap-2 justify-between">
          {['월', '화', '수', '목', '금', '토', '일'].map((day, i) => {
            const done = i < 5
            return (
              <div key={day} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  done ? 'bg-[#006241] text-white' : 'bg-gray-100 text-[#8E8E8E]'
                }`}>
                  {done ? '✓' : day}
                </div>
                <span className="text-[10px] text-[#8E8E8E]">{day}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Menu list */}
      <div className="mx-5 mb-4 bg-white rounded-xl shadow-card overflow-hidden">
        {MENU_ITEMS.map(({ icon, label, path }, i) => (
          <button
            key={label}
            onClick={() => path && navigate(path)}
            className={`w-full flex items-center gap-4 px-4 py-4 active:bg-gray-50 transition-colors ${
              i < MENU_ITEMS.length - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            <span className="text-xl w-8 text-center">{icon}</span>
            <span className="flex-1 text-sm font-medium text-[#171A20] text-left">{label}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-5 mb-6">
        <button
          onClick={() => { logout(); navigate('/') }}
          className="w-full py-3.5 border border-red-200 text-red-500 text-sm font-medium rounded-full active:scale-95 transition-transform"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}
