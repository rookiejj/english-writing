---
description: Read the 기능정의서 sheet in docs/feature-docs.xlsx and generate/append a linked 기능명세서 sheet with per-case spec rows
argument-hint: [optional scope filter: 기능ID pattern like FN-DLR-*, or an IA area name] [optional workbook path override]
allowed-tools: Bash, Read, Write, Edit, Glob, AskUserQuestion
---

# Generate Feature Specification Doc (기능명세서)

Adds a **기능명세서** tab into the *same local workbook* that already has a 기능정의서 tab. Defaults to `docs/feature-docs.xlsx` — the fixed filename `/generate-feature-definition` always writes to — so most runs need no arguments at all. No Google Drive step — this command only reads/writes local files. If the user wants a copy in Drive, they can drag-and-drop the resulting xlsx there afterward; that preserves formatting perfectly and doesn't depend on this command.

**Naming convention (same rule as the definition command, no exceptions):** artifact names (sheet name, spec-ID prefixes) stay in English/fixed codes; row *content* (조건, 처리 내용, 결과 등) stays in Korean.

## 0. Parse input and locate the target

Default target: `docs/feature-docs.xlsx`.

From `$ARGUMENTS`, classify each token:
- A token that ends in `.xlsx` or contains a `/` → treat as a **target override** (use this path instead of the default — for the rare case of a differently-named or relocated workbook).
- Anything else → a **scope filter**: a 기능ID pattern (e.g. `FN-DLR-*`), an IA area name, or `전체`/`all`. See step 2.

**Check the target (default or overridden) exists with `Glob`/`Bash` before doing anything else. If `docs/feature-docs.xlsx` (or the overridden path) doesn't exist, stop immediately** and tell the user: "`docs/feature-docs.xlsx`가 없습니다. 먼저 `/generate-feature-definition <IA링크 또는 파일>`을 실행해서 정의서부터 만들어주세요." Don't create a placeholder, don't search for a similarly-named file elsewhere, don't proceed with partial data.

## 1. Open the target and find 기능정의서

- Open with `openpyxl` and look for a sheet/tab named `기능정의서` (or `Feature Definitions`). **If it's not there — stop immediately.** Tell the user: "이 파일에서 기능정의서 탭을 찾을 수 없습니다. 정의서가 있는 파일이 맞는지 확인해주세요." Do not create a placeholder, do not guess which other sheet might be the definitions, do not proceed with partial data.

## 2. Parse scope from the rest of `$ARGUMENTS`

- No scope filter → every 기능ID in 기능정의서 that has **no rows yet** in 기능명세서 (incremental default).
- A 기능ID pattern or IA area name → restrict to matching rows, still incremental (skip already-specced ones) unless step 3 says otherwise.
- `전체` / `all` → every 기능ID, including already-specced ones (step 3 asks what to do with those).

## 3. Check for an existing 기능명세서 tab in the target

- **If the tab doesn't exist yet**, create it fresh — no confirmation needed, skip to step 4.
- **If it already exists**, read it and show the user: how many features already have spec rows, total row count, and (if scope includes any already-specced 기능ID) how many overlap. Then ask with `AskUserQuestion`: "기능명세서 탭이 이미 있습니다. 어떻게 할까요?" with options:
  - `이어서 추가` → only write rows for in-scope 기능ID's that currently have zero rows; never touch existing rows.
  - `전체 재생성` → wipe the tab and rebuild it for every 기능ID in 기능정의서 (not just this run's scope) — confirm this is really wanted, since it discards any hand-edited spec content.
  - `취소` → stop, nothing written.

## 4. Write spec rows per feature

For each 기능ID in scope, write **at least one row** (메인 플로우), plus as many additional rows as are genuinely implied by that feature's 기능정의 text and ordinary domain reasoning — don't force a fixed count, don't invent exotic edge cases that aren't plausible for that specific feature.

**"Avoid generic technical filler" is not the same as "avoid exceptions."** These are two different, non-overlapping checks — don't let the first one suppress the second:
1. Does this feature involve create/update/delete, a form with required fields, payment, a quota/limit, a state transition (draft→approved, active→expired), or a permission/role check? **If yes, it almost certainly needs more than 1 row** — data validation, conflicting/concurrent edits, state-specific behavior, and permission denial are business-relevant even when they sound "technical" at first glance (e.g. "another admin is already editing this listing" is a real business rule about data integrity, not generic server-error boilerplate).
2. Only *within* whatever rows you do write, keep infrastructure-only noise out (see below) — don't use that as a reason to reduce the row count itself.
- Before finalizing a feature at just 1 row (메인 플로우 only), explicitly check it against list above. Genuinely simple read-only/static features (a list toggle, an external link-out, a content display page with no input) are fine at 1 row — but that should be the reasoned exception, not something that happens to ~1/3 of all features. If you find yourself leaving many features in a run at 1 row, that's a signal to go back and check whether real cases were skipped, not a sign the doc is done.

**Read the full 기능정의서 row, not just the 기능정의 text column.** In particular, the **수익 모델** column is a direct signal for 상태 분기 rows — if it names a fee, quota, or paid tier (e.g. "1건 무료, 초과분 결제", "$X/건", "월정액"), that's almost always a real branch point (free vs. paid path, quota-exceeded state, payment step) that belongs as its own 상태 분기 row. Missing this is one of the most common ways this command under-delivers — check it for every feature, not just the ones that look obviously transactional.

**`처리 내용` must describe actual processing steps, not restate the definition.** Don't write a sentence that just re-packages 기능명 + 기능정의's Input/Output (e.g. "X가 Y 기능에 접근 → [기능정의 그대로] → Z 반환" is exactly the pattern to avoid). Instead write what genuinely happens at that step — validation order, what gets checked against what, what state changes, what gets called — even at a lightweight/non-technical level. If you notice yourself echoing the 기능정의 column's wording back with only cosmetic changes, rewrite it; that's a sign this row isn't adding information beyond what 기능정의서 already has, which defeats the point of a separate spec doc.

**`결과 / 화면 반응` should quote the actual on-screen text, not describe it vaguely.** Write "필수 항목을 입력해주세요" 표시, not "안내 메시지 표시"; write "결제 완료 화면으로 이동, '등록이 접수되었습니다' 안내" not "완료 화면 표시". A reader shouldn't have to guess what the message says — if you can't confidently write the exact copy, write your best concrete draft and prefix it with "(안) " rather than falling back to a generic description. This applies to every row with a user-facing outcome, not just a few examples.

**Don't default to generic technical failures as 예외 처리 filler.** Rows like "서버 오류/API 실패 → 오류 메시지 표시" or "세션 만료 → 로그인 페이지로 리다이렉트" are true of almost every feature in the same generic way — they're infrastructure-level concerns an engineer already assumes, not a business decision a PM needs to spec out. Only include a technical-failure row when this *specific* feature has a non-obvious consequence worth calling out (e.g. a payment step failing mid-flow has state-recovery implications; a plain read-only list screen failing to load usually doesn't need its own row). This is about **not padding with infrastructure noise** — it does not mean skipping the feature-specific validation/conflict/permission cases described above. Spend the row budget on business-logic branches genuinely specific to the feature — quota limits, approval states, pricing tiers, phase gating, role-based differences, data conflicts — the kind of thing only someone who read the 기능정의 (수익 모델 included) would know to write.

**Case types (구분):**
- `메인 플로우` — the normal successful path (required, ≥1 row per feature)
- `유효성 검증` — input/format validation failures
- `예외 처리` — error states, failures, edge conditions outside normal validation (only where plausible, and only when feature-specific — see above)
- `상태 분기` — the flow forks based on some state (user tier, phase gating, quota/payment triggers from 수익 모델, existing data, etc.)

**Columns per row:**
| 컬럼 | 내용 |
|---|---|
| 기능 ID | copied as-is from 기능정의서 (hard value, not a formula) |
| 스펙 ID | `{기능ID}-{구분코드}-{2자리번호}` — see numbering rule below |
| 표시순서 | plain integer, free to reorder later, never used as an identifier |
| 기능명 | formula-linked to 기능정의서 (see step 5) |
| 구분 | one of the four case types above |
| 조건 / 트리거 | when this row applies |
| 처리 내용 | what actually happens |
| 결과 / 화면 반응 | what the user sees / resulting state |
| 비고 | optional |

**스펙 ID numbering — never renumber existing rows:**
- 구분코드: 메인 플로우 → `MAIN`, 유효성 검증 → `VAL`, 예외 처리 → `EXC`, 상태 분기 → `BR`.
- Each 기능ID + 구분코드 combination has its own independent counter, zero-padded to 2 digits: `FN-USER-016-MAIN-01`, `FN-USER-016-VAL-01`, `FN-USER-016-EXC-01`, `FN-USER-016-EXC-02`, ...
- If step 3 was `전체 재생성`, restart counters cleanly since the whole tab is rebuilt anyway. Otherwise, never reuse, skip-renumber, or shift an existing row's 스펙 ID — reorder display via **표시순서** only.

Leave any field you can't confidently derive from 기능정의서 content as blank or "확인 필요" — don't fabricate plausible-sounding detail.

## 5. Link 기능명 to 기능정의서 (live formula, not a copied value)

- `기능명` column formula: `=INDEX('기능정의서'!$E:$E, MATCH($A2, '기능정의서'!$D:$D, 0))` (adjust column letters to the target's actual 기능정의서 layout).
- Do **not** hardcode the feature name as text. If 기능정의서 later renames or removes a 기능ID, this should surface as `#N/A` — treat that as a "needs attention" signal, not a bug to work around.
- `기능 ID` itself stays a plain value (join key others will filter/search by).

## 6. Formatting, save, and recalculate

- Sheet name: `Feature Specifications` (기능명세서), added into the **same local file that was passed in as the target** — never a new or renamed workbook.
- Header fill `#548235` (green, distinct from 기능정의서's blue `#305496`); white bold Arial header text; body Arial 9pt, wrap text.
- `freeze_panes` and `auto_filter` recomputed after writing.
- `openpyxl` (`pip install openpyxl --break-system-packages` only if missing); formulas restricted to what LibreOffice can evaluate (`INDEX`/`MATCH`, no `XLOOKUP`/`FILTER`/etc.) per the xlsx skill.
- Save in place, then run `scripts/recalc.py` (xlsx skill, if present) and confirm `status: success` / `total_errors: 0` before reporting success. If the skill script isn't available, note in the final report that the file needs to be opened once in Excel/LibreOffice to populate formula values.

## 7. Report back

Summarize:
- The target file that was updated
- Scope actually processed (which 기능ID's, how many skipped because they already had rows)
- Total spec rows written this run, broken down by 구분 (메인 플로우 N개, 유효성 검증 N개, 예외 처리 N개, 상태 분기 N개)
- Any 기능ID left with only the required 1 row (main flow only) — flag these so the user can sanity-check. If this is more than roughly 10-15% of the features processed this run, say so explicitly as a possible under-coverage signal, not just a neutral list.
- Any fields left blank / marked "확인 필요"
- Recalc status (success, or a note that it needs to be opened manually)
- If the user cancelled, or no 기능정의서 tab was found in the target, say so plainly instead of reporting output
- Remind the user, if relevant: "Drive에 올리려면 이 파일을 직접 드래그해서 업로드하면 서식까지 그대로 유지됩니다."