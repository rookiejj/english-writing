import { useNavigate } from 'react-router-dom'
import useMockProductAuth from '@/stores/mockProductAuthStore'

const TOPICS = [
  { id: 1, title: 'Work from Home', level: 'B1', category: '직장·일상' },
  { id: 2, title: 'Favorite Season', level: 'A2', category: '일상' },
  { id: 3, title: 'Technology in Education', level: 'B2', category: '교육·사회' },
]

export default function Home() {
  const navigate = useNavigate()
  const { user } = useMockProductAuth()
  const streak = 5

  return (
    <div className="bg-[#f2f0eb] min-h-full">
      {/* Header greeting */}
      <div className="px-5 pt-6 pb-4">
        <p className="text-xs text-[#8E8E8E] font-medium uppercase tracking-widest mb-1">오늘도 화이팅!</p>
        <h1 className="text-2xl font-bold text-[#171A20]">
          안녕하세요, {user?.nickname ?? '학습자'}님 👋
        </h1>
      </div>

      {/* Streak + level banner */}
      <div className="mx-5 mb-5 bg-[#006241] rounded-xl px-5 py-4 flex items-center justify-between shadow-md">
        <div>
          <p className="text-white/70 text-xs font-medium">현재 레벨</p>
          <p className="text-white text-2xl font-bold mt-0.5">{user?.level ?? 'B1'}</p>
        </div>
        <div className="text-right">
          <p className="text-white/70 text-xs font-medium">연속 학습</p>
          <div className="flex items-center gap-1 justify-end mt-0.5">
            <span className="text-white text-2xl font-bold">{streak}</span>
            <span className="text-orange-300 text-xl">🔥</span>
          </div>
        </div>
      </div>

      {/* Today's review CTA */}
      <div className="mx-5 mb-5">
        <div className="bg-white rounded-xl px-5 py-4 flex items-center justify-between shadow-card">
          <div>
            <p className="text-xs text-[#8E8E8E] font-medium">오늘의 복습</p>
            <p className="text-[#171A20] font-semibold mt-0.5">12개 표현이 기다리고 있어요</p>
          </div>
          <button
            onClick={() => navigate('/review')}
            className="shrink-0 px-4 py-2 bg-[#00754A] text-white text-xs font-semibold rounded-full active:scale-95 transition-transform"
          >
            복습하기
          </button>
        </div>
      </div>

      {/* Recommended topics */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#171A20]">추천 토픽</h2>
          <button onClick={() => navigate('/practice')} className="text-xs text-[#006241] font-medium">전체 보기</button>
        </div>
        <div className="space-y-3">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate('/practice/session', { state: { topic: t } })}
              className="w-full bg-white rounded-xl px-4 py-4 flex items-center justify-between shadow-card active:scale-[0.98] transition-transform"
            >
              <div className="text-left">
                <p className="text-sm font-semibold text-[#171A20]">{t.title}</p>
                <p className="text-xs text-[#8E8E8E] mt-0.5">{t.category}</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                t.level.startsWith('B2') ? 'bg-orange-100 text-orange-600' :
                t.level.startsWith('B1') ? 'bg-blue-100 text-blue-600' :
                'bg-green-100 text-green-600'
              }`}>
                {t.level}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="px-5 mb-4">
        <h2 className="text-sm font-semibold text-[#171A20] mb-3">최근 활동</h2>
        <div className="bg-white rounded-xl px-4 py-3 shadow-card">
          {[
            { date: '오늘', topic: 'Daily Routines', score: 82, icon: '✍️' },
            { date: '어제', topic: 'Healthy Eating', score: 75, icon: '✍️' },
            { date: '2일 전', topic: 'Travel Plans', score: 90, icon: '✍️' },
          ].map((a, i) => (
            <div key={i} className={`flex items-center justify-between py-3 ${i < 2 ? 'border-b border-gray-50' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">{a.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-[#171A20]">{a.topic}</p>
                  <p className="text-[10px] text-[#8E8E8E]">{a.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-[#006241] rounded-full" style={{ width: `${a.score}%` }} />
                </div>
                <span className="text-xs font-bold text-[#006241]">{a.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Level test banner (if no level) */}
      {!user && (
        <div className="mx-5 mb-4">
          <button
            onClick={() => navigate('/level-test')}
            className="w-full bg-[#1E3932] rounded-xl px-5 py-4 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="text-left">
              <p className="text-white text-sm font-semibold">레벨 테스트 받기</p>
              <p className="text-white/60 text-xs mt-0.5">내 수준에 맞는 토픽 추천 받기</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
