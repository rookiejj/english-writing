import { useState } from 'react'

const DIMENSIONS = [
  {
    key: 'grammar', label: '문법 (Grammar)', weight: 30,
    desc: '문장 구조, 시제, 일치, 전치사 사용의 정확성',
    rubric: [
      { score: '90-100', desc: '거의 오류 없음, 복잡한 구조 사용' },
      { score: '70-89',  desc: '소수 오류, 의미 전달에 지장 없음' },
      { score: '50-69',  desc: '반복적 오류, 가끔 의미 불명확' },
      { score: '0-49',   desc: '심각한 오류, 이해 어려움' },
    ],
  },
  {
    key: 'vocabulary', label: '어휘 (Vocabulary)', weight: 25,
    desc: '어휘 다양성, 적절한 어휘 선택, 자연스러운 표현',
    rubric: [
      { score: '90-100', desc: '풍부하고 다양한 어휘, 고급 표현 사용' },
      { score: '70-89',  desc: '적절한 어휘, 일부 반복' },
      { score: '50-69',  desc: '기본 어휘 위주, 표현 범위 좁음' },
      { score: '0-49',   desc: '매우 제한적 어휘, 오용 많음' },
    ],
  },
  {
    key: 'fluency', label: '유창성 (Fluency)', weight: 25,
    desc: '문장 간 자연스러운 흐름, 표현의 자연스러움',
    rubric: [
      { score: '90-100', desc: '자연스럽고 유창한 표현' },
      { score: '70-89',  desc: '대체로 자연스러움, 소수 어색한 표현' },
      { score: '50-69',  desc: '직역 투가 느껴짐, 어색한 구조' },
      { score: '0-49',   desc: '매우 어색함, 직역 수준' },
    ],
  },
  {
    key: 'coherence', label: '일관성 (Coherence)', weight: 20,
    desc: '논리적 흐름, 연결어 사용, 주제 일관성',
    rubric: [
      { score: '90-100', desc: '뛰어난 구성, 다양한 연결어 사용' },
      { score: '70-89',  desc: '전반적으로 논리적, 일부 구성 미흡' },
      { score: '50-69',  desc: '구성이 산만하거나 연결 부족' },
      { score: '0-49',   desc: '흐름 없음, 주제 이탈' },
    ],
  },
]

export default function AdminScoring() {
  const [expanded, setExpanded] = useState('grammar')
  const [weights, setWeights] = useState({ grammar: 30, vocabulary: 25, fluency: 25, coherence: 20 })
  const [saved, setSaved] = useState(false)

  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  const isValid = total === 100

  const handleWeightChange = (key, val) => {
    setWeights((w) => ({ ...w, [key]: Number(val) }))
  }

  const handleSave = () => {
    if (!isValid) return
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">채점 로직</h1>
        <p className="text-sm text-gray-400 mt-0.5">AI 채점 기준 및 가중치 설정</p>
      </div>

      {/* Weight summary */}
      <div className="bg-white rounded-xl px-5 py-4 shadow-card border border-gray-100 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-800">가중치 배분</p>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isValid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
            합계 {total} / 100
          </span>
        </div>
        <div className="space-y-2">
          {DIMENSIONS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-40 text-xs text-gray-600 truncate">{label}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#006241] rounded-full transition-all" style={{ width: `${weights[key]}%` }} />
              </div>
              <input
                type="number"
                min={0} max={100}
                value={weights[key]}
                onChange={(e) => handleWeightChange(key, e.target.value)}
                className="w-16 text-center text-sm font-bold text-[#006241] bg-[#d4e9e2] rounded-lg px-2 py-1 border-none focus:outline-none"
              />
              <span className="text-xs text-gray-400">%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rubric accordion */}
      <div className="space-y-3 mb-6">
        {DIMENSIONS.map(({ key, label, desc, rubric }) => (
          <div key={key} className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === key ? null : key)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"
                className={`transition-transform ${expanded === key ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {expanded === key && (
              <div className="border-t border-gray-50">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left text-xs text-gray-400 font-medium px-5 py-2 w-28">점수 범위</th>
                      <th className="text-left text-xs text-gray-400 font-medium px-5 py-2">기준</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rubric.map(({ score, desc: rdesc }, i) => (
                      <tr key={i} className="border-t border-gray-50">
                        <td className="px-5 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            i === 0 ? 'bg-green-100 text-green-600' :
                            i === 1 ? 'bg-blue-100 text-blue-600' :
                            i === 2 ? 'bg-orange-100 text-orange-500' :
                            'bg-red-100 text-red-500'
                          }`}>{score}</span>
                        </td>
                        <td className="px-5 py-3 text-gray-600 text-xs">{rdesc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Prompt config (simplified) */}
      <div className="bg-white rounded-xl px-5 py-4 shadow-card border border-gray-100 mb-6">
        <p className="text-sm font-semibold text-gray-800 mb-3">AI 채점 프롬프트</p>
        <textarea
          defaultValue="You are an English writing evaluator. Evaluate the following text on grammar, vocabulary, fluency, and coherence. Return a JSON with scores for each dimension (0-100) and corrections."
          className="w-full h-24 text-xs text-gray-600 bg-gray-50 rounded-xl px-4 py-3 resize-none border border-gray-200 focus:outline-none focus:border-[#006241]"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!isValid}
        className="w-full py-4 bg-[#006241] text-white font-semibold rounded-full shadow-md disabled:opacity-40 active:scale-95 transition-transform"
      >
        {saved ? '저장되었습니다 ✓' : '변경사항 저장'}
      </button>
    </div>
  )
}
