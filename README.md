# Prototype Review Platform

PM이 발주사와 프로토타입을 공유하고, 화면 단위로 코멘트를 주고받기 위한 리뷰 플랫폼.

---

## Tech Stack

| 레이어 | 기술 |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Router | React Router v6 |
| Backend | Cloudflare Workers |
| DB | Cloudflare D1 (SQLite) |
| Hosting | Cloudflare Pages |

---

## Project Structure

```
.
├── src/
│   ├── App.jsx                      # 라우트 등록 (PAGE_REGISTRY 기반)
│   ├── main.jsx
│   ├── index.css                    # Tailwind 엔트리
│   ├── config/
│   │   └── navigation.js            # 화면 레이블·그룹 설정 (IA 기반)
│   ├── pages/
│   │   ├── registry.js              # 화면 등록 테이블 (path + component)
│   │   └── [PageName]/index.jsx     # 화면별 컴포넌트
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx        # 뷰 모드에 따라 프로토타입 or 문서 뷰 렌더
│   │   │   ├── TopNav.jsx           # 뷰 전환 탭 (프로토타입·정의서·명세서) + 인증 버튼
│   │   │   └── CommentPanel.jsx     # 전체 코멘트(상) + 현재 화면 코멘트(하)
│   │   ├── docs/
│   │   │   └── FeatureDocsView.jsx  # 기능정의서·명세서 뷰 (Google Sheets 실시간 fetch)
│   │   ├── comment/
│   │   │   ├── CommentList.jsx
│   │   │   ├── CommentItem.jsx
│   │   │   └── CommentInput.jsx
│   │   ├── auth/
│   │   │   ├── LoginModal.jsx
│   │   │   └── ProfileModal.jsx
│   │   └── ui/
│   │       ├── Modal.jsx
│   │       └── Avatar.jsx
│   ├── hooks/
│   │   └── useComments.js
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.service.js
│   │   └── comment.service.js
│   └── stores/
│       ├── authStore.js
│       ├── commentStore.js
│       └── uiStore.js
├── worker/
│   ├── wrangler.toml
│   └── src/
│       ├── index.js
│       ├── routes/
│       │   ├── auth.js              # POST /api/auth/signup·login  PATCH nickname·password
│       │   └── comments.js          # GET·POST /api/comments  DELETE /api/comments/:id
│       ├── middleware/
│       │   └── cors.js
│       ├── utils/
│       │   ├── jwt.js               # HS256 JWT (Web Crypto API)
│       │   └── password.js          # PBKDF2 해싱 (Web Crypto API)
│       └── db/
│           └── schema.sql           # D1 DDL (users · comments)
└── docs/
    └── feature-docs.xlsx            # 기능정의서 + 기능명세서
```

---

## Layout

### TopNav

```
[ 타이틀 ]   [ 프로토타입 | 기능정의서 | 기능명세서 ]   [ 로그인 / 프로필 / 코멘트 토글 (PC) ]
```

- 뷰 전환 탭은 모든 브레이크포인트에서 표시
- 인증 버튼·코멘트 토글은 PC(`md` 이상)에서만 표시
- 코멘트 토글은 프로토타입 뷰일 때만 표시

### PC (md 이상) — 프로토타입 뷰

```
┌──────────────────────────────────────┬────────────────┐
│               TopNav                              │
├──────────────────────────────────────┼────────────────┤
│                                      │ 전체 코멘트 ↑  │
│        프로토타입 화면 (2/3)          ├────────────────┤
│                                      │ 현재 화면 ↓    │
└──────────────────────────────────────┴────────────────┘
```

- 코멘트 패널은 우측으로 슬라이드 토글 (transition-all)

### 문서 뷰 (기능정의서·명세서)

코멘트 패널 없이 전체 너비로 `FeatureDocsView` 렌더. PC·모바일 공통.

### Mobile — 프로토타입 뷰

- 프로토타입 영역만 표시
- 인증·코멘트 UI 전체 숨김

---

## Comment System

- **단위**: `location.origin + pathname` — 도메인이 다르면 데이터가 완전히 분리됨
- **스레드**: 최대 1단계 답글
- **권한**: 로그인 사용자 누구나 작성 / 본인 코멘트만 삭제
- **전체 탭**: 현재 도메인 기준 최신 100건 (답글 포함)
- **현재 탭**: 현재 화면의 코멘트 + 답글
- **세션 캐시**: 전체 코멘트는 페이지 로드 시 1회만 fetch. 이후 네비게이션에서는 Zustand 상태 유지

---

## Auth

- 이메일 + 닉네임 + 숫자 4자리 PIN
- JWT (HS256, 30일 만료) → localStorage 영속
- 닉네임·비밀번호 변경은 TopNav 프로필 모달에서

---

## Adding a New Prototype Page

1. `src/pages/YourPage/index.jsx` 생성
2. `src/pages/registry.js`에 경로 + 컴포넌트 등록
3. `src/config/navigation.js`에 레이블 추가 (코멘트 패널 표시용)

```js
// registry.js
import YourPage from './YourPage'
export const PAGE_REGISTRY = [
  { path: '/', component: HomePage },
  { path: '/your-path', component: YourPage },
]
```

---

## 기능정의서·명세서 뷰

`FeatureDocsView`(`src/components/docs/FeatureDocsView.jsx`)가 Google Sheets에서 데이터를 런타임에 직접 fetch해 렌더한다.

### 주요 기능

- **뷰 전환**: TopNav 탭으로 기능정의서·기능명세서 전환. 탭별 스크롤 위치 독립 저장·복원
- **검색**: 기능 ID·기능명 실시간 필터
- **모바일 대응**: 테이블 가로 스크롤, 컬럼 고정 너비

### Google Sheets 연동

- Sheet ID: `src/components/docs/FeatureDocsView.jsx` 상단 `SHEET_ID` 상수 또는 `VITE_GOOGLE_SHEET_ID` 환경변수
- 시트는 **링크 공유(뷰어) + 웹에 게시** 상태여야 함
- 시트 수정 → 새로고침만으로 반영 (빌드·배포 불필요)

---

## Docs & Claude Commands

`docs/feature-docs.xlsx`는 기능정의서(Feature Definitions)와 기능명세서(Feature Specifications) 두 탭으로 구성된다.

### `/generate-feature-definition`

IA 문서(URL 또는 로컬 파일)를 읽어 `docs/feature-docs.xlsx`의 **Feature Definitions** 탭을 생성하거나 이어붙인다.

```
/generate-feature-definition <IA 링크 또는 docs/ 경로> [영역명(선택)]
```

**출력 컬럼:** IA 영역 | Depth 1 | Depth 2 | 기능 ID | 기능명 | 대상 | Phase | 기능 정의 | 수익 모델

### `/generate-feature-spec`

`docs/feature-docs.xlsx`의 Feature Definitions 탭을 읽어 **Feature Specifications** 탭을 생성하거나 이어붙인다.

```
/generate-feature-spec [기능ID 패턴(선택)]
```

**스펙 ID 규칙:** `{기능ID}-{구분코드}-{2자리번호}` — 구분코드: `MAIN` / `VAL` / `EXC` / `BR`

**출력 컬럼:** 기능 ID | 스펙 ID | 표시순서 | 기능명 | 구분 | 조건/트리거 | 처리 내용 | 결과/화면 반응 | 비고

### `/generate-prototype`

`docs/feature-docs.xlsx`의 기능정의서 + 기능명세서를 읽어 `src/pages/` 아래 React 프로토타입 화면을 생성하고 라우터·네비게이션에 자동 등록한다.

```
/generate-prototype [화면명세서 소스(선택)] [범위 필터(선택)]
```

---

## Dev Setup

```bash
# 의존성 설치
npm install
cd worker && npm install && cd ..

# 로컬 실행
npm run dev          # Vite → http://localhost:5173

# Worker (별도 터미널)
cd worker && npm run dev   # http://localhost:8787
```

---

## Cloudflare D1 Setup

```bash
cd worker

# 1. D1 데이터베이스 생성
npx wrangler d1 create <db-name>

# 2. 출력된 database_id를 wrangler.toml에 입력

# 3. 로컬 스키마 적용
npm run db:init

# 4. 프로덕션 스키마 적용
npm run db:init:remote

# 5. JWT 시크릿 설정
npx wrangler secret put JWT_SECRET
```

---

## Deploy

### Frontend — Cloudflare Pages

GitHub 레포를 Cloudflare Pages에 연결하면 `main` 브랜치 push 시 자동 빌드·배포.

| 항목 | 값 |
|---|---|
| Build command | `npm run build` |
| Build output | `dist/` |

### Worker — GitHub Actions

`worker/` 하위 파일 변경 시 자동 배포 (`.github/workflows/deploy.yml`).

**필요한 GitHub Secrets:**

| Secret | 설명 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Workers 배포 권한 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 계정 ID |

### 문서 데이터 갱신 — Google Sheets

기능정의서·기능명세서는 Google Sheets에서 런타임에 직접 가져온다. 빌드나 배포 없이 **시트를 수정하면 새로고침 즉시 반영**된다.

Sheet ID는 `VITE_GOOGLE_SHEET_ID` 환경변수 또는 `FeatureDocsView.jsx` 상단 `SHEET_ID` 상수로 관리. 시트는 반드시 **링크 공유(뷰어) + 웹에 게시** 상태여야 한다.

### 수동 배포 (필요 시)

```bash
cd worker && npm run deploy
```
