import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CARDS = [
  {
    id: 1,
    prompt: '다음 문장에서 틀린 부분을 찾아 교정하세요:',
    sentence: '"I think working from home are very benefit for employees."',
    answer: 'I think working from home is very beneficial for employees.',
    hint: '"are" → "is" (주어가 단수), "benefit" → "beneficial" (형용사형)',
    type: 'correct',
  },
  {
    id: 2,
    prompt: '밑줄 친 표현을 더 자연스러운 영어로 바꾸세요:',
    sentence: '"This is very important for our daily life."',
    answer: '"This is crucial / essential for our daily lives."',
    hint: '"very important" → "crucial" 또는 "essential" 이 더 자연스럽습니다.',
    type: 'rephrase',
  },
  {
    id: 3,
    prompt: '빈칸에 알맞은 전치사를 넣으세요:',
    sentence: '"___ the other hand, there are some disadvantages."',
    answer: 'On the other hand',
    hint: '"on the other hand" — "반면에"라는 뜻의 고정 표현입니다.',
    type: 'fill',
  },
]

const DIFFICULTY = ['다시', '어려움', '보통', '쉬움']
const DIFFICULTY_COLOR = ['bg-red-100 text-red-600', 'bg-orange-100 text-orange-600', 'bg-blue-100 text-blue-600', 'bg-green-100 text-green-600']

export default function SRSReview() {
  const navigate = useNavigate()
  const [cardIdx, setCardIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [finished, setFinished] = useState(false)
  const [results, setResults] = useState([])

  const card = CARDS[cardIdx]
  const progress = ((cardIdx) / CARDS.length) * 100

  const handleReveal = () => setRevealed(true)

  const handleRate = (rating) => {
    setResults((r) => [...r, { id: card.id, rating }])
    if (cardIdx + 1 >= CARDS.length) {
      setFinished(true)
    } else {
      setCardIdx((i) => i + 1)
      setRevealed(false)
      setUserInput('')
    }
  }

  if (finished) {
    const easy = results.filter((r) => r.rating >= 2).length
    return (
      <div className="min-h-full bg-[#f2f0eb] flex flex-col items-center justify-center px-6 py-12">
        <div className="text-5xl mb-4">🎯</div>
        <h2 className="text-xl font-bold text-[#171A20] mb-1">복습 완료!</h2>
        <p className="text-sm text-[#8E8E8E] mb-8">{CARDS.length}개 카드 중 <span className="text-[#006241] font-semibold">{easy}개 정확</span>히 기억했어요</p>

        <div className="w-full max-w-xs bg-white rounded-xl px-5 py-4 mb-8 shadow-card space-y-2">
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-xs text-[#8E8E8E]">카드 {i + 1}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_COLOR[r.rating]}`}>{DIFFICULTY[r.rating]}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/review')}
          className="w-full max-w-xs py-4 bg-[#00754A] text-white font-semibold rounded-full shadow-md active:scale-95 transition-transform"
        >
          복습 목록으로
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#f2f0eb] flex flex-col">
      {/* Progress */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-[#006241]">{cardIdx + 1} / {CARDS.length}</p>
          <p className="text-xs text-[#8E8E8E]">{CARDS[cardIdx].type === 'correct' ? '교정' : CARDS[cardIdx].type === 'rephrase' ? '표현 개선' : '빈칸 채우기'}</p>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#006241] rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Card */}
      <div className="mx-5 flex-1">
        <div className="bg-white rounded-xl shadow-card px-5 py-6 mb-4">
          <p className="text-xs text-[#8E8E8E] mb-3">{card.prompt}</p>
          <p className="text-sm text-[#171A20] leading-relaxed font-medium italic mb-4">{card.sentence}</p>

          {!revealed && (
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="내 답을 먼저 작성해보세요..."
              className="w-full min-h-[80px] bg-[#f2f0eb] rounded-xl px-4 py-3 text-sm text-[#171A20] placeholder-[#8E8E8E] resize-none focus:outline-none focus:ring-2 focus:ring-[#006241]/30"
            />
          )}
        </div>

        {!revealed ? (
          <button
            onClick={handleReveal}
            className="w-full py-4 bg-[#00754A] text-white font-semibold rounded-full shadow-md active:scale-95 transition-transform"
          >
            정답 확인
          </button>
        ) : (
          <div>
            {/* Answer */}
            <div className="bg-[#d4e9e2] rounded-xl px-5 py-4 mb-3">
              <p className="text-xs text-[#006241] font-medium uppercase tracking-widest mb-1.5">정답</p>
              <p className="text-sm text-[#1E3932] font-semibold leading-relaxed">{card.answer}</p>
            </div>
            <div className="bg-white rounded-xl px-5 py-3 mb-4 shadow-card">
              <p className="text-xs text-[#8E8E8E]">💡 {card.hint}</p>
            </div>

            {/* Self-rating */}
            <p className="text-xs text-[#8E8E8E] text-center mb-3">얼마나 잘 기억했나요?</p>
            <div className="grid grid-cols-4 gap-2">
              {DIFFICULTY.map((d, i) => (
                <button
                  key={d}
                  onClick={() => handleRate(i)}
                  className={`py-3 rounded-xl text-xs font-bold active:scale-95 transition-transform ${DIFFICULTY_COLOR[i]}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
