# Prototype Review Platform

PM이 발주사와 프로토타입을 공유하고, 화면 단위로 코멘트를 주고받기 위한 리뷰 플랫폼.

---

## Tech Stack

| 레이어 | 기술 |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| State | Zustand (persist 미들웨어) |
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
│   │   │   ├── AppLayout.jsx        # PC: 2/3 프로토 + 1/3 코멘트 패널
│   │   │   ├── TopNav.jsx           # 상단 네비 (PC: 인증 버튼 / Mobile: 안내 문구)
│   │   │   └── CommentPanel.jsx     # 전체 코멘트(상) + 현재 화면 코멘트(하)
│   │   ├── comment/
│   │   │   ├── CommentList.jsx      # 코멘트 목록 렌더
│   │   │   ├── CommentItem.jsx      # 코멘트 단위 (답글 포함, 인스타그램 스타일)
│   │   │   └── CommentInput.jsx     # 코멘트 작성 폼
│   │   ├── auth/
│   │   │   ├── LoginModal.jsx       # 로그인 / 회원가입 탭 모달
│   │   │   └── ProfileModal.jsx     # 닉네임 · 비밀번호 변경 모달
│   │   └── ui/
│   │       ├── Modal.jsx            # 공용 모달 래퍼 (ESC · 외부 클릭 닫기)
│   │       └── Avatar.jsx           # 닉네임 이니셜 컬러 아바타
│   ├── hooks/
│   │   └── useComments.js           # 코멘트 페치·액션 통합 (페이지 ID = pathname)
│   ├── services/
│   │   ├── api.js                   # fetch 래퍼 (request / authRequest)
│   │   ├── auth.service.js          # 인증 API 호출
│   │   └── comment.service.js       # 코멘트 API 호출
│   └── stores/
│       ├── authStore.js             # 유저·토큰 (localStorage 영속)
│       ├── commentStore.js          # 전체·현재 화면 코멘트 상태
│       └── uiStore.js               # 패널 열림·모달 열림 상태
├── worker/
│   ├── wrangler.toml                # Workers 설정 (D1 바인딩)
│   ├── src/
│   │   ├── index.js                 # Workers 엔트리 (라우팅 + CORS)
│   │   ├── routes/
│   │   │   ├── auth.js              # POST /api/auth/signup·login  PATCH nickname·password
│   │   │   └── comments.js          # GET·POST /api/comments  DELETE /api/comments/:id
│   │   ├── middleware/
│   │   │   └── cors.js              # CORS 헤더 · json() 헬퍼 · requireAuth()
│   │   ├── utils/
│   │   │   ├── jwt.js               # HS256 JWT (Web Crypto API, 외부 의존성 0)
│   │   │   └── password.js          # PBKDF2 해싱 (Web Crypto API, 외부 의존성 0)
│   │   └── db/
│   │       └── schema.sql           # D1 DDL (users · comments)
│   └── package.json
└── docs/                            # IA · 화면명세서 · 기능명세서 업로드 공간
```

---

## Layout

### PC (md 이상)
```
┌─────────────────────────────────────┬────────────────┐
│              TopNav                              │
├──────────────────────────────────────┼────────────────┤
│                                      │ 전체 코멘트 ↑  │
│        프로토타입 화면 (2/3)          ├────────────────┤
│                                      │ 현재 화면 ↓    │
└──────────────────────────────────────┴────────────────┘
```
- 코멘트 패널은 우측으로 슬라이드 토글 (transition-all)
- TopNav 우측: 로그인 / 닉네임·비밀번호 변경 / 로그아웃 / 패널 토글 버튼

### Mobile
- 프로토타입 영역만 표시
- TopNav: 서비스 타이틀 + "코멘트는 PC에서만 가능합니다" 안내 문구
- 인증·코멘트 UI 전체 숨김

---

## Comment System

- **단위**: 페이지 단위 (페이지 ID = `location.pathname`)
- **스레드**: 최대 1단계 답글 (인스타그램 스타일)
- **권한**: 로그인 사용자 누구나 작성 / 본인 코멘트만 삭제 / 수정 없음
- **전체 탭**: 모든 페이지의 최신 100건 (페이지 레이블 표시)
- **현재 탭**: 현재 pathname의 최상위 코멘트 + 답글

---

## Auth

- 이메일 + 숫자 4자리 PIN
- JWT (HS256, 30일 만료) → localStorage 영속
- 닉네임 별도 설정 (가입 시 필수)
- 비밀번호·닉네임 변경은 PC TopNav 프로필 모달에서만

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

## Dev Setup

```bash
# 프론트엔드
npm install
cp .env.example .env.local
npm run dev          # http://localhost:5173

# Workers (별도 터미널)
cd worker && npm install
npm run dev          # http://localhost:8787
```

---

## Cloudflare D1 Setup

```bash
# 1. D1 데이터베이스 생성
cd worker
npx wrangler d1 create prototype-review-db

# 2. 출력된 database_id를 wrangler.toml에 붙여넣기

# 3. 로컬 스키마 적용
npm run db:init

# 4. 프로덕션 스키마 적용
npm run db:init:remote

# 5. JWT 시크릿 설정 (프로덕션)
npx wrangler secret put JWT_SECRET
```

---

## Deploy

```bash
# Workers 배포
cd worker && npm run deploy

# Pages 배포 (Cloudflare Pages에 GitHub 레포 연결 후 자동)
# Build command: npm run build
# Build output: dist/
# Root directory: (루트)
```
