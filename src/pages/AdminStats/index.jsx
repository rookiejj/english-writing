const MONTHLY = [
  { month: '3월', sessions: 1240, users: 89 },
  { month: '4월', sessions: 1680, users: 124 },
  { month: '5월', sessions: 2100, users: 167 },
  { month: '6월', sessions: 1950, users: 198 },
  { month: '7월', sessions: 2450, users: 231 },
  { month: '8월', sessions: 2810, users: 264 },
]

const TOPIC_STATS = [
  { title: 'Work from Home',         sessions: 142, avgScore: 79, level: 'B1' },
  { title: 'Healthy Eating Habits',  sessions: 115, avgScore: 74, level: 'B1' },
  { title: 'My Morning Routine',     sessions: 89,  avgScore: 81, level: 'A2' },
  { title: 'Remote Work Benefits',   sessions: 98,  avgScore: 77, level: 'B1' },
  { title: 'AI in Daily Life',       sessions: 71,  avgScore: 72, level: 'B2' },
]

const LEVEL_DIST = [
  { level: 'A2', count: 74,  color: 'bg-green-400' },
  { level: 'B1', count: 119, color: 'bg-blue-400' },
  { level: 'B2', count: 58,  color: 'bg-orange-400' },
  { level: 'C1', count: 13,  color: 'bg-red-400' },
]

const maxMonth = Math.max(...MONTHLY.map((m) => m.sessions))
const maxLevel = Math.max(...LEVEL_DIST.map((l) => l.count))

export default function AdminStats() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">통계·리포트</h1>
        <p className="text-sm text-gray-400 mt-0.5">2025년 3월 ~ 8월</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: '총 사용자', value: '264', sub: '이번 달 +33명' },
          { label: '총 세션',   value: '12,230', sub: '이번 달 +360' },
          { label: '평균 점수', value: '77.4', sub: '전월 대비 +1.2' },
          { label: '완료율',    value: '68%',  sub: '세션 완료 기준' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl px-4 py-4 shadow-card border border-gray-100">
            <p className="text-xs text-gray-400 font-medium mb-1.5">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-green-600 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly sessions bar chart */}
      <div className="bg-white rounded-xl px-5 py-5 shadow-card border border-gray-100 mb-4">
        <p className="text-sm font-semibold text-gray-800 mb-4">월별 세션 수</p>
        <div className="flex items-end gap-4 h-36">
          {MONTHLY.map(({ month, sessions }) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-[#006241]">{sessions.toLocaleString()}</span>
              <div className="w-full rounded-t bg-[#006241] opacity-80 transition-all" style={{ height: `${(sessions / maxMonth) * 100}%` }} />
              <span className="text-xs text-gray-400">{month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Level distribution + Top topics */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        {/* Level distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl px-5 py-5 shadow-card border border-gray-100">
          <p className="text-sm font-semibold text-gray-800 mb-4">레벨별 사용자 수</p>
          <div className="space-y-3">
            {LEVEL_DIST.map(({ level, count, color }) => (
              <div key={level}>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span className="font-medium">{level}</span>
                  <span className="font-bold text-gray-700">{count}명</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${(count / maxLevel) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top topics */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-800">인기 토픽 TOP 5</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['토픽', '레벨', '세션', '평균 점수'].map((h) => (
                  <th key={h} className="text-left text-xs text-gray-400 font-medium px-4 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOPIC_STATS.map((t, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-xs font-medium text-gray-700">{t.title}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      t.level === 'B2' ? 'bg-orange-100 text-orange-600' : t.level === 'B1' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}>{t.level}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{t.sessions}</td>
                  <td className="px-4 py-3 font-bold text-xs text-[#006241]">{t.avgScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score distribution */}
      <div className="bg-white rounded-xl px-5 py-5 shadow-card border border-gray-100">
        <p className="text-sm font-semibold text-gray-800 mb-4">점수 분포</p>
        <div className="flex items-end gap-3 h-24">
          {[
            { range: '0-49',   pct: 8  },
            { range: '50-59',  pct: 14 },
            { range: '60-69',  pct: 21 },
            { range: '70-79',  pct: 30 },
            { range: '80-89',  pct: 20 },
            { range: '90-100', pct: 7  },
          ].map(({ range, pct }) => (
            <div key={range} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-semibold text-gray-500">{pct}%</span>
              <div className="w-full rounded-t bg-[#1E3932] opacity-75" style={{ height: `${pct * 3}px` }} />
              <span className="text-[9px] text-gray-400">{range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
