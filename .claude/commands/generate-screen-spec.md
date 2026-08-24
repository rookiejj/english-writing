---
description: Read 기능정의서 + 기능명세서 from docs/feature-docs.xlsx and generate a screen-level spec (xlsx tab + flow diagram + low-fi wireframes)
argument-hint: [optional scope filter: 화면ID pattern like SCR-DLR-*, or an IA area name]
allowed-tools: Bash, Read, Write, Edit, Glob, AskUserQuestion
---

# Generate Screen Specification Doc (화면명세서)

Builds a screen-level spec from the feature-level docs already in `docs/feature-docs.xlsx`. Unlike 기능명세서 (1 기능 → N case rows), this is a **many-to-many regrouping**: several 기능ID's often belong to one screen, and one 기능ID can occasionally span more than one screen. Produces three coordinated outputs, all local, no Drive step.

**Naming convention (same rule as the other two commands, no exceptions):** artifact names (file/tab names, 화면ID prefixes) stay in English/fixed codes; row and diagram *content* stays in Korean.

## 0. Parse input and check prerequisites

Default target: `docs/feature-docs.xlsx`. Optional scope filter from `$ARGUMENTS` — a 화면ID pattern (e.g. `SCR-DLR-*`), an IA area name, or `전체`/`all` (same semantics as the spec command's scope filter, applied to screens instead of features).

**Check `docs/feature-docs.xlsx` exists.** If not, stop and tell the user: "`docs/feature-docs.xlsx`가 없습니다. 먼저 `/generate-feature-definition`을 실행해주세요."

**Check both `기능정의서` and `기능명세서` tabs exist inside it.** This command needs both — 기능정의서 for the Depth1/Depth2 structure, 기능명세서 for the 결과/화면 반응 content that becomes each screen's states. **If either is missing, stop** and tell the user which one to generate first (`/generate-feature-definition` for 기능정의서, `/generate-feature-spec` for 기능명세서). Don't proceed with only one.

## 1. Group features into screens

- **Default grouping unit: Depth 1.** All 기능ID's sharing the same IA 영역 + Depth 1 are one screen, unless the 기능명세서 content for those features clearly implies distinct sequential steps (e.g. a registration flow with its own intermediate states) — split into multiple screens only when the case rows themselves describe moving to a visibly different screen/step, not just a modal or inline state change. Don't force-split for its own sake.
- A 기능ID can appear under more than one screen if its 기능정의/기능명세 content genuinely spans both (e.g. a shared login modal reachable from multiple entry points) — list it in **관련 기능 ID** for every screen it belongs to, don't force a single owner.
- Leave the grouping decision visible: if a Depth 1 group got split into multiple screens, or a 기능ID got assigned to more than one screen, note the reasoning briefly in **비고** so it can be sanity-checked later.

## 2. Assign 화면 ID

- `SCR-{영역}-{3자리}`, same prefix convention as 기능ID (`USER`/`DLR`/`ADM`/new-area-derived), independent counter per area.
- If `docs/feature-docs.xlsx` already has a `Screen Specifications` tab with rows for this area, continue numbering from the highest existing number — never collide or renumber existing IDs.

## 3. Check for an existing Screen Specifications tab

Same pattern as the other two commands: if it doesn't exist, create fresh (skip to step 4). If it exists, show the user what's already there (existing areas, 화면ID ranges, row count) and ask `AskUserQuestion` — "Screen Specifications 탭이 이미 있습니다. 어떻게 할까요?" with options `이어서 추가`, `전체 재생성`, `취소`. Same meaning as in `/generate-feature-spec`: `전체 재생성` wipes and rebuilds everything (confirm this is wanted first, since it discards hand edits), `이어서 추가` only touches screens not yet present, `취소` writes nothing.

## 4. Write the Screen Specifications tab (text layer)

**Columns:**
| 컬럼 | 내용 |
|---|---|
| 화면 ID | `SCR-{영역}-{번호}`, plain value |
| 화면명 | from the Depth1/Depth2 grouping |
| 관련 기능 ID | comma-separated list of 기능ID's on this screen — plain text, not a formula (this is genuinely many-to-many, a single-cell `INDEX/MATCH` can't represent it cleanly) |
| 진입 경로 | where the user arrives from |
| 화면 상태 | 기본/로딩/빈값/에러 등, drawn from the relevant 기능명세서 rows' 결과·화면 반응 content, summarized per state |
| 주요 구성요소 | layout elements in on-screen order (헤더, 리스트, 필터, CTA버튼, 모달 등) — this list drives the wireframe in step 6, so keep it ordered top-to-bottom |
| 다음 화면 | 화면ID's this screen can navigate to — this drives the flow diagram in step 5 |
| 비고 | grouping notes from step 1, or blank |

Sheet name: `Screen Specifications` (화면명세서). Header fill `#C55A11` (orange, distinct from the blue/green of the other two tabs); white bold Arial header text; body Arial 9pt, wrap text. `freeze_panes`/`auto_filter` recomputed. Save with `openpyxl`, then recalc per the xlsx skill if the workbook has any formulas elsewhere.

## 5. Generate the flow diagram

Write `docs/screen-flow.md` containing one Mermaid flowchart:
- One node per 화면ID (label = 화면명), one arrow per 다음화면 relationship.
- Group nodes by IA 영역 using Mermaid subgraphs, so 사용자/딜러/관리자 flows are visually separated even if a few cross-links exist.
- If this file already exists, apply the same show-then-confirm pattern (show current node count, ask 이어서 추가 vs 전체 재생성 vs 취소) — don't silently overwrite.
- This is plain text/Markdown — no image rendering dependency, and it stays readable/diffable in git.

## 6. Generate low-fidelity wireframes (SVG)

One SVG file per 화면ID in `docs/wireframes/{화면ID}.svg`, built from that screen's **주요 구성요소** list (step 4) in order, top to bottom.

**Frame size is fixed by 영역, not by "what device someone might view it on":**
- `SCR-USER-*` (사용자 화면 — buyer/seller) → **mobile frame, 375×812**, always — even though a PC browser can open the file, the screen itself is designed mobile-first and should look like a phone screen when viewed.
- `SCR-DLR-*` / `SCR-ADM-*` (딜러 어드민 / 관리 어드민) → **desktop frame, 1440×900**, always.
- If a new area prefix shows up that isn't one of these, ask the user which frame size applies rather than guessing.

**Style — deliberately low-fidelity, layout-only:**
- Plain rectangles stacked vertically (or a simple grid for list/card sections) representing each 주요 구성요소 entry, in the order given.
- Grey/neutral fill only (e.g. `#E5E5E5` boxes, `#999` text labels) — no brand colors, no real UI chrome, no icons. This is a layout reference, not a mockup; don't let it drift into looking like a finished design (that's the frontend-design skill's job later, during actual prototyping).
- Label each box with the component name from 주요 구성요소 (in Korean, as written there).
- Keep it simple enough to generate directly as SVG markup — no image-generation tool involved, this is just shapes and text.

If wireframes already exist for some 화면ID's in scope, apply the same show-then-confirm pattern per file (or ask once for the whole batch: "기존 와이어프레임이 N개 있습니다. 이어서 추가할까요, 전체 재생성할까요, 취소할까요?") rather than silently overwriting.

## 7. Report back

Summarize:
- Screens created this run, grouped by area, with their 화면ID range
- Any 기능ID that ended up mapped to more than one screen, and any Depth1 group that got split into multiple screens — so the user can sanity-check the grouping calls made in step 1
- Files written: the xlsx tab, `docs/screen-flow.md`, and the wireframe SVG file paths
- Any screens skipped because they already existed (in `이어서 추가` mode)
- If the user cancelled at any confirm step, or a prerequisite tab was missing, say so plainly instead of reporting output
- Remind the user, if relevant: "SVG 와이어프레임은 브라우저로 열어서 바로 확인할 수 있습니다."