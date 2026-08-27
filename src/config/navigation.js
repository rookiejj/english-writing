// IA 영역 × 화면별 코멘트 패널 라벨 설정
// path: registry.js의 path와 일치, label: 코멘트 패널 표시명

export const NAV_CONFIG = [
  // ── 사용자 IA
  {
    group: '사용자 — 진입',
    items: [
      { path: '/',             label: '랜딩/온보딩' },
      { path: '/login',        label: '로그인' },
      { path: '/level-test',   label: '레벨 테스트' },
    ],
  },
  {
    group: '사용자 — 메인',
    items: [
      { path: '/home',         label: '홈' },
      { path: '/practice',     label: '학습 목록' },
      { path: '/review',       label: '복습 목록' },
      { path: '/my',           label: '마이페이지' },
      { path: '/community',    label: '커뮤니티' },
    ],
  },
  {
    group: '사용자 — 서브',
    items: [
      { path: '/practice/session', label: '영작 세션' },
      { path: '/practice/result',  label: '세션 결과' },
      { path: '/review/srs',       label: 'SRS 복습' },
      { path: '/bookmarks',        label: '북마크' },
      { path: '/my/settings',      label: '설정' },
    ],
  },
  // ── 관리자 IA
  {
    group: '관리자',
    items: [
      { path: '/admin',            label: '대시보드' },
      { path: '/admin/questions',  label: '문제 관리' },
      { path: '/admin/scoring',    label: '채점 로직' },
      { path: '/admin/users',      label: '사용자 관리' },
      { path: '/admin/stats',      label: '통계·리포트' },
    ],
  },
]
