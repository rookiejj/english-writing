import { useState } from 'react'

const LEVELS = ['전체', 'A2', 'B1', 'B2', 'C1']
const CATEGORIES_ALL = ['전체', '일상', '직장·일상', '교육·사회', '환경·이슈', '여행·문화']

const INITIAL_QUESTIONS = [
  { id: 1,  title: 'My Morning Routine',         level: 'A2', category: '일상',       active: true,  sessions: 89  },
  { id: 2,  title: 'Work from Home',             level: 'B1', category: '직장·일상',  active: true,  sessions: 142 },
  { id: 3,  title: 'Favorite Season',            level: 'A2', category: '일상',       active: true,  sessions: 63  },
  { id: 4,  title: 'Technology in Education',    level: 'B2', category: '교육·사회',  active: true,  sessions: 54  },
  { id: 5,  title: 'Environmental Issues',       level: 'B2', category: '환경·이슈',  active: false, sessions: 37  },
  { id: 6,  title: 'Remote Work Benefits',       level: 'B1', category: '직장·일상',  active: true,  sessions: 98  },
  { id: 7,  title: 'Healthy Eating Habits',      level: 'B1', category: '일상',       active: true,  sessions: 115 },
  { id: 8,  title: 'AI in Daily Life',           level: 'B2', category: '교육·사회',  active: true,  sessions: 71  },
  { id: 9,  title: 'Travel to a Dream Country',  level: 'B1', category: '여행·문화',  active: true,  sessions: 58  },
  { id: 10, title: 'Cultural Differences',       level: 'B2', category: '여행·문화',  active: false, sessions: 29  },
  { id: 11, title: 'Social Media Impact',        level: 'C1', category: '교육·사회',  active: true,  sessions: 41  },
]

const LEVEL_COLOR = { A2: 'bg-green-100 text-green-600', B1: 'bg-blue-100 text-blue-600', B2: 'bg-orange-100 text-orange-600', C1: 'bg-red-100 text-red-600' }

export default function AdminQuestions() {
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS)
  const [level, setLevel] = useState('전체')
  const [category, setCategory] = useState('전체')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newLevel, setNewLevel] = useState('B1')
  const [newCat, setNewCat] = useState('일상')

  const filtered = questions.filter((q) => {
    return (level === '전체' || q.level === level) &&
      (category === '전체' || q.category === category) &&
      q.title.toLowerCase().includes(search.toLowerCase())
  })

  const toggleActive = (id) => {
    setQuestions((qs) => qs.map((q) => q.id === id ? { ...q, active: !q.active } : q))
  }

  const addQuestion = () => {
    if (!newTitle.trim()) return
    setQuestions((qs) => [...qs, { id: Date.now(), title: newTitle, level: newLevel, category: newCat, active: true, sessions: 0 }])
    setNewTitle(''); setShowModal(false)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">문제 관리</h1>
          <p className="text-sm text-gray-400 mt-0.5">총 {questions.length}개 토픽 / 활성 {questions.filter((q) => q.active).length}개</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#006241] text-white text-sm font-semibold rounded-full active:scale-95 transition-transform"
        >
          + 새 토픽
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl px-4 py-4 shadow-card border border-gray-100 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="토픽 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#006241]"
          />
          <div className="flex gap-2">
            {LEVELS.map((l) => (
              <button key={l} onClick={() => setLevel(l)} className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${level === l ? 'bg-[#006241] text-white' : 'bg-gray-100 text-gray-500'}`}>{l}</button>
            ))}
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#006241] text-gray-700"
          >
            {CATEGORIES_ALL.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['토픽', '레벨', '카테고리', '세션 수', '상태', ''].map((h) => (
                <th key={h} className="text-left text-xs text-gray-400 font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((q) => (
              <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{q.title}</td>
                <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEVEL_COLOR[q.level]}`}>{q.level}</span></td>
                <td className="px-4 py-3 text-gray-500 text-xs">{q.category}</td>
                <td className="px-4 py-3 text-gray-600">{q.sessions}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(q.id)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${q.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {q.active ? '활성' : '비활성'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button className="text-xs text-[#006241] font-medium hover:underline">편집</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">검색 결과가 없습니다</div>
        )}
      </div>

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">새 토픽 추가</h2>
            <div className="space-y-3 mb-6">
              <input
                type="text"
                placeholder="영어 토픽 제목 (예: Climate Change)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#006241]"
              />
              <div className="flex gap-3">
                <select value={newLevel} onChange={(e) => setNewLevel(e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none">
                  {['A2', 'B1', 'B2', 'C1'].map((l) => <option key={l}>{l}</option>)}
                </select>
                <select value={newCat} onChange={(e) => setNewCat(e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none">
                  {['일상', '직장·일상', '교육·사회', '환경·이슈', '여행·문화'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-full">취소</button>
              <button onClick={addQuestion} className="flex-1 py-3 bg-[#006241] text-white text-sm font-semibold rounded-full">추가</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
