import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const LEVELS = ['전체', 'A2', 'B1', 'B2', 'C1']
const CATEGORIES = ['전체', '일상', '직장·일상', '교육·사회', '환경·이슈', '여행·문화']

const TOPICS = [
  { id: 1,  title: 'My Morning Routine',         level: 'A2', category: '일상',      done: true,  score: 78 },
  { id: 2,  title: 'Work from Home',             level: 'B1', category: '직장·일상', done: true,  score: 82 },
  { id: 3,  title: 'Favorite Season',            level: 'A2', category: '일상',      done: false, score: null },
  { id: 4,  title: 'Technology in Education',    level: 'B2', category: '교육·사회', done: false, score: null },
  { id: 5,  title: 'Environmental Issues',       level: 'B2', category: '환경·이슈', done: false, score: null },
  { id: 6,  title: 'Weekend Plans',              level: 'A2', category: '일상',      done: true,  score: 91 },
  { id: 7,  title: 'Remote Work Benefits',       level: 'B1', category: '직장·일상', done: false, score: null },
  { id: 8,  title: 'Healthy Eating Habits',      level: 'B1', category: '일상',      done: true,  score: 75 },
  { id: 9,  title: 'AI in Daily Life',           level: 'B2', category: '교육·사회', done: false, score: null },
  { id: 10, title: 'Travel to a Dream Country',  level: 'B1', category: '여행·문화', done: false, score: null },
  { id: 11, title: 'Cultural Differences',       level: 'B2', category: '여행·문화', done: false, score: null },
  { id: 12, title: 'Social Media Impact',        level: 'C1', category: '교육·사회', done: false, score: null },
]

const LEVEL_COLOR = {
  A2: 'bg-green-100 text-green-600',
  B1: 'bg-blue-100 text-blue-600',
  B2: 'bg-orange-100 text-orange-600',
  C1: 'bg-red-100 text-red-600',
}

export default function Practice() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('전체')
  const [selectedCat, setSelectedCat] = useState('전체')

  const filtered = TOPICS.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchLevel = selectedLevel === '전체' || t.level === selectedLevel
    const matchCat = selectedCat === '전체' || t.category === selectedCat
    return matchSearch && matchLevel && matchCat
  })

  const doneCount = TOPICS.filter((t) => t.done).length

  return (
    <div className="bg-[#f2f0eb] min-h-full">
      {/* Sticky search + filter */}
      <div className="sticky top-0 z-10 bg-[#f2f0eb] pt-4 pb-2 px-5 shadow-card">
        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E8E]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="토픽 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-100 text-sm text-[#171A20] placeholder-[#8E8E8E] focus:outline-none focus:border-[#006241] shadow-card"
          />
        </div>

        {/* Level filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setSelectedLevel(l)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedLevel === l ? 'bg-[#006241] text-white' : 'bg-white text-[#8E8E8E] border border-gray-200'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCat === c ? 'bg-[#1E3932] text-white' : 'bg-white text-[#8E8E8E] border border-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Progress summary */}
      <div className="px-5 pt-3 pb-2">
        <p className="text-xs text-[#8E8E8E]">총 {TOPICS.length}개 토픽 중 <span className="text-[#006241] font-semibold">{doneCount}개 완료</span></p>
      </div>

      {/* Topic list */}
      <div className="px-5 pb-4 space-y-2.5">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-[#8E8E8E]">검색 결과가 없습니다</div>
        )}
        {filtered.map((t) => (
          <button
            key={t.id}
            onClick={() => navigate('/practice/session', { state: { topic: t } })}
            className="w-full bg-white rounded-xl px-4 py-4 flex items-center gap-4 shadow-card active:scale-[0.98] transition-transform"
          >
            {/* Done indicator */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              t.done ? 'bg-[#d4e9e2]' : 'bg-gray-100'
            }`}>
              {t.done
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006241" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              }
            </div>

            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-[#171A20] truncate">{t.title}</p>
              <p className="text-xs text-[#8E8E8E] mt-0.5">{t.category}</p>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LEVEL_COLOR[t.level]}`}>{t.level}</span>
              {t.done && t.score !== null && (
                <span className="text-xs font-bold text-[#006241]">{t.score}점</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
