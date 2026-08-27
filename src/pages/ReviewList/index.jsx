import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DUE_TODAY = 12
const DONE_TODAY = 4

const HISTORY = [
  { id: 1,  expression: 'work from home',         correction: 'remote work / telecommute',      date: '오늘',   status: 'due' },
  { id: 2,  expression: 'very good',               correction: 'excellent / outstanding',        date: '오늘',   status: 'due' },
  { id: 3,  expression: 'I think it are ...',      correction: 'I think it is ...',              date: '오늘',   status: 'due' },
  { id: 4,  expression: 'many advantage',          correction: 'many advantages',                date: '2일 후', status: 'upcoming' },
  { id: 5,  expression: 'in the other hand',       correction: 'on the other hand',              date: '2일 후', status: 'upcoming' },
  { id: 6,  expression: 'very important',          correction: 'crucial / essential',            date: '4일 후', status: 'upcoming' },
  { id: 7,  expression: 'make me feel comfortable', correction: 'make me feel at ease',           date: '어제 완료', status: 'done' },
  { id: 8,  expression: 'its have',                correction: 'it has',                         date: '어제 완료', status: 'done' },
]

const STATUS_TABS = ['전체', '오늘 복습', '예정', '완료']

export default function ReviewList() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('전체')

  const filtered = HISTORY.filter((h) => {
    if (tab === '전체') return true
    if (tab === '오늘 복습') return h.status === 'due'
    if (tab === '예정') return h.status === 'upcoming'
    if (tab === '완료') return h.status === 'done'
    return true
  })

  return (
    <div className="bg-[#f2f0eb] min-h-full">
      {/* Header summary */}
      <div className="px-5 pt-5 pb-3">
        <p className="text-xs text-[#8E8E8E] uppercase tracking-widest font-medium mb-1">SRS 복습</p>
        <h1 className="text-2xl font-bold text-[#171A20] mb-4">오늘의 복습</h1>

        {/* Progress ring-style card */}
        <div className="bg-[#006241] rounded-xl px-5 py-4 flex items-center justify-between shadow-md">
          <div>
            <p className="text-white/70 text-xs">오늘 남은 복습</p>
            <p className="text-white text-3xl font-bold mt-0.5">{DUE_TODAY - DONE_TODAY}개</p>
            <p className="text-white/60 text-xs mt-1">{DONE_TODAY}개 완료 · 전체 {DUE_TODAY}개</p>
          </div>
          <button
            onClick={() => navigate('/review/srs')}
            className="px-5 py-3 bg-white text-[#006241] text-sm font-bold rounded-full active:scale-95 transition-transform shadow-card"
          >
            복습 시작
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mx-5 mb-4">
        <div className="h-1.5 bg-white rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-[#00754A] rounded-full transition-all"
            style={{ width: `${(DONE_TODAY / DUE_TODAY) * 100}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-[#f2f0eb] px-5 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              tab === t ? 'bg-[#006241] text-white' : 'bg-white text-[#8E8E8E] border border-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="px-5 pb-4 space-y-2.5 mt-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl px-4 py-4 shadow-card border-l-4 ${
              item.status === 'due' ? 'border-[#006241]' :
              item.status === 'upcoming' ? 'border-gray-200' : 'border-gray-100'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-400 line-through truncate">{item.expression}</p>
                <p className="text-sm font-semibold text-[#006241] mt-0.5 truncate">{item.correction}</p>
              </div>
              <div className="ml-3 shrink-0">
                {item.status === 'due' && (
                  <span className="text-[10px] bg-[#d4e9e2] text-[#006241] px-2 py-0.5 rounded-full font-semibold">오늘</span>
                )}
                {item.status === 'upcoming' && (
                  <span className="text-[10px] bg-gray-100 text-[#8E8E8E] px-2 py-0.5 rounded-full">{item.date}</span>
                )}
                {item.status === 'done' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#006241" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
