// IA 문서 기반으로 채워나가는 화면 네비게이션 설정
// 새 화면 추가 시 이 파일과 src/pages/registry.js 두 곳만 수정
//
// path:  React Router 경로 (registry.js의 path와 일치해야 함)
// label: 코멘트 패널에 표시될 화면명
// group: 섹션 그룹핑 (선택)

export const NAV_CONFIG = [
  {
    group: '예시',
    items: [
      { path: '/', label: '홈' },
    ],
  },
]
