import { useState } from 'react'

const USERS = [
  { id: 1,  nick: 'sunny_lee',    email: 'sunny@test.com',   level: 'B2', streak: 12, sessions: 48, joined: '2025-07-01', status: 'active' },
  { id: 2,  nick: 'kim_english',  email: 'kimen@test.com',   level: 'B1', streak: 5,  sessions: 23, joined: '2025-07-15', status: 'active' },
  { id: 3,  nick: 'park_j',       email: 'parkj@test.com',   level: 'A2', streak: 2,  sessions: 10, joined: '2025-08-01', status: 'active' },
  { id: 4,  nick: 'writer_j',     email: 'writerj@test.com', level: 'B2', streak: 31, sessions: 102,joined: '2025-06-10', status: 'active' },
  { id: 5,  nick: 'daily_writer', email: 'daily@test.com',   level: 'A2', streak: 0,  sessions: 6,  joined: '2025-08-20', status: 'inactive' },
  { id: 6,  nick: 'choi_m',       email: 'choim@test.com',   level: 'B1', streak: 8,  sessions: 31, joined: '2025-07-28', status: 'active' },
  { id: 7,  nick: 'lee_sw',       email: 'leesw@test.com',   level: 'B2', streak: 19, sessions: 67, joined: '2025-07-05', status: 'active' },
  { id: 8,  nick: 'hong_gd',      email: 'honggd@test.com',  level: 'C1', streak: 45, sessions: 198,joined: '2025-05-20', status: 'active' },
]

const LEVEL_COLOR = { A2: 'bg-green-100 text-green-600', B1: 'bg-blue-100 text-blue-600', B2: 'bg-orange-100 text-orange-600', C1: 'bg-red-100 text-red-600' }

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('전체')
  const [status, setStatus] = useState('전체')
  const [sortBy, setSortBy] = useState('sessions')
  const [selected, setSelected] = useState(null)

  const filtered = USERS
    .filter((u) =>
      (level === '전체' || u.level === level) &&
      (status === '전체' || u.status === status) &&
      (u.nick.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => b[sortBy] - a[sortBy])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
          <p className="text-sm text-gray-400 mt-0.5">총 {USERS.length}명 / 활성 {USERS.filter((u) => u.status === 'active').length}명</p>
        </div>
        <button className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-full hover:bg-gray-50">
          CSV 내보내기
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl px-4 py-4 shadow-card border border-gray-100 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="닉네임 / 이메일 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#006241]"
          />
          <div className="flex gap-2">
            {['전체', 'A2', 'B1', 'B2', 'C1'].map((l) => (
              <button key={l} onClick={() => setLevel(l)} className={`px-3 py-1.5 text-xs font-semibold rounded-full ${level === l ? 'bg-[#006241] text-white' : 'bg-gray-100 text-gray-500'}`}>{l}</button>
            ))}
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-xl text-sm bg-gray-50 border border-gray-200 focus:outline-none">
            {['전체', 'active', 'inactive'].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 rounded-xl text-sm bg-gray-50 border border-gray-200 focus:outline-none">
            <option value="sessions">세션 수순</option>
            <option value="streak">스트릭순</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['닉네임', '레벨', '스트릭', '세션', '가입일', '상태', ''].map((h) => (
                <th key={h} className="text-left text-xs text-gray-400 font-medium px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer" onClick={() => setSelected(u)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#006241] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {u.nick[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{u.nick}</p>
                      <p className="text-[10px] text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEVEL_COLOR[u.level]}`}>{u.level}</span></td>
                <td className="px-4 py-3 text-gray-700">{u.streak}일 🔥</td>
                <td className="px-4 py-3 font-medium text-gray-800">{u.sessions}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{u.joined}</td>
                <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{u.status === 'active' ? '활성' : '비활성'}</span></td>
                <td className="px-4 py-3"><button className="text-xs text-[#006241] font-medium hover:underline" onClick={(e) => { e.stopPropagation(); setSelected(u) }}>상세</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-sm text-gray-400">검색 결과 없음</div>}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#006241] flex items-center justify-center text-white text-xl font-bold">{selected.nick[0].toUpperCase()}</div>
              <div>
                <p className="font-bold text-gray-900">{selected.nick}</p>
                <p className="text-xs text-gray-400">{selected.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: '레벨', value: selected.level },
                { label: '스트릭', value: `${selected.streak}일` },
                { label: '총 세션', value: `${selected.sessions}회` },
                { label: '가입일', value: selected.joined },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl px-3 py-3">
                  <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 border border-red-200 text-red-500 text-sm font-medium rounded-full">비활성화</button>
              <button onClick={() => setSelected(null)} className="flex-1 py-2.5 bg-[#006241] text-white text-sm font-semibold rounded-full">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
