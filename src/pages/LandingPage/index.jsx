import { useNavigate } from 'react-router-dom'
import useMockProductAuth from '@/stores/mockProductAuthStore'

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useMockProductAuth()

  return (
    <div className="w-full h-full min-h-0 flex items-start justify-center bg-[#edebe9] overflow-hidden">
    <div className="w-full max-w-[420px] h-full bg-[#f2f0eb] shadow-2xl overflow-y-auto border-x border-black/5">
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-16">
      {/* App mark */}
      <div className="w-20 h-20 rounded-3xl bg-[#006241] flex items-center justify-center mb-8 shadow-lg">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M8 28 L14 10 L20 24 L26 10 L32 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 32 H34" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-[#171A20] tracking-tight mb-2">영작 연습</h1>
      <p className="text-[#8E8E8E] text-base text-center mb-10 max-w-xs leading-relaxed">
        AI 피드백으로 매일 조금씩 영어 글쓰기를 발전시켜 보세요
      </p>

      {/* Feature highlights */}
      <div className="w-full max-w-sm space-y-3 mb-12">
        {[
          { icon: '✍️', title: '매일 영작 연습', desc: '토픽별 영작 세션으로 꾸준히 실력 향상' },
          { icon: '🤖', title: 'AI 즉시 피드백', desc: '문법·표현·자연스러움을 바로 교정' },
          { icon: '🔁', title: 'SRS 복습 시스템', desc: '틀린 표현을 잊을 만할 때 다시 학습' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="flex items-start gap-4 bg-white rounded-xl px-4 py-4 shadow-card">
            <span className="text-2xl mt-0.5">{icon}</span>
            <div>
              <p className="text-sm font-semibold text-[#171A20]">{title}</p>
              <p className="text-xs text-[#8E8E8E] mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => navigate(user ? '/home' : '/login')}
          className="w-full py-4 bg-[#00754A] text-white font-semibold text-base rounded-full shadow-md active:scale-95 transition-transform"
        >
          {user ? '홈으로 이동' : '지금 시작하기'}
        </button>
        {!user && (
          <button
            onClick={() => navigate('/home')}
            className="w-full py-3.5 border border-[#006241] text-[#006241] font-medium text-base rounded-full active:scale-95 transition-transform"
          >
            둘러보기
          </button>
        )}
      </div>

      <p className="mt-8 text-xs text-[#8E8E8E] text-center">
        레벨 테스트 후 맞춤형 커리큘럼이 제공됩니다
      </p>
    </div>
    </div>
    </div>
  )
}
