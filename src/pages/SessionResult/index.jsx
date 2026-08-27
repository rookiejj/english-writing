import { useNavigate, useLocation } from 'react-router-dom'

const MOCK_FEEDBACK = {
  score: 82,
  grades: { grammar: 85, vocabulary: 78, fluency: 80, coherence: 86 },
  corrections: [
    {
      original: 'I think working from home are good.',
      corrected: 'I think working from home is good.',
      reason: '주어가 단수(working from home)이므로 "is"를 사용해야 합니다.',
      type: 'grammar',
    },
    {
      original: 'It have many advantage.',
      corrected: 'It has many advantages.',
      reason: '주어가 3인칭 단수이므로 "has", "advantages"는 복수형입니다.',
      type: 'grammar',
    },
  ],
  expressions: [
    { original: 'good', better: 'beneficial / productive' },
    { original: 'very important', better: 'crucial / essential' },
  ],
  overall: '전반적으로 의견을 잘 전달했습니다. 문장 연결어(however, therefore)를 활용하면 글의 흐름이 더 좋아질 것입니다.',
}

const GRADE_LABELS = { grammar: '문법', vocabulary: '어휘', fluency: '유창성', coherence: '일관성' }

const SCORE_COLOR = (s) => s >= 85 ? '#006241' : s >= 70 ? '#1E3932' : '#f59e0b'

export default function SessionResult() {
  const navigate = useNavigate()
  const location = useLocation()
  const topic = location.state?.topic ?? { title: 'Work from Home' }
  const fb = MOCK_FEEDBACK

  return (
    <div className="min-h-full bg-[#f2f0eb] pb-6">
      {/* Score hero */}
      <div className="bg-[#006241] px-5 pt-8 pb-10">
        <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">{topic.title}</p>
        <h1 className="text-white text-xl font-bold mb-6">채점 결과</h1>
        <div className="flex items-end gap-1">
          <span className="text-white text-6xl font-bold">{fb.score}</span>
          <span className="text-white/60 text-2xl mb-2">/ 100</span>
        </div>
      </div>

      {/* Grade breakdown */}
      <div className="mx-5 -mt-5 bg-white rounded-xl px-5 py-4 shadow-md mb-4">
        <p className="text-xs font-semibold text-[#8E8E8E] uppercase tracking-widest mb-3">세부 점수</p>
        <div className="space-y-3">
          {Object.entries(fb.grades).map(([key, val]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[#171A20]">{GRADE_LABELS[key]}</span>
                <span className="text-xs font-bold" style={{ color: SCORE_COLOR(val) }}>{val}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${val}%`, backgroundColor: SCORE_COLOR(val) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grammar corrections */}
      {fb.corrections.length > 0 && (
        <div className="mx-5 mb-4">
          <h2 className="text-sm font-semibold text-[#171A20] mb-2">문법 교정</h2>
          <div className="space-y-2.5">
            {fb.corrections.map((c, i) => (
              <div key={i} className="bg-white rounded-xl px-4 py-4 shadow-card">
                <div className="flex gap-2 mb-2">
                  <span className="shrink-0 text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">교정</span>
                </div>
                <p className="text-xs text-red-400 line-through mb-1">{c.original}</p>
                <p className="text-xs text-[#006241] font-medium mb-2">→ {c.corrected}</p>
                <p className="text-xs text-[#8E8E8E] leading-relaxed">{c.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Better expressions */}
      <div className="mx-5 mb-4">
        <h2 className="text-sm font-semibold text-[#171A20] mb-2">더 나은 표현</h2>
        <div className="bg-white rounded-xl px-4 py-4 shadow-card space-y-3">
          {fb.expressions.map((e, i) => (
            <div key={i} className={`flex items-center gap-3 ${i < fb.expressions.length - 1 ? 'pb-3 border-b border-gray-50' : ''}`}>
              <span className="text-xs bg-gray-100 text-[#8E8E8E] px-2.5 py-1 rounded-full font-medium">{e.original}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8E8E" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              <span className="text-xs bg-[#d4e9e2] text-[#006241] px-2.5 py-1 rounded-full font-semibold">{e.better}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Overall comment */}
      <div className="mx-5 mb-6 bg-[#1E3932] rounded-xl px-5 py-4">
        <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1.5">AI 코멘트</p>
        <p className="text-white text-sm leading-relaxed">{fb.overall}</p>
      </div>

      {/* Actions */}
      <div className="px-5 space-y-3">
        <button
          onClick={() => navigate('/practice')}
          className="w-full py-4 bg-[#00754A] text-white font-semibold rounded-full shadow-md active:scale-95 transition-transform"
        >
          다른 토픽 연습하기
        </button>
        <button
          onClick={() => navigate('/review')}
          className="w-full py-3.5 border border-[#006241] text-[#006241] font-medium rounded-full active:scale-95 transition-transform"
        >
          오늘의 복습 시작
        </button>
      </div>
    </div>
  )
}
