import { useState } from 'react'
import useMockProductAuth from '@/stores/mockProductAuthStore'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-[#006241]' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  )
}

export default function Settings() {
  const { user, login } = useMockProductAuth()
  const [level, setLevel] = useState(user?.level ?? 'B1')
  const [notifDaily, setNotifDaily] = useState(true)
  const [notifReview, setNotifReview] = useState(true)
  const [notifStreak, setNotifStreak] = useState(false)
  const [dailyGoal, setDailyGoal] = useState('1')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (user) login({ ...user, level })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-full bg-[#f2f0eb] pb-6">
      <div className="px-5 pt-5 pb-4">
        <h1 className="text-xl font-bold text-[#171A20]">설정</h1>
      </div>

      {/* Learning settings */}
      <div className="px-5 mb-1">
        <p className="text-xs font-semibold text-[#8E8E8E] uppercase tracking-widest mb-2">학습 설정</p>
      </div>
      <div className="mx-5 bg-white rounded-xl shadow-card overflow-hidden mb-4">
        {/* Level selector */}
        <div className="px-4 py-4 border-b border-gray-50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-[#171A20]">나의 레벨</p>
            <span className="text-xs font-bold text-[#006241] bg-[#d4e9e2] px-2.5 py-0.5 rounded-full">{level}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  l === level ? 'bg-[#006241] text-white' : 'bg-gray-100 text-[#8E8E8E]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Daily goal */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#171A20]">하루 목표 세션</p>
              <p className="text-xs text-[#8E8E8E] mt-0.5">하루에 몇 번 영작 연습할까요?</p>
            </div>
            <select
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
              className="text-sm font-semibold text-[#006241] bg-[#d4e9e2] px-3 py-1.5 rounded-full border-none focus:outline-none"
            >
              {['1', '2', '3', '5'].map((v) => (
                <option key={v} value={v}>{v}회</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="px-5 mb-1">
        <p className="text-xs font-semibold text-[#8E8E8E] uppercase tracking-widest mb-2">알림 설정</p>
      </div>
      <div className="mx-5 bg-white rounded-xl shadow-card overflow-hidden mb-4">
        {[
          { label: '매일 학습 리마인더', sub: '매일 오전 9시에 학습 알림', val: notifDaily, set: setNotifDaily },
          { label: 'SRS 복습 알림',     sub: '복습 시간이 되면 알림',      val: notifReview, set: setNotifReview },
          { label: '스트릭 위험 알림',  sub: '연속 학습이 끊길 것 같을 때', val: notifStreak, set: setNotifStreak },
        ].map(({ label, sub, val, set }, i) => (
          <div key={label} className={`flex items-center justify-between px-4 py-4 ${i < 2 ? 'border-b border-gray-50' : ''}`}>
            <div>
              <p className="text-sm font-medium text-[#171A20]">{label}</p>
              <p className="text-xs text-[#8E8E8E] mt-0.5">{sub}</p>
            </div>
            <Toggle value={val} onChange={set} />
          </div>
        ))}
      </div>

      {/* Account */}
      <div className="px-5 mb-1">
        <p className="text-xs font-semibold text-[#8E8E8E] uppercase tracking-widest mb-2">계정</p>
      </div>
      <div className="mx-5 bg-white rounded-xl shadow-card overflow-hidden mb-6">
        {['이메일 변경', '비밀번호 변경', '계정 삭제'].map((label, i) => (
          <button
            key={label}
            className={`w-full flex items-center justify-between px-4 py-4 active:bg-gray-50 ${
              i < 2 ? 'border-b border-gray-50' : 'text-red-500'
            }`}
          >
            <span className={`text-sm font-medium ${i === 2 ? 'text-red-500' : 'text-[#171A20]'}`}>{label}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        ))}
      </div>

      {/* Save */}
      <div className="px-5">
        <button
          onClick={handleSave}
          className="w-full py-4 bg-[#00754A] text-white font-semibold rounded-full shadow-md active:scale-95 transition-transform"
        >
          {saved ? '저장되었습니다 ✓' : '변경사항 저장'}
        </button>
      </div>
    </div>
  )
}
