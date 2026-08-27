import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useMockProductAuth from '@/stores/mockProductAuthStore'

const PROMPT = 'Describe your typical morning routine. What do you usually do before going to work or school?'

export default function LevelTest() {
  const navigate = useNavigate()
  const { user, login } = useMockProductAuth()
  const [answer, setAnswer] = useState('')
  const [step, setStep] = useState('write') // write | result
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0

  const handleSubmit = async () => {
    if (wordCount < 20) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1400))
    const level = wordCount < 50 ? 'A2' : wordCount < 100 ? 'B1' : 'B2'
    setResult(level)
    if (user) login({ ...user, level })
    setStep('result')
    setLoading(false)
  }

  if (step === 'result') {
    return (
      <div className="min-h-full bg-[#f2f0eb] flex flex-col items-center justify-center px-6 py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-[#171A20] mb-1">레벨 테스트 완료!</h2>
        <p className="text-sm text-[#8E8E8E] mb-8">측정된 영작 레벨</p>

        <div className="w-32 h-32 rounded-full bg-[#006241] flex items-center justify-center mb-8 shadow-xl">
          <span className="text-white text-4xl font-bold">{result}</span>
        </div>

        <div className="w-full max-w-xs bg-white rounded-xl px-5 py-4 mb-8 shadow-card">
          <p className="text-xs font-semibold text-[#8E8E8E] uppercase tracking-widest mb-3">레벨 설명</p>
          {result === 'A2' && <p className="text-sm text-[#171A20]">기초 표현과 일상 문장을 작성할 수 있습니다. 간단한 토픽부터 시작해볼게요.</p>}
          {result === 'B1' && <p className="text-sm text-[#171A20]">친숙한 주제에 대해 연결된 문장으로 의견을 표현할 수 있습니다.</p>}
          {result === 'B2' && <p className="text-sm text-[#171A20]">복잡한 주제에 대해 명확하고 상세한 글을 쓸 수 있습니다.</p>}
        </div>

        <button
          onClick={() => navigate('/home')}
          className="w-full max-w-xs py-4 bg-[#00754A] text-white font-semibold rounded-full shadow-md active:scale-95 transition-transform"
        >
          홈으로 이동
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#f2f0eb] flex flex-col">
      {/* Progress */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-[#006241] uppercase tracking-widest">레벨 테스트</p>
          <p className="text-xs text-[#8E8E8E]">1 / 1</p>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#006241] rounded-full" style={{ width: loading ? '100%' : answer ? '60%' : '10%', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Prompt card */}
      <div className="mx-5 mt-3 mb-4 bg-white rounded-xl px-5 py-5 shadow-card">
        <p className="text-[10px] text-[#8E8E8E] font-medium uppercase tracking-widest mb-2">Writing Prompt</p>
        <p className="text-sm text-[#171A20] leading-relaxed">{PROMPT}</p>
      </div>

      {/* Tips */}
      <div className="mx-5 mb-4 bg-[#d4e9e2]/40 rounded-xl px-4 py-3">
        <p className="text-xs text-[#1E3932]">✏️ 최소 20단어 이상 작성해주세요. 맞춤법보다 자연스러운 표현에 집중하세요.</p>
      </div>

      {/* Textarea */}
      <div className="mx-5 flex-1 flex flex-col">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="여기에 영어로 작성해주세요..."
          className="flex-1 min-h-[200px] w-full bg-white rounded-xl px-4 py-4 text-sm text-[#171A20] placeholder-[#8E8E8E] resize-none focus:outline-none focus:ring-2 focus:ring-[#006241]/30 shadow-card leading-relaxed"
        />
        <div className="flex items-center justify-between mt-2 mb-5">
          <p className={`text-xs ${wordCount >= 20 ? 'text-[#006241] font-medium' : 'text-[#8E8E8E]'}`}>
            {wordCount} / 20 단어 이상
          </p>
          <button
            onClick={handleSubmit}
            disabled={wordCount < 20 || loading}
            className="px-6 py-2.5 bg-[#00754A] text-white text-sm font-semibold rounded-full disabled:opacity-40 active:scale-95 transition-transform"
          >
            {loading ? '분석 중…' : '제출하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
