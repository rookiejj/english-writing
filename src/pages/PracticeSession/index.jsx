import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const DEFAULT_TOPIC = { title: 'Work from Home', level: 'B1', category: '직장·일상' }

const TIPS = [
  'Write at least 3–4 sentences.',
  'Try to use connecting words like "however", "therefore", "in addition".',
  'Give a specific example or personal experience.',
]

export default function PracticeSession() {
  const navigate = useNavigate()
  const location = useLocation()
  const topic = location.state?.topic ?? DEFAULT_TOPIC
  const [answer, setAnswer] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [tipIdx, setTipIdx] = useState(0)

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 5000)
    return () => clearInterval(t)
  }, [])

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const seconds = String(elapsed % 60).padStart(2, '0')

  const handleSubmit = async () => {
    if (wordCount < 10) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    navigate('/practice/result', { state: { topic, answer } })
  }

  const PROMPT = {
    'Work from Home': 'What do you think about working from home? Describe the advantages and disadvantages based on your experience or opinion.',
    'Favorite Season': 'What is your favorite season and why? Describe what you like to do during that season.',
    'Technology in Education': 'How has technology changed the way we learn? Share your thoughts with specific examples.',
  }[topic.title] ?? `Write about "${topic.title}" in 5–8 sentences.`

  return (
    <div className="min-h-full bg-[#f2f0eb] flex flex-col">
      {/* Topic header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            topic.level === 'B2' ? 'bg-orange-100 text-orange-600' :
            topic.level === 'B1' ? 'bg-blue-100 text-blue-600' :
            'bg-green-100 text-green-600'
          }`}>{topic.level}</span>
          <span className="text-xs text-[#8E8E8E]">{topic.category}</span>
        </div>
        <h1 className="text-lg font-bold text-[#171A20]">{topic.title}</h1>
        <div className="flex items-center gap-1 mt-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8E8E8E" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span className="text-xs text-[#8E8E8E] font-mono">{minutes}:{seconds}</span>
        </div>
      </div>

      {/* Prompt */}
      <div className="mx-5 mb-3 bg-white rounded-xl px-5 py-4 shadow-card">
        <p className="text-[10px] text-[#8E8E8E] font-medium uppercase tracking-widest mb-2">오늘의 영작 주제</p>
        <p className="text-sm text-[#171A20] leading-relaxed">{PROMPT}</p>
      </div>

      {/* Rotating tip */}
      <div className="mx-5 mb-3 bg-[#d4e9e2]/40 rounded-xl px-4 py-2.5">
        <p className="text-xs text-[#1E3932]">💡 {TIPS[tipIdx]}</p>
      </div>

      {/* Text area */}
      <div className="mx-5 flex-1 flex flex-col">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Start writing in English here..."
          className="flex-1 min-h-[200px] w-full bg-white rounded-xl px-4 py-4 text-sm text-[#171A20] placeholder-[#8E8E8E] resize-none focus:outline-none focus:ring-2 focus:ring-[#006241]/30 shadow-card leading-relaxed"
          autoFocus
        />
        <div className="flex items-center justify-between mt-2 mb-5">
          <p className={`text-xs ${wordCount >= 30 ? 'text-[#006241] font-medium' : 'text-[#8E8E8E]'}`}>
            {wordCount}단어 {wordCount < 30 ? `· ${30 - wordCount}단어 더 필요` : '· 제출 가능'}
          </p>
          <button
            onClick={handleSubmit}
            disabled={wordCount < 10 || submitting}
            className="px-6 py-2.5 bg-[#00754A] text-white text-sm font-semibold rounded-full disabled:opacity-40 active:scale-95 transition-transform"
          >
            {submitting ? '채점 중…' : '제출 및 채점'}
          </button>
        </div>
      </div>
    </div>
  )
}
