import { useState } from 'react'

const TAGS = ['전체', '문법', '표현 개선', '어휘', '전치사']

const ITEMS = [
  { id: 1, tag: '표현 개선', original: 'very good',              better: 'excellent / outstanding',           date: '2025-08-20', topic: 'Work from Home' },
  { id: 2, tag: '문법',     original: 'I think it are correct', better: 'I think it is correct',             date: '2025-08-19', topic: 'Healthy Eating' },
  { id: 3, tag: '어휘',     original: 'important',               better: 'crucial / essential / significant', date: '2025-08-18', topic: 'Technology' },
  { id: 4, tag: '전치사',   original: 'in the other hand',       better: 'on the other hand',                 date: '2025-08-17', topic: 'Work from Home' },
  { id: 5, tag: '표현 개선', original: 'make me feel good',      better: 'make me feel at ease / uplifted',   date: '2025-08-16', topic: 'Favorite Season' },
  { id: 6, tag: '문법',     original: 'many advantage',          better: 'many advantages',                   date: '2025-08-15', topic: 'Daily Routine' },
  { id: 7, tag: '어휘',     original: 'bad for health',          better: 'detrimental to health',             date: '2025-08-14', topic: 'Healthy Eating' },
  { id: 8, tag: '전치사',   original: 'interested about',        better: 'interested in',                     date: '2025-08-13', topic: 'Community' },
]

const TAG_COLOR = {
  문법:     'bg-blue-100 text-blue-600',
  '표현 개선': 'bg-purple-100 text-purple-600',
  어휘:     'bg-orange-100 text-orange-600',
  전치사:   'bg-green-100 text-green-600',
}

export default function Bookmarks() {
  const [search, setSearch] = useState('')
  const [tag, setTag] = useState('전체')
  const [removed, setRemoved] = useState({})

  const filtered = ITEMS.filter((item) => {
    if (removed[item.id]) return false
    const matchTag = tag === '전체' || item.tag === tag
    const matchSearch = item.original.toLowerCase().includes(search.toLowerCase()) ||
      item.better.toLowerCase().includes(search.toLowerCase())
    return matchTag && matchSearch
  })

  return (
    <div className="bg-[#f2f0eb] min-h-full">
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 bg-[#f2f0eb] pt-4 pb-2 px-5">
        <h1 className="text-xl font-bold text-[#171A20] mb-3">북마크</h1>

        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E8E]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="표현 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-100 text-sm text-[#171A20] placeholder-[#8E8E8E] focus:outline-none focus:border-[#006241] shadow-card"
          />
        </div>

        {/* Tags */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                tag === t ? 'bg-[#006241] text-white' : 'bg-white text-[#8E8E8E] border border-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="px-5 pt-3 pb-1">
        <p className="text-xs text-[#8E8E8E]"><span className="text-[#006241] font-semibold">{filtered.length}개</span> 표현 저장됨</p>
      </div>

      {/* List */}
      <div className="px-5 pb-4 space-y-2.5 mt-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-[#8E8E8E]">저장된 표현이 없습니다</div>
        )}
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-xl px-4 py-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLOR[item.tag] ?? 'bg-gray-100 text-gray-500'}`}>{item.tag}</span>
                  <span className="text-[10px] text-[#8E8E8E]">{item.topic}</span>
                </div>
                <p className="text-xs text-red-400 line-through mb-1 leading-relaxed">{item.original}</p>
                <p className="text-sm font-semibold text-[#006241] leading-relaxed">{item.better}</p>
              </div>
              <button
                onClick={() => setRemoved((r) => ({ ...r, [item.id]: true }))}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 active:scale-95 transition-transform"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </button>
            </div>
            <p className="text-[10px] text-[#8E8E8E] mt-2">{item.date}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
