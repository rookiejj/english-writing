import { useEffect, useState, useMemo } from 'react'

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || '1XnnVV9U2Oi_xBzU4eBPpAaOXQPAxQj5C8ECdYE0vgTY'

const PHASE_COLOR = {
  '1':   'bg-blue-100 text-blue-700',
  '1.5': 'bg-indigo-100 text-indigo-700',
  '2':   'bg-purple-100 text-purple-700',
}

const TYPE_COLOR = {
  '메인 플로우': 'bg-emerald-100 text-emerald-700',
  '유효성 검증': 'bg-amber-100 text-amber-700',
  '예외 처리':   'bg-red-100 text-red-700',
  '상태 분기':   'bg-sky-100 text-sky-700',
}

const IA_COLOR = {
  '사용자 IA':     'bg-blue-500',
  '딜러 어드민 IA': 'bg-violet-500',
  '관리 어드민 IA': 'bg-rose-500',
}

async function fetchSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(res.status)
  const text = await res.text()
  const match = text.match(/setResponse\((\{.+\})\)/)
  if (!match) throw new Error('parse error')
  const { table } = JSON.parse(match[1])
  return table.rows.map(row => row.c.map(cell => (cell?.v ?? '')))
}

function val(v) { return v === null || v === undefined ? '' : String(v) }

function parseDefinitions(rows) {
  return rows
    .filter(r => val(r[3]).startsWith('FN-'))
    .map(r => ({
      ia:         val(r[0]),
      d1:         val(r[1]),
      d2:         val(r[2]),
      id:         val(r[3]),
      name:       val(r[4]),
      target:     val(r[5]),
      phase:      val(r[6]),
      definition: val(r[7]),
      revenue:    val(r[8]),
    }))
}

function parseSpecs(rows) {
  return rows
    .filter(r => val(r[0]).startsWith('FN-'))
    .map(r => ({
      fid:       val(r[0]),
      specId:    val(r[1]),
      order:     Number(r[2]) || 0,
      name:      val(r[3]),
      type:      val(r[4]),
      condition: val(r[5]),
      process:   val(r[6]),
      result:    val(r[7]),
      note:      val(r[8]),
    }))
}

function Badge({ label, colorMap, fallback = 'bg-gray-100 text-gray-600' }) {
  const cls = colorMap[label] ?? fallback
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${cls}`}>
      {label}
    </span>
  )
}

// ── 기능정의서 ────────────────────────────────────────────────────────────────
function DefinitionsView({ data, query }) {
  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return data.filter(d =>
      !q ||
      d.id.toLowerCase().includes(q) ||
      d.name.toLowerCase().includes(q) ||
      d.definition.toLowerCase().includes(q)
    )
  }, [data, query])

  const grouped = useMemo(() => {
    const map = {}
    for (const d of filtered) {
      if (!map[d.ia]) map[d.ia] = []
      map[d.ia].push(d)
    }
    return map
  }, [filtered])

  if (filtered.length === 0)
    return <p className="text-sm text-gray-400 text-center py-20">검색 결과가 없습니다.</p>

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([ia, rows]) => (
        <section key={ia}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-2 h-5 rounded-sm ${IA_COLOR[ia] ?? 'bg-gray-400'}`} />
            <h2 className="text-sm font-semibold text-gray-700">{ia}</h2>
            <span className="text-xs text-gray-400">{rows.length}개</span>
          </div>
          <div className="rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm table-fixed">
              <colgroup>
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[15%]" />
                <col className="w-[7%]" />
                <col className="w-[6%]" />
                <col className="w-[40%]" />
              </colgroup>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
                  <th className="text-left px-4 py-2.5 font-medium">기능 ID</th>
                  <th className="text-left px-4 py-2.5 font-medium">Depth 1</th>
                  <th className="text-left px-4 py-2.5 font-medium">Depth 2</th>
                  <th className="text-left px-4 py-2.5 font-medium">기능명</th>
                  <th className="text-left px-4 py-2.5 font-medium">대상</th>
                  <th className="text-left px-4 py-2.5 font-medium">Phase</th>
                  <th className="text-left px-4 py-2.5 font-medium">기능 정의</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((d, i) => (
                  <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 align-top whitespace-nowrap">{d.id}</td>
                    <td className="px-4 py-3 text-gray-500 align-top text-xs">{d.d1}</td>
                    <td className="px-4 py-3 text-gray-500 align-top text-xs">{d.d2}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 align-top">{d.name}</td>
                    <td className="px-4 py-3 text-gray-500 align-top text-xs">{d.target}</td>
                    <td className="px-4 py-3 align-top">
                      <Badge label={d.phase} colorMap={PHASE_COLOR} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 align-top text-xs leading-relaxed whitespace-pre-line">{d.definition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}

// ── 기능명세서 ────────────────────────────────────────────────────────────────
function SpecsView({ specs, defs, query }) {
  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return specs.filter(s =>
      !q ||
      s.fid.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.condition.toLowerCase().includes(q) ||
      s.process.toLowerCase().includes(q) ||
      s.type.toLowerCase().includes(q)
    )
  }, [specs, query])

  const grouped = useMemo(() => {
    const map = {}
    for (const s of filtered) {
      if (!map[s.fid]) map[s.fid] = []
      map[s.fid].push(s)
    }
    return map
  }, [filtered])

  const defMap = useMemo(() => Object.fromEntries(defs.map(d => [d.id, d])), [defs])

  if (filtered.length === 0)
    return <p className="text-sm text-gray-400 text-center py-20">검색 결과가 없습니다.</p>

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([fid, rows]) => {
        const def = defMap[fid]
        return (
          <section key={fid}>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">{fid}</span>
              <span className="text-sm font-semibold text-gray-800">{rows[0].name}</span>
              {def && <Badge label={`Phase ${def.phase}`} colorMap={PHASE_COLOR} />}
            </div>
            <div className="rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full min-w-[700px] text-xs table-fixed">
                <colgroup>
                  <col className="w-[20%]" />
                  <col className="w-[12%]" />
                  <col className="w-[22%]" />
                  <col className="w-[24%]" />
                  <col className="w-[22%]" />
                </colgroup>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500">
                    <th className="text-left px-3 py-2.5 font-medium">스펙 ID</th>
                    <th className="text-left px-3 py-2.5 font-medium">구분</th>
                    <th className="text-left px-3 py-2.5 font-medium">조건 / 트리거</th>
                    <th className="text-left px-3 py-2.5 font-medium">처리 내용</th>
                    <th className="text-left px-3 py-2.5 font-medium">결과 / 화면 반응</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.sort((a, b) => a.order - b.order).map((s, i) => (
                    <tr key={s.specId} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-3 py-3 font-mono text-gray-400 align-top whitespace-nowrap">{s.specId}</td>
                      <td className="px-3 py-3 align-top">
                        <Badge label={s.type} colorMap={TYPE_COLOR} />
                      </td>
                      <td className="px-3 py-3 text-gray-600 align-top leading-relaxed">{s.condition}</td>
                      <td className="px-3 py-3 text-gray-600 align-top leading-relaxed">{s.process}</td>
                      <td className="px-3 py-3 text-gray-600 align-top leading-relaxed">{s.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function FeatureDocsView({ mode }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    setData(null)
    setError(null)
    Promise.all([
      fetchSheet('Feature Definitions'),
      fetchSheet('Feature Specifications'),
    ])
      .then(([defRows, specRows]) => setData({
        definitions: parseDefinitions(defRows),
        specs: parseSpecs(specRows),
      }))
      .catch(() => setError(true))
  }, [])

  const title = mode === 'definition' ? '기능정의서' : '기능명세서'
  const count = data
    ? mode === 'definition'
      ? `${data.definitions.length}개 기능`
      : `${data.specs.length}개 스펙 항목`
    : ''

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">{title}</h1>
            {count && <p className="text-xs text-gray-400 mt-0.5">{count}</p>}
          </div>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="기능 ID, 기능명 검색..."
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-56 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        {error && (
          <div className="text-center py-20">
            <p className="text-sm text-gray-400">Google Sheets에서 데이터를 불러올 수 없습니다.</p>
            <p className="text-xs text-gray-300 mt-1">시트가 공개(뷰어) 상태인지 확인해주세요.</p>
          </div>
        )}
        {!data && !error && (
          <div className="text-center py-20 text-sm text-gray-400">로딩 중...</div>
        )}
        {data && mode === 'definition' && (
          <DefinitionsView data={data.definitions} query={query} />
        )}
        {data && mode === 'spec' && (
          <SpecsView specs={data.specs} defs={data.definitions} query={query} />
        )}
      </div>
    </div>
  )
}
