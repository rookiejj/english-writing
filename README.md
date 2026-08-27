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
│   ├── App.jsx
│   ├── config/
│   │   └── navigation.js            # 화면 레이블·그룹 설정
│   ├── pages/
│   │   ├── registry.js              # 화면 등록 테이블 (path + component)
│   │   └── [PageName]/index.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx        # 뷰 모드에 따라 프로토타입 or 문서 뷰 렌더
│   │   │   ├── TopNav.jsx           # 뷰 전환 탭 + 인증 버튼
│   │   │   └── CommentPanel.jsx     # 전체 코멘트(상) + 현재 화면 코멘트(하)
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
│       └── db/
│           └── schema.sql           # D1 DDL (users · comments)
└── docs/
```

---

## Layout

### TopNav

```
[ 타이틀 ]   [ 프로토타입 | 기능정의서 | 기능명세서 ]   [ 로그인 / 프로필 / 코멘트 토글 (PC) ]
```

- 뷰 전환 탭은 모든 브레이크포인트에서 표시
- 인증 버튼·코멘트 토글은 PC(`md` 이상)에서만 표시

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

- 코멘트 패널은 우측으로 슬라이드 토글

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
