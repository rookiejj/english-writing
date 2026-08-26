# Project: Eric Prototype — Used Car Marketplace

## 재사용 컴포넌트 (`src/components/ui/`)

새 UI를 만들기 전에 아래 목록을 먼저 확인할 것. 있으면 새로 만들지 말고 가져다 쓸 것.

| 컴포넌트 | 파일 | 용도 |
|---|---|---|
| `<LoadingState>` | `src/components/ui/LoadingState.jsx` | 로딩 중 UI — 픽셀 그리드 애니메이션 + 샤이머 레이블 + 경과 타이머. variant: `Drive`(기본) / `Dots` / `Orbit` / `Surfer` |

## 디자인 시스템

`.claude/skills/design-system/DESIGN.md` 참조. UI 작업 시 반드시 먼저 읽을 것.
주요 색상: `#3E6AE1`(Primary), `#171A20`(텍스트), `#F4F4F4`(배경), `#8E8E8E`(플레이스홀더)

## 프로젝트 구조 핵심

- 새 화면 추가: `src/pages/{PageName}/index.jsx` → `src/pages/registry.js` → `src/config/navigation.js`
- 사용자 화면은 `UserAppShell`로 자동 래핑 (탭 루트 화면 ↔ 서브 화면 자동 구분)
- 공유 mock 인증: `src/stores/mockProductAuthStore.js`

## 규칙

- `git push`는 사용자가 명시적으로 "푸시"라고 말할 때만 실행
