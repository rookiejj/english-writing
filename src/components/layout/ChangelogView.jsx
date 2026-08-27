import { useEffect, useState } from 'react'
import * as api from '@/services/api'
import LoadingState from '@/components/ui/LoadingState'

const ACTION_STYLE = {
  added:   { label: '추가', color: '#16A34A', bg: '#DCFCE7' },
  updated: { label: '수정', color: '#D97706', bg: '#FEF3C7' },
  removed: { label: '삭제', color: '#DC2626', bg: '#FEE2E2' },
}

function timeStr(ts) {
  const d = new Date(ts * 1000)
  return d.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function screenName(path) {
  // src/pages/PageName → PageName
  return path.split('/')[2] || path
}

export default function ChangelogView() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.request('/changelog')
      .then(({ changelog }) => setEntries(changelog))
      .catch(() => setError('불러오기 실패'))
      .finally(() => setLoading(false))
  }, [])

  // 커밋 SHA 기준으로 그룹핑
  const groups = entries.reduce((acc, e) => {
    const key = e.commit_sha
    if (!acc[key]) acc[key] = { sha: e.commit_sha, msg: e.commit_msg, author: e.author, at: e.pushed_at, screens: [] }
    acc[key].screens.push({ path: e.screen_path, action: e.action })
    return acc
  }, {})
  const grouped = Object.values(groups).sort((a, b) => b.at - a.at)

  return (
    <div style={{ padding: '32px 40px', maxWidth: 720, margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>변경 이력</h2>
      <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 28 }}>
        프로토타입 화면이 추가·수정·삭제될 때마다 자동으로 기록됩니다.
      </p>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
          <LoadingState label="변경 이력 불러오는 중" variant="Dots" />
        </div>
      )}
      {error  && <p style={{ color: '#EF4444', fontSize: 13 }}>{error}</p>}
      {!loading && !error && grouped.length === 0 && (
        <p style={{ color: '#9CA3AF', fontSize: 13 }}>아직 기록된 변경 이력이 없습니다.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {grouped.map(g => (
          <div key={g.sha} style={{
            border: '1px solid #E5E7EB', borderRadius: 10,
            padding: '14px 18px', backgroundColor: '#FFFFFF',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <code style={{ fontSize: 11, color: '#6B7280', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>
                  {g.sha}
                </code>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{g.msg}</span>
              </div>
              <span style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap', marginLeft: 12 }}>
                {g.author} · {timeStr(g.at)}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {g.screens.map((s, i) => {
                const style = ACTION_STYLE[s.action] || ACTION_STYLE.updated
                return (
                  <span key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 12, padding: '3px 10px', borderRadius: 20,
                    backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', color: '#374151',
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: style.color,
                      background: style.bg, padding: '1px 5px', borderRadius: 10,
                    }}>{style.label}</span>
                    {screenName(s.path)}
                  </span>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
