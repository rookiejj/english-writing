---
description: Read docs/feature-docs.xlsx (Feature Definitions + Feature Specifications) and generate real prototype screens under src/pages, wired into the existing registry/navigation/router — uses an externally-supplied 화면명세서 (link or file) when given one, and can run from that 화면명세서 alone if feature-docs.xlsx doesn't exist yet
argument-hint: [optional 화면명세서 source: link or local file path] [optional scope filter: 기능ID pattern like FN-DLR-*, or an IA area name]
allowed-tools: WebFetch, Bash, Read, Write, Edit, Glob, AskUserQuestion
---

# Generate Prototype (프로토타입)

Builds real React screens straight from 기능정의서 + 기능명세서, and — when the user provides one — an externally-authored 화면명세서 too. **화면명세서 is typically received from someone else (a designer, a partner team), not produced by this project's own commands** — so this command takes it the same way `/generate-feature-definition` takes an IA source: as an optional link or local file, in whatever structure that person actually used, not a fixed internal schema. If no 화면명세서 is given, this command groups screens itself from 기능정의서 + 기능명세서, the way it always did. Either way, the goal is the same: a reviewer should be able to read 기능명세서 next to the rendered prototype and see every row accounted for.

Follow `docs/README.md`'s existing conventions — this command extends an existing app, it doesn't scaffold a new one.

**Every specific file/component name mentioned below (`registry.js`, `TopNav.jsx`, `authStore.js`, etc.) is a description of what this project's `docs/README.md` documents *right now* — not a hardcoded requirement of this command.** `docs/README.md` is the actual source of truth; this command's names are only as good as the last time someone kept them in sync with it. **At the start of every run, read `docs/README.md`'s Project Structure section (and skim the actual files if anything looks off) to confirm the real current names before relying on this command's examples.** If the project has been restructured since this command was last edited — a file renamed, moved, split, or a convention changed — follow what `docs/README.md` and the codebase actually show, not what's written here. Where this command names a file, read it as "whatever currently serves this role, which happens to be called X as of this writing."

## Non-negotiables — check these before writing a single line of code

These are the rules previous runs of this command have actually broken. Read them first, hold them through the whole run, and re-check them right before you finish — don't let step count or scope size push them out of attention.

1. **`/` renders the real product home screen** — actual content a real user would see (featured/recent listings, search entry points, real nav), not a directory of every generated screen. This holds even if no IA Depth 1 group is literally named "홈" — compose a real home screen from the area's actual content (e.g. featured listings pulled from 차량 탐색, a quick search entry, category shortcuts) rather than defaulting to a directory because there's no explicit IA node for it. If a review directory of all screens is useful, it lives at a different path (e.g. `/_screens`), never at `/`.
2. **Every 사용자 screen is wrapped in the shared bottom-nav shell (step 4). No exceptions, no "I'll add it later."** If you write a page file's JSX and it doesn't render inside — or get wrapped by — the shell component, stop before saving it. A screen with no persistent nav is the single most common failure of this command; check for it explicitly on every screen, not just the first one.
3. **Mock login state (step 4.5) is one shared, persisted store — never a per-screen local boolean.** Any screen with login-gated behavior must read/write that shared store, not its own local state, and the state must survive a page refresh. Don't confuse this with the review platform's own real login (`authStore.js`) — leave that alone entirely.
4. **A reviewer can get from any IA area to any other IA area with a click, not by typing a URL (step 4.6).** Extend the existing TopNav's screen switcher — don't leave 딜러/관리자 screens reachable only by manually editing the address bar. It lives in TopNav's top-left corner, replacing any static "Prototype" label there (not alongside one — that's redundant with the 프로토타입 tab already on the right), and it must stay visible at every viewport width — never hidden behind a `hidden md:flex`-style responsive class.
5. **Fixed/sticky bottom bars are actually fixed, and never overlap scrollable content.** This covers two things that have both broken in previous runs: (a) the shell's own bottom nav must use real `position: fixed`/`sticky` CSS, not just markup placed near the bottom — verify it stays put after scrolling, not just visible before scrolling; (b) any screen with its own fixed bottom action bar (CTA buttons) must give scrollable content matching bottom padding equal to that bar's height, so nothing renders underneath it. Check both on every screen.
6. **A screen is real functional UI, not a placeholder card.** (Full rule in step 5.)

## 0. Parse input and detect mode

From `$ARGUMENTS`, classify each token:
- A URL (`http(s)://`) → a **화면명세서 link**.
- A local path (contains `/` or ends in a document extension: `.xlsx`, `.csv`, `.docx`, `.pptx`, `.pdf`, `.md`) → a **화면명세서 file**.
- Anything else → a **scope filter** (기능ID pattern or IA area name), handled in step 1.

**Check `docs/feature-docs.xlsx`'s state** (exists or not; if it exists, whether it has both `Feature Definitions` and `Feature Specifications` tabs) — this determines which modes are even possible, so check it before deciding.

Then set the mode:
- **Mode A (화면명세서 + 기능정의서/명세서 모두 있음)**: a 화면명세서 link/file was given in `$ARGUMENTS`, **and** `feature-docs.xlsx` has both tabs. The richest mode — screen grouping/layout from 화면명세서, state/business-logic depth from 기능명세서. Read the 화면명세서 in step 2A.
- **Mode C (화면명세서만 있음, 기능정의서/명세서 없음)**: a 화면명세서 link/file was given, **but** `feature-docs.xlsx` is missing or incomplete. Don't stop and don't demand the feature docs first — build from the 화면명세서 alone (step 2C). **Tell the user plainly, once, that this run will be shallower than Mode A**: no 기능명세서 means no cross-feature business-rule detail (quota/payment triggers, exception cases) beyond whatever the 화면명세서 itself documents — the prototype will only be as rich as that source is. Suggest running `/generate-feature-definition` + `/generate-feature-spec` and re-running this command later for the fuller version, but don't require it now.
- **No 화면명세서 source given in `$ARGUMENTS`** — before defaulting to Mode B, do a quick, cheap look in `docs/` (`Glob`, not a deep read) for a plausible unclaimed 화면명세서 candidate: a file that isn't `feature-docs.xlsx` itself and whose name suggests screens/wireframes/UI spec (`화면`, `screen`, `wireframe`, `ui-spec`, or similar — this is a filename heuristic, not a content guess).
  - **Nothing plausible found** → proceed straight to Mode B (if `feature-docs.xlsx` has both tabs) or stop with the "run the definition/spec commands first" message (if it doesn't) — no 화면명세서 and no feature docs means there's nothing to build from. Don't ask or mention the candidate search; this is the common case and shouldn't add friction.
  - **Exactly one plausible candidate** → ask with `AskUserQuestion`: "docs/에 `{파일명}`이 있는데 화면명세서로 쓸까요?" with options `네, 이걸로` / `아니, 없이 진행`. If yes, proceed as if it were given explicitly (→ Mode A or Mode C depending on `feature-docs.xlsx`'s state, per above). If no, fall through to Mode B/stop logic below.
  - **More than one plausible candidate** → list them and ask which one to use (or none) — don't guess.
  - Never open/parse a candidate file's content to help decide whether it's "really" a 화면명세서 — filename-level heuristics only, for one confirmation question. Content interpretation happens in step 2A/2C, after the user has actually confirmed it's the right file.
- **Mode B (화면명세서 없음, 기능정의서/명세서로 자체 그룹핑)**: confirmed no 화면명세서 (explicitly none given, and either nothing found or the user declined the candidate). Requires `feature-docs.xlsx` with both tabs — **if it's missing here, stop** and tell the user to run `/generate-feature-definition` then `/generate-feature-spec` first; with no 화면명세서 *and* no feature docs, there is nothing to build screens from. If the feature docs do exist, proceed with in-memory grouping (step 2B) — a fully supported path, not a degraded fallback. (This command doesn't read a `Screen Specifications` tab from `docs/feature-docs.xlsx` on its own initiative — if the user wants that tab used, they pass its file as the 화면명세서 source explicitly, same as any other source.)

State which mode is active once, early in the run, so the user knows which source is driving the screens.

## 1. Parse scope

The scope filter token from step 0 (if any): a 기능ID pattern (`FN-DLR-*`), an IA area name, or nothing (→ every screen not yet built, determined by checking `src/pages/registry.js` for existing entries against the grouping in step 2).

## 2. Determine screens

**Reading the source file itself is identical for Mode A and Mode C** — same file-reading logic either way:
- **Reading the source**: a link → `WebFetch` first, retry with a connected Drive MCP tool on auth failure, otherwise ask the user to share it or point to a local copy — never fabricate content (same pattern as `/generate-feature-definition`). A local file → confirm it exists, then read per extension:
  - `.xlsx`/`.csv` via `openpyxl`/`pandas`
  - `.docx` via `pandoc`/`python-docx`
  - `.pptx` via `python-pptx` (`pip install python-pptx --break-system-packages` if missing) — **read every slide's text**, since screen-spec decks commonly put the screen name in a title placeholder and notes/flow info in the body or speaker notes; check `slide.notes_slide` too if present, not just on-slide shapes. Slide order is usually meaningful (often mirrors screen/flow order) — don't discard it.
  - `.pdf` via `pdfplumber` for text; if a page's layout matters more than its text (e.g. an actual wireframe drawing, not a text-heavy slide), also look at the rendered page directly (render to image, view it) rather than relying on `pdfplumber`'s text extraction alone — text extraction from a visual wireframe often garbles or drops the layout information that's the whole point of the page.
  - `.md`/`.txt` directly.
  - Whatever the format, if it's genuinely a visual wireframe/mockup (not primarily text) and text extraction alone doesn't give enough to interpret it, view the actual page/slide image before deciding you can't use it.
- **Interpreting the structure**: this file was authored by someone else, so don't assume it matches this project's own column names. Look for the underlying concepts by whatever labels the source actually uses — a screen identifier/name, which features or requirements it covers, what's on the screen (components/sections/states), and what it links to next. Common variants: 화면명/페이지명/Screen name, 관련기능/연관기능/Feature IDs, 구성요소/컴포넌트/Elements, 다음화면/이동경로/Flow. If the structure is genuinely ambiguous (you can't tell which column is which), show the user a few rows and ask rather than guessing wrong and building screens from misread data.
- If the source gives a component/section order, use it directly for step 5's layout order — don't reinvent it. If it gives wireframe images or a flow diagram alongside, treat them as layout/navigation references, not something to copy literally.
- Derive **PageName** (PascalCase English) from the screen's name, same convention as Mode B, so file/component naming stays consistent either way.

**Mode A only — cross-reference 기능명세서 for depth:**
- Pull every 기능명세서 row (MAIN/VAL/EXC/BR) for the 기능ID's the source associates with each screen (many-to-many is normal — a 기능ID may feed more than one screen). This is what gives Mode A its extra state/business-logic richness over Mode C.

**Mode C only — no feature docs to cross-reference, work from the 화면명세서 alone:**
- There's no 기능명세서 row set to pull, so there's no "스펙ID row set" for this screen — don't invent one. Instead, whatever states/behaviors/content the 화면명세서 itself documents for a screen (explicitly listed error states, form fields, flows, annotations) are that screen's spec. Build exactly those, to the same interactive/non-decorative standard as step 5 describes — just without a 기능ID-linked source backing them.
- **Don't invent business logic the source doesn't mention.** If the 화면명세서 shows a form with no stated validation rules, build the form without fabricating validation messages; if it doesn't show an error/empty state, don't add one from guesswork. This is the direct tradeoff of skipping the feature docs — richness is capped by what this one source actually says.
- If the source references a feature/기능 by name or ID that doesn't exist anywhere (no feature docs to check against), that's fine — just use it as a label, don't try to validate or expand it.

**Mode B — group in-memory (this replaces a 화면명세서, it doesn't skip its job):**
- **Default grouping unit: Depth 1** from Feature Definitions, same principle a 화면명세서 would use — split a Depth 1 group into multiple screens only when the 기능명세서 rows themselves describe moving to a genuinely different screen/step (a distinct route), not just a modal or inline state change.
- For each screen, collect **every 기능명세서 row** belonging to its member 기능ID's. This row set is the screen's actual spec — treat it as such.
- Derive two names per screen: **화면명** (Korean) and **PageName** (PascalCase English) — e.g. "차량 상세 페이지" → `VehicleDetail`.
- Infer a component/section ordering yourself from the 기능명세서 rows' 결과/화면 반응 content, since there's no external source to read one from.

**Every mode:** keep the grouping deterministic (same inputs → same screens/names) so re-running the command doesn't fragment or duplicate screens across runs.

## 3. Check for existing pages before writing

For each screen in scope, check `src/pages/{PageName}/index.jsx` and its `registry.js` entry. If none of the in-scope screens exist yet, skip to step 3.5. If some already exist, show the user which ones (화면명, path) and ask `AskUserQuestion`: "이미 만들어진 화면이 있습니다. 어떻게 할까요?" with options:
- `이어서 추가` → only build screens that don't exist yet, leave existing page files untouched.
- `전체 재생성` → rebuild every in-scope screen, overwriting existing page files (confirm this is wanted — it discards hand edits to those components).
- `취소` → stop, nothing written.

## 3.5. Don't take on more screens than can be built to the definition-of-done bar

Count the screens left in scope after step 3's filtering. **Building many screens shallow is worse than building fewer screens real** — a large scope is exactly what tempts the index-page shortcut this command exists to prevent. If the count is large (rough guide: more than ~6–8 screens), don't silently push through all of them at reduced quality. Either:
- Tell the user the scope is large, propose a sensible first batch (e.g. one IA area, or one Depth 1 group at a time), and confirm with `AskUserQuestion` before proceeding, or
- If the user's scope filter already narrows it to a reasonable batch, just proceed.

It's fine, and expected, for a single run to leave most of a large scope for a follow-up run — that's what the incremental `이어서 추가` mode in step 3 is for. Report honestly in step 9 if the full requested scope wasn't completed this run.

## 4. Build (or reuse) one shared navigation shell per IA area — before touching individual screens

**This is what makes it a prototype instead of a pile of independently-stitched pages.** A real app has persistent chrome (nav bar, header) that stays mounted while route content swaps inside it — screens don't each own a copy of the nav, they live inside it. Do this once per IA area, not once per screen:

1. Check whether a shared layout already exists for this IA area (e.g. `src/components/layout/UserAppShell.jsx`, `DealerAppShell.jsx`, `AdminAppShell.jsx`, or similar — check `src/components/layout/` for anything beyond the existing top-level `AppLayout.jsx`, which handles the 프로토타입/기능정의서/기능명세서 tab switch and is a *different, outer* layer from what's needed here). If one exists for this area, reuse it — don't create a second one.
2. If none exists yet for this area, create exactly one:
   - **사용자 IA**: a mobile shell with a persistent bottom tab bar. Derive the tab items **once** from the IA's own top-level structure (e.g. 홈/탐색, 내차팔기, 찜/마이페이지, 고객센터) — don't let each screen invent its own set or ordering.
   - **딜러 어드민 / 관리 어드민**: a desktop shell with persistent top or side navigation reflecting that IA's Depth 1 categories, built once.
   - **"Persistent" means actually fixed, not just placed at the bottom of the markup.** A bottom tab bar that scrolls away with the page content isn't persistent, it just happens to start near the bottom — that's a bug, not a lighter version of the requirement. Give it `position: fixed` (or `sticky` with a viewport-relative bottom offset), anchored to `bottom-0` within the mobile frame's own bounding container (not the browser viewport, since the frame itself is centered/width-constrained per the frame convention below), with a z-index high enough to stay above scrolling content. **Verify this concretely**: the nav should still be visible and unmoved after scrolling the page content, not just present in the initial unscrolled view.
   - **The scrollable content inside the shell needs bottom padding equal to the nav's height**, so the last bit of real content isn't hidden underneath the fixed bar — same principle as non-negotiable #5 for per-screen action bars, applied here to the shell itself.
3. Wire it with React Router's nested-route pattern — `<Route element={<UserAppShell />}>` wrapping the area's screen routes, with an `<Outlet />` in the shell for the active screen — so the shell mounts once and only the inner content swaps. Register this in `src/pages/registry.js` / `App.jsx` following whatever nesting convention `docs/README.md`'s existing router setup already uses.
4. Every screen built in step 5 belongs inside its area's shell. **A generated screen must never render its own nav bar markup** — if a screen's design calls for something nav-like, it reuses the shell, it doesn't reimplement one.

If a screen genuinely shouldn't have the persistent chrome (e.g. a full-screen checkout/payment step, a login modal-as-page), that's a deliberate, occasional exception — decide it explicitly per screen, don't let it become the default because building the shell felt like extra work.

## 4.5. Build (or reuse) one shared, persistent mock login state per app — also before touching individual screens

**Don't confuse this with the review platform's own login.** `docs/README.md` already describes a real auth system (`src/stores/authStore.js`, `LoginModal.jsx`) for reviewers to sign into *this review tool* and leave comments — leave that completely alone. What's being built here is a separate, **mocked login state for the product being prototyped** — e.g. "is this simulated CarVN buyer logged in," which is a real 기능ID in its own right (회원가입·로그인) and a condition that shows up across many other features' 상태 분기/예외 rows (매물 등록, 마이페이지, 찜하기, etc.).

1. **One shared store, not per-screen state.** Create something like `src/stores/mockProductAuthStore.js` (Zustand, with the `persist` middleware — same pattern the codebase already uses for the real authStore) holding at minimum: whether the mock user is "logged in," and a small fake profile (name, etc.) once logged in. Every screen reads and writes this same store — never invent a local `isLoggedIn` boolean scoped to one component, or login on one screen won't be visible on another, which defeats the entire point.
2. **Persist across refresh, clear on logout.** With `persist` middleware backing it by localStorage, refreshing the page keeps the mock login state exactly as a real app would — logged in stays logged in until an actual logout action clears the store. This is a hard requirement, not a nice-to-have: a prototype where login doesn't survive a refresh isn't demonstrating the real behavior.
3. **Build one lightweight mock login screen/modal** (from the 회원가입·로그인 기능ID's row set) that sets this store when "submitted" — no real backend, no real validation beyond what 기능명세서 actually specifies, just enough to flip the store to logged-in with a plausible fake profile.
4. **Every other screen's login-gated behavior reads this store**, per the state-fidelity rules in step 5 below — e.g. a 상태 분기 row like "비로그인 상태에서 매물 등록 시도 → 로그인 유도" checks this store's state and, if logged out, actually routes to the mock login screen; after logging in there, return the user to (or at least toward) what they were doing, the way a real app would, rather than dropping them somewhere unrelated.
5. **Build once per app area that needs it**, reusing the same pattern established in step 4 — 딜러/관리자 areas likely need their own equivalent mock session store (since they're different actors, not the same "user"), don't share one store across unrelated actor types.

## 4.6. Wire a cross-area screen switcher into the existing top-level TopNav — don't leave IA areas reachable only by typing a URL

**This is a different problem from step 4's shell.** Step 4's shell handles navigation *within* one IA area (사용자's bottom tabs, 딜러's side nav). Nothing so far gets a reviewer *between* areas — from a 사용자 screen to a 딜러 screen — except manually typing a path into the browser bar. That's a real gap a reviewer will hit immediately, not an edge case.

1. **Extend the existing `TopNav.jsx`** (`src/components/layout/TopNav.jsx` per `docs/README.md` — the one that already holds the 프로토타입/기능정의서/기능명세서 view-mode tabs). Don't build a second, separate nav component for this.
2. **Position: the top-left corner of TopNav — and it replaces any static "Prototype" label there, doesn't sit next to one.** A static "Prototype" text in the corner is redundant once this switcher exists in that spot, and doubly redundant given the 프로토타입 view-mode tab on the right already says so in Korean. If TopNav currently has a plain "Prototype" label on the left, replace it with the switcher trigger itself (e.g. app name + current screen name, like `CarVN / 홈 ▾`) rather than keeping both. Don't group it with the auth/comment-toggle controls on the right. This is a fixed placement decision, not left to per-run judgment; if a previous run put it elsewhere or left a redundant "Prototype" label alongside it, fix that rather than leaving it as-is.
3. **Visible and functional at every viewport width — no exceptions.** This is a core navigation control, not a "nice to have on desktop." Never wrap it (or the container it's in) in a responsive-hide utility like `hidden md:flex` that removes it below some breakpoint — a switcher that disappears on a narrower window is the same bug as not building it at all. If space is genuinely tight on small viewports, shrink it to a compact/icon-only trigger, but the functionality itself must never vanish at any width.
4. Add a screen-switcher dropdown: a button showing the current screen's name, opening a list of **every registered screen grouped by IA 영역** (사용자 IA / 딜러 어드민 IA / 관리 어드민 IA / etc., matching `navigation.js`'s existing grouping). Clicking an item navigates immediately and closes the dropdown.
5. **Drive this from `src/pages/registry.js` / `src/config/navigation.js` directly, not a hardcoded list.** Every future `/generate-prototype` run adds screens to those files anyway (step 4's file conventions) — if the dropdown reads from them dynamically, it stays correct automatically as more screens get built across runs, with no extra wiring needed each time.
6. **Only visible in the 프로토타입 tab** — hidden when the top-level view mode is 기능정의서/기능명세서, matching how the rest of TopNav's prototype-only controls already behave. (This is the one legitimate conditional visibility rule here — view-mode-based, not viewport-width-based.)
7. **Check before building**: if this switcher already exists in `TopNav.jsx` from a previous run, verify it against points 2–3 (right position, no width-based hiding) rather than assuming it's fine — a prior run may have placed or gated it incorrectly. Fix it in place if so; it should already be picking up newly-registered screens on its own (per point 5), so only the position/visibility need re-checking, not a full rebuild.

## 5. Build each screen — state fidelity is the whole point

**A screen is not done if it's a title, a feature-ID range, and a link/card pointing at "the real thing later."** Each `src/pages/{PageName}/index.jsx` must itself render the actual functional UI for that screen — real form fields, a real (mocked) listing with real domain content, real buttons that do the thing they say — not a summary card, not a "coming soon," not a placeholder that just restates the screen's name and ID range. If you notice yourself writing a component whose entire content is a heading + description + badge, stop — that's the index-page failure mode, not a screen. A directory listing all screens for review purposes is fine to build — **at a path other than `/`** (see non-negotiable #1 above) — but it's never a substitute for building the screens themselves, and every other route must contain the real thing.

**Definition of done, per screen, before moving to the next one:**
1. **(Mode A/B only)** Every 기능ID in the screen's row set has its 기능정의 (목적) visibly realized in the markup — not just referenced in a comment.
2. **(Mode A/B: 스펙ID rows; Mode C: 화면명세서's own documented states)** Every row/state the source actually specifies for this screen is accounted for (rendered, or explicitly logged as skipped with a reason in the running list for step 9).
3. The screen contains real, specific content (see step 6) — if you can't point to a sentence or data value that came from this domain rather than being generic, it's not done.
4. The screen renders inside its area's shared shell from step 4, not with its own hand-rolled navigation.
5. Any login-gated behavior on this screen reads/writes the shared mock auth store from step 4.5, not local state.
If a screen doesn't clear these (skipping #1 in Mode C, since there's no 기능ID row set to check against), it isn't finished — don't move on to conserve time or attention. If the full scope for this run is large enough that finishing every screen to this bar is genuinely at risk, say so explicitly and propose a smaller batch (see step 3.5) rather than finishing all of them shallowly.

**Mode A/B — row-by-row mapping:** for each screen, before writing code, list its full row set from step 2 (스펙ID | 구분 | 조건/트리거 | 처리내용 | 결과·화면반응). Every row must show up in the rendered component in one of these ways:

- **`메인 플로우`** → the default render.
- **`유효성 검증`** → real validation wired to the actual form fields it applies to (not decorative) — use the exact quoted copy from 결과/화면 반응 as the error text, not a paraphrase. A reviewer triggers this by actually interacting with the form (leaving a field blank and submitting), not by flipping a switch.
- **`예외 처리` / `상태 분기`** → implemented as real interactive behavior on the same URL, reachable by actually using the prototype the way a real user would. Use lightweight local/mock state to make the trigger genuine rather than decorative — e.g. if a 상태 분기 row is "2건째 등록부터 결제 요구," track a mock submission count in component state so submitting a second listing for real triggers the payment view; if a row is "관리자 반려 시 사유 표시," a mock seeded value can stand in for the admin action having already happened, but the resulting screen should render from that state, not from a separate preview button. No dedicated state-switcher UI, no tabs, no "상태 미리보기" control — the interaction *is* the demonstration. One URL per screen; if several states surface on that URL over the course of using it, that's expected, and comments on that page naturally cover all of them (comment granularity here is per-page, not per-state — that's fine). Only give something a separate route/URL when it's a genuinely distinct destination screen (e.g. "결제 완료"), not because it's a different state of the same screen.
- **After building, self-check**: which rows are visibly reflected, which weren't (and why — e.g. a row was pure backend logic with no UI signature). Carry this into the step 9 report; don't silently drop a row.

**Mode C — 화면명세서's own states only:** same interactive standard as above (real validation triggered by real interaction, real conditional states reachable through use, one URL per screen, no state-switcher UI) — just apply it to whatever states/behaviors the 화면명세서 itself documents, since there's no 기능명세서 row set to enumerate here. Self-check the same way: what got reflected, what the source mentioned but you couldn't visualize, and carry that into step 9. Don't backfill with invented validation/exception cases just to make the screen feel more complete than the source actually specifies.

**Layout section order:** in Mode A/C, follow whatever component/section order the 화면명세서 source gives directly — don't reinvent it. In Mode B, infer a sensible top-to-bottom order yourself from the 결과/화면 반응 content of the collected rows.

**File conventions (from `docs/README.md`, follow exactly):**
- `src/pages/{PageName}/index.jsx`
- Register in `src/pages/registry.js`'s `PAGE_REGISTRY` — append, don't reorder or remove existing entries.
- Add a label into `src/config/navigation.js`, grouped by IA 영역, matching the existing entries' shape.

**Frame convention (carries over from the earlier wireframe rule — same logic, now real code):**
- Screens grouped from **사용자 IA** (`FN-USER-*`) → mobile-first, and **stay mobile-width even on desktop** (centered fixed-width mobile frame, e.g. `max-w-[420px] mx-auto`) — this is a deliberate product decision (consumer app is mobile-only in spirit), not a responsive breakpoint choice.
- **The mobile frame must be visually distinct from the page around it — don't let both blend into the same flat color.** Give the frame a visible boundary (a border, a shadow, or a rounded-corner card edge) and/or make the outer page area (outside the frame) a genuinely different color from the frame's own background — e.g. a neutral gray page chrome behind a white/canvas-toned frame. A reviewer should be able to tell at a glance where "the phone screen" ends and "the review tool's page" begins; if the whole browser tab reads as one continuous flat surface, that's the bug.
- Screens grouped from **딜러 어드민 / 관리 어드민** (`FN-DLR-*` / `FN-ADM-*`) → full-width desktop layouts (dense tables, filters, sidebar-style nav) — genuinely different information density than the consumer screens, not the same components restyled.
- **Mode C** (no 기능ID prefixes to key off): infer which frame convention applies from the 화면명세서's own actor/audience labeling (whatever it calls the consumer-facing vs. admin/dealer-facing screens) — ask the user once if genuinely ambiguous, rather than guessing.

## 6. Content must be domain-real, not placeholder — but UI copy stays Korean for now

**Two different things are being populated here, and they follow different language rules:**

- **Data values** (brand/model names, place names, price figures) — use real domain data: brand/model names from the IA (VinFast, Toyota, Hyundai, Kia, Mazda, Ford, Mercedes...), Hanoi districts, VND price formatting matching the IA's own convention (`triệu` units). These can stay in their natural real-world form (e.g. brand names, place names) since they're just data, not instructions the reviewer needs to parse.
- **UI copy** (headings, labels, button text, placeholders, messages, section titles — anything the interface is "saying" to the user) — **write in Korean, not Vietnamese**, for this stage. The team reviewing this prototype reads Korean; a Vietnamese-language interface is a future localization pass for the real product, not something this command should produce by default. Never use "Lorem ipsum", "상품명 1/2/3", generic "Item A/B/C", or round demo numbers everywhere — but the wording itself should be real Korean copy.
- **Critically: reuse the exact quoted UI copy already written into 기능명세서's 결과/화면 반응 column** rather than inventing new wording — that copy is already Korean and was written specifically so it could be dropped straight into the UI verbatim. This is usually the right source for user-facing text; don't translate it into Vietnamese, don't paraphrase it. **(Mode C: no 기능명세서 to draw from — use the 화면명세서's own copy if it specifies exact text; otherwise write original Korean copy following the same rules above.)**

## 7. Visual design — the design-system skill wins if it's loaded, otherwise commit to a point of view

**Always re-read `DESIGN.md` fresh from disk at the start of this step, every run — don't rely on whatever version might already be in context from earlier in this session.** Mid-session skill/file caching behavior isn't fully predictable, and this file gets hand-edited between runs (that's the whole point of it being separate from `SKILL.md`). Treat "I already saw this earlier in the conversation" as insufficient — explicitly read it again here so a `DESIGN.md` edit always takes effect on the very next run, not "eventually" or "after a restart."

If `design-system` skill guidance (freshly read per above) is present, it's authoritative — its exact tokens (colors, type, spacing, radius, named components) override the freeform guidance below wherever they overlap. Don't blend the two; don't improvise a palette when the skill already settled it.

**Only when no design-system skill applies**, decide (briefly, in your own reasoning) before generating markup for the first screen, and hold to it for the rest of the run:
- **Palette**: 4–6 named hex values grounded in *this* subject — a Vietnamese used-car marketplace (trust, automotive, locally credible) — not a generic SaaS blue or a startup-template palette.
- **Type**: a display face and a body face chosen deliberately for this brief, used consistently across all generated screens.
- **One signature layout element** carried through, so the screens read as one product, not a pile of independently-styled pages.
- Avoid the generic AI-default looks (cream background + serif + terracotta accent; near-black + neon accent; hairline-rule newspaper broadsheet) unless something in the brief genuinely calls for it.

**Either way:**
- 사용자 화면 and 딜러/관리자 화면 should *feel* different (consumer app vs. operational tool), not the same components re-skinned.
- Empty/error states speak in the interface's voice — direct, no apology, tells the user what to do next — using the exact copy from step 6.
- Respect whatever Tailwind conventions already exist in the codebase; extend them, don't introduce a second competing system.

**Interaction defaults for list/filter screens (search, 탐색, 매물 목록, and similar) — apply unless a 화면명세서/기능명세서 explicitly specifies otherwise:**
- **The search/filter bar stays fixed at the top while the results list scrolls** — don't let it scroll away with the page content. A reviewer (or real user) shouldn't have to scroll back up to change a filter or search again.
- **Filter options render inline and visible by default** (tabs/chips showing 브랜드/차종/가격/지역 etc. directly, current selection state visible at a glance) — don't default to collapsing them behind a "필터" button that has to be clicked open before anything is visible. Collapsing behind a button is an extra step that hides state the user usually wants to see immediately; only do it when the source explicitly calls for a dedicated filter screen/sheet.
- If a 화면명세서 or 기능명세서 row genuinely specifies the collapsed/separate-screen pattern (e.g. "필터 진입 시 별도 화면으로 전환"), follow that instead — this is a default for when nothing says otherwise, not a rule that overrides an explicit source.
- Apply this consistently across runs/screens; don't let it vary screen-to-screen or run-to-run without a source-driven reason.

## 8. Wire real navigation between screens

**Mode A/C**: use whatever "next screen" information the 화면명세서 source gives directly — map it to the target screens' PageName (derived in step 2) and wire actual `<Link>` / `useNavigate()` calls. If the source is ambiguous about flow, fall back to inferring from content the same way Mode B does.

**Mode B**: infer navigation from each screen's 결과/화면반응 and 조건/트리거 content (and 기능정의서's Depth structure) to figure out which screens link to which, then wire it the same way.

**Mode C, if the source itself doesn't specify flow either**: infer from whatever content/context the 화면명세서 gives each screen — same spirit as Mode B's inference, just without 기능명세서 rows to draw on.

**Every mode**: wire real `<Link>` / `useNavigate()` calls — not `href="#"` placeholders — for any target screen that exists (already built, or built earlier in this same run). If a linked target isn't built yet, still point the route at the PageName path this command's naming convention would produce, so the link resolves automatically once that screen is generated in a later run.

## 9. Report back

Summarize:
- Which mode was used (Mode A: 화면명세서 + 기능정의서/명세서; Mode C: 화면명세서 only; Mode B: in-memory grouping from feature docs) — if Mode A/C, name the source file/link that was used
- **Mode C only**: restate plainly that this run is shallower than Mode A would be (no feature-doc business-rule depth), and suggest running the feature-definition/spec commands + re-running this one later for the fuller version — don't bury this in the middle of the summary, say it up front.
- Screens built this run (화면명, path, member 기능ID's where applicable — Mode C screens may not have any)
- Per screen, the row-to-UI mapping outcome: how many rows/states are visibly reflected vs. skipped (with reason) — flag any screen where something was skipped
- registry.js / navigation.js entries added
- Whether the TopNav screen switcher (step 4.6) was newly added this run or already existed
- Screens skipped because they already existed (in `이어서 추가` mode)
- If the scope was larger than what got built this run (per step 3.5), say so explicitly and name what's left for a follow-up run
- If the user cancelled, or a prerequisite was missing (per step 0's mode logic), say so plainly instead of reporting output
- Remind the user: `npm run dev`로 확인 가능하고, TopNav에서 정의서·명세서 탭과 나란히 두고 리뷰하면 됨