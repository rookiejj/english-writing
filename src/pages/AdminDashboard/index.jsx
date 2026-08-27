const STATS = [
  { label: '오늘 활성 사용자', value: '142', delta: '+12%', up: true },
  { label: '오늘 세션 수',    value: '389', delta: '+8%',  up: true },
  { label: '채점 처리',       value: '1,204', delta: '+5%', up: true },
  { label: '신규 가입',       value: '23',  delta: '-3%',  up: false },
]

const RECENT_SESSIONS = [
  { user: 'sunny_lee', level: 'B2', topic: 'Work from Home',      score: 88, time: '2분 전' },
  { user: 'kim_e',     level: 'B1', topic: 'Healthy Eating',       score: 74, time: '5분 전' },
  { user: 'park_j',   level: 'A2', topic: 'Favorite Season',      score: 65, time: '11분 전' },
  { user: 'lee_sw',   level: 'B2', topic: 'AI in Daily Life',     score: 91, time: '18분 전' },
  { user: 'choi_m',   level: 'B1', topic: 'Travel Plans',         score: 79, time: '25분 전' },
]

const SCORE_COLOR = (s) => s >= 85 ? 'text-green-600' : s >= 70 ? 'text-blue-600' : 'text-orange-500'

export default function AdminDashboard() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-sm text-gray-500 mt-0.5">2025년 8월 27일</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map(({ label, value, delta, up }) => (
          <div key={label} className="bg-white rounded-xl px-4 py-4 shadow-card border border-gray-100">
            <p className="text-xs text-gray-400 font-medium mb-2">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className={`text-xs font-semibold mt-1 ${up ? 'text-green-600' : 'text-red-500'}`}>
              {delta} vs 어제
            </p>
          </div>
        ))}
      </div>

      {/* Charts placeholder + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {/* Weekly sessions chart (placeholder) */}
        <div className="lg:col-span-3 bg-white rounded-xl px-5 py-5 shadow-card border border-gray-100">
          <p className="text-sm font-semibold text-gray-800 mb-4">주간 세션 수</p>
          <div className="flex items-end gap-3 h-28">
            {[65, 80, 72, 95, 88, 110, 102].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-[#006241] opacity-80"
                  style={{ height: `${(v / 110) * 100}%` }}
                />
                <span className="text-[10px] text-gray-400">
                  {['월', '화', '수', '목', '금', '토', '일'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Level distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl px-5 py-5 shadow-card border border-gray-100">
          <p className="text-sm font-semibold text-gray-800 mb-4">레벨 분포</p>
          <div className="space-y-2.5">
            {[
              { level: 'A2', pct: 28, color: 'bg-green-400' },
              { level: 'B1', pct: 45, color: 'bg-blue-400' },
              { level: 'B2', pct: 22, color: 'bg-orange-400' },
              { level: 'C1', pct: 5,  color: 'bg-red-400' },
            ].map(({ level, pct, color }) => (
              <div key={level}>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{level}</span><span>{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent sessions */}
      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-sm font-semibold text-gray-800">최근 채점 세션</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['사용자', '레벨', '토픽', '점수', '시간'].map((h) => (
                <th key={h} className="text-left text-xs text-gray-400 font-medium px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_SESSIONS.map((s, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-800">{s.user}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    s.level === 'B2' ? 'bg-orange-100 text-orange-600' :
                    s.level === 'B1' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>{s.level}</span>
                </td>
                <td className="px-5 py-3 text-gray-600">{s.topic}</td>
                <td className={`px-5 py-3 font-bold ${SCORE_COLOR(s.score)}`}>{s.score}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">{s.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
