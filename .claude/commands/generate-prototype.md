---
description: Read docs/feature-docs.xlsx (Feature Definitions + Feature Specifications) and generate real prototype screens under src/pages, wired into the existing registry/navigation/router — uses an externally-supplied 화면명세서 (link or file) when given one, otherwise groups screens itself
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
4. **A reviewer can get from any IA area to any other IA area with a click, not by typing a URL (step 4.6).** Extend the existing TopNav's screen switcher — don't leave 딜러/관리자 screens reachable only by manually editing the address bar.
5. **Fixed/sticky bottom bars are actually fixed, and never overlap scrollable content.** This covers two things that have both broken in previous runs: (a) the shell's own bottom nav must use real `position: fixed`/`sticky` CSS, not just markup placed near the bottom — verify it stays put after scrolling, not just visible before scrolling; (b) any screen with its own fixed bottom action bar (CTA buttons) must give scrollable content matching bottom padding equal to that bar's height, so nothing renders underneath it. Check both on every screen.
6. **A screen is real functional UI, not a placeholder card.** (Full rule in step 5.)

## 0. Parse input and detect mode

From `$ARGUMENTS`, classify each token:
- A URL (`http(s)://`) → a **화면명세서 link**.
- A local path (contains `/` or ends in a document extension: `.xlsx`, `.csv`, `.docx`, `.pdf`, `.md`) → a **화면명세서 file**.
- Anything else → a **scope filter** (기능ID pattern or IA area name), handled in step 1.

Check `docs/feature-docs.xlsx` exists and has both `Feature Definitions` and `Feature Specifications` tabs. **If either is missing, stop** and tell the user which command to run first (`/generate-feature-definition`, then `/generate-feature-spec`). These two are always required, regardless of mode.

Then set the mode:
- **Mode A (화면명세서 제공됨)**: a link or file was given in `$ARGUMENTS`. Read it in step 2A — don't fall back to Mode B just because its structure looks unfamiliar; interpret it (see step 2A).
- **No source given in `$ARGUMENTS`** — before defaulting to Mode B, do a quick, cheap look in `docs/` (`Glob`, not a deep read) for a plausible unclaimed 화면명세서 candidate: a file that isn't `feature-docs.xlsx` itself and whose name suggests screens/wireframes/UI spec (`화면`, `screen`, `wireframe`, `ui-spec`, or similar — this is a filename heuristic, not a content guess).
  - **Nothing plausible found** → proceed straight to Mode B, no need to ask or mention it; this is the common case and shouldn't add friction.
  - **Exactly one plausible candidate** → ask with `AskUserQuestion`: "docs/에 `{파일명}`이 있는데 화면명세서로 쓸까요?" with options `네, 이걸로` / `아니, 없이 진행`. Proceed to Mode A or B accordingly.
  - **More than one plausible candidate** → list them and ask which one to use (or none) — don't guess.
  - Never open/parse a candidate file's content to help decide whether it's "really" a 화면명세서 — filename-level heuristics only, for one confirmation question. Content interpretation happens in step 2A, after the user has actually confirmed it's the right file.
- **Mode B (화면명세서 없음)**: confirmed no 화면명세서 (explicitly none given, and either nothing found or the user declined the candidate). Proceed with in-memory grouping (step 2B) — a fully supported path, not a degraded fallback. (This command doesn't read a `Screen Specifications` tab from `docs/feature-docs.xlsx` on its own initiative — if the user wants that tab used, they pass its file as the 화면명세서 source explicitly, same as any other source.)

State which mode is active once, early in the run, so the user knows which source is driving the screens.

## 1. Parse scope

The scope filter token from step 0 (if any): a 기능ID pattern (`FN-DLR-*`), an IA area name, or nothing (→ every screen not yet built, determined by checking `src/pages/registry.js` for existing entries against the grouping in step 2).

## 2. Determine screens

**Mode A — read the externally-supplied 화면명세서:**
- **Reading the source**: a link → `WebFetch` first, retry with a connected Drive MCP tool on auth failure, otherwise ask the user to share it or point to a local copy — never fabricate content (same pattern as `/generate-feature-definition`). A local file → confirm it exists, then read per extension (`.xlsx`/`.csv` via `openpyxl`/`pandas`, `.docx` via `pandoc`/`python-docx`, `.pdf` via `pdfplumber`, `.md`/`.txt` directly).
- **Interpreting the structure**: this file was authored by someone else, so don't assume it matches this project's own column names. Look for the underlying concepts by whatever labels the source actually uses — a screen identifier/name, which features or requirements it covers, what's on the screen (components/sections/states), and what it links to next. Common variants: 화면명/페이지명/Screen name, 관련기능/연관기능/Feature IDs, 구성요소/컴포넌트/Elements, 다음화면/이동경로/Flow. If the structure is genuinely ambiguous (you can't tell which column is which), show the user a few rows and ask rather than guessing wrong and building screens from misread data.
- Once interpreted, pull every 기능명세서 row (MAIN/VAL/EXC/BR) for the 기능ID's the source associates with each screen (many-to-many is normal — a 기능ID may feed more than one screen).
- If the source gives a component/section order, use it directly for step 4's layout order — don't reinvent it. If it gives wireframe images or a flow diagram alongside, treat them as layout/navigation references, not something to copy literally.
- Derive **PageName** (PascalCase English) from the screen's name, same convention as Mode B, so file/component naming stays consistent either way.

**Mode B — group in-memory (this replaces a 화면명세서, it doesn't skip its job):**
- **Default grouping unit: Depth 1** from Feature Definitions, same principle a 화면명세서 would use — split a Depth 1 group into multiple screens only when the 기능명세서 rows themselves describe moving to a genuinely different screen/step (a distinct route), not just a modal or inline state change.
- For each screen, collect **every 기능명세서 row** belonging to its member 기능ID's. This row set is the screen's actual spec — treat it as such.
- Derive two names per screen: **화면명** (Korean) and **PageName** (PascalCase English) — e.g. "차량 상세 페이지" → `VehicleDetail`.
- Infer a component/section ordering yourself from the 기능명세서 rows' 결과/화면 반응 content, since there's no external source to read one from.

**Either mode:** keep the grouping deterministic (same inputs → same screens/names) so re-running the command doesn't fragment or duplicate screens across runs.

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
2. Add a screen-switcher dropdown: a button showing the current screen's name, opening a list of **every registered screen grouped by IA 영역** (사용자 IA / 딜러 어드민 IA / 관리 어드민 IA / etc., matching `navigation.js`'s existing grouping). Clicking an item navigates immediately and closes the dropdown.
3. **Drive this from `src/pages/registry.js` / `src/config/navigation.js` directly, not a hardcoded list.** Every future `/generate-prototype` run adds screens to those files anyway (step 4's file conventions) — if the dropdown reads from them dynamically, it stays correct automatically as more screens get built across runs, with no extra wiring needed each time.
4. **Only visible in the 프로토타입 tab** — hidden when the top-level view mode is 기능정의서/기능명세서, matching how the rest of TopNav's prototype-only controls already behave.
5. **Check before building**: if this switcher already exists in `TopNav.jsx` from a previous run, don't rebuild it — it should already be picking up newly-registered screens on its own (per point 3). Only add it if it's genuinely missing.

## 5. Build each screen — state fidelity is the whole point

**A screen is not done if it's a title, a feature-ID range, and a link/card pointing at "the real thing later."** Each `src/pages/{PageName}/index.jsx` must itself render the actual functional UI for that screen — real form fields, a real (mocked) listing with real domain content, real buttons that do the thing they say — not a summary card, not a "coming soon," not a placeholder that just restates the screen's name and ID range. If you notice yourself writing a component whose entire content is a heading + description + badge, stop — that's the index-page failure mode, not a screen. A directory listing all screens for review purposes is fine to build — **at a path other than `/`** (see non-negotiable #1 above) — but it's never a substitute for building the screens themselves, and every other route must contain the real thing.

**Definition of done, per screen, before moving to the next one:**
1. Every 기능ID in the screen's row set has its 기능정의 (목적) visibly realized in the markup — not just referenced in a comment.
2. Every 스펙ID row from step 2 is accounted for per the mapping rules below (rendered, or explicitly logged as skipped with a reason in the running list for step 9).
3. The screen contains real, specific content (see step 6) — if you can't point to a sentence or data value that came from this domain rather than being generic, it's not done.
4. The screen renders inside its area's shared shell from step 4, not with its own hand-rolled navigation.
5. Any login-gated behavior on this screen reads/writes the shared mock auth store from step 4.5, not local state.
If a screen doesn't clear these five, it isn't finished — don't move on to conserve time or attention. If the full scope for this run is large enough that finishing every screen to this bar is genuinely at risk, say so explicitly and propose a smaller batch (see step 3.5) rather than finishing all of them shallowly.

For each screen, before writing code, list its full row set from step 2 (스펙ID | 구분 | 조건/트리거 | 처리내용 | 결과·화면반응). Every row must show up in the rendered component in one of these ways:

- **`메인 플로우`** → the default render.
- **`유효성 검증`** → real validation wired to the actual form fields it applies to (not decorative) — use the exact quoted copy from 결과/화면 반응 as the error text, not a paraphrase. A reviewer triggers this by actually interacting with the form (leaving a field blank and submitting), not by flipping a switch.
- **`예외 처리` / `상태 분기`** → implemented as real interactive behavior on the same URL, reachable by actually using the prototype the way a real user would. Use lightweight local/mock state to make the trigger genuine rather than decorative — e.g. if a 상태 분기 row is "2건째 등록부터 결제 요구," track a mock submission count in component state so submitting a second listing for real triggers the payment view; if a row is "관리자 반려 시 사유 표시," a mock seeded value can stand in for the admin action having already happened, but the resulting screen should render from that state, not from a separate preview button. No dedicated state-switcher UI, no tabs, no "상태 미리보기" control — the interaction *is* the demonstration. One URL per screen; if several states surface on that URL over the course of using it, that's expected, and comments on that page naturally cover all of them (comment granularity here is per-page, not per-state — that's fine). Only give something a separate route/URL when it's a genuinely distinct destination screen (e.g. "결제 완료"), not because it's a different state of the same screen.
- **After building, self-check**: which rows are visibly reflected, which weren't (and why — e.g. a row was pure backend logic with no UI signature). Carry this into the step 9 report; don't silently drop a row.

**Layout section order:** in Mode A, follow whatever component/section order the 화면명세서 source gives directly — don't reinvent it. In Mode B, infer a sensible top-to-bottom order yourself from the 결과/화면 반응 content of the collected rows.

**File conventions (from `docs/README.md`, follow exactly):**
- `src/pages/{PageName}/index.jsx`
- Register in `src/pages/registry.js`'s `PAGE_REGISTRY` — append, don't reorder or remove existing entries.
- Add a label into `src/config/navigation.js`, grouped by IA 영역, matching the existing entries' shape.

**Frame convention (carries over from the earlier wireframe rule — same logic, now real code):**
- Screens grouped from **사용자 IA** (`FN-USER-*`) → mobile-first, and **stay mobile-width even on desktop** (centered fixed-width mobile frame, e.g. `max-w-[420px] mx-auto`) — this is a deliberate product decision (consumer app is mobile-only in spirit), not a responsive breakpoint choice.
- **The mobile frame must be visually distinct from the page around it — don't let both blend into the same flat color.** Give the frame a visible boundary (a border, a shadow, or a rounded-corner card edge) and/or make the outer page area (outside the frame) a genuinely different color from the frame's own background — e.g. a neutral gray page chrome behind a white/canvas-toned frame. A reviewer should be able to tell at a glance where "the phone screen" ends and "the review tool's page" begins; if the whole browser tab reads as one continuous flat surface, that's the bug.
- Screens grouped from **딜러 어드민 / 관리 어드민** (`FN-DLR-*` / `FN-ADM-*`) → full-width desktop layouts (dense tables, filters, sidebar-style nav) — genuinely different information density than the consumer screens, not the same components restyled.

## 6. Content must be domain-real, not placeholder — but UI copy stays Korean for now

**Two different things are being populated here, and they follow different language rules:**

- **Data values** (brand/model names, place names, price figures) — use real domain data: brand/model names from the IA (VinFast, Toyota, Hyundai, Kia, Mazda, Ford, Mercedes...), Hanoi districts, VND price formatting matching the IA's own convention (`triệu` units). These can stay in their natural real-world form (e.g. brand names, place names) since they're just data, not instructions the reviewer needs to parse.
- **UI copy** (headings, labels, button text, placeholders, messages, section titles — anything the interface is "saying" to the user) — **write in Korean, not Vietnamese**, for this stage. The team reviewing this prototype reads Korean; a Vietnamese-language interface is a future localization pass for the real product, not something this command should produce by default. Never use "Lorem ipsum", "상품명 1/2/3", generic "Item A/B/C", or round demo numbers everywhere — but the wording itself should be real Korean copy.
- **Critically: reuse the exact quoted UI copy already written into 기능명세서's 결과/화면 반응 column** rather than inventing new wording — that copy is already Korean and was written specifically so it could be dropped straight into the UI verbatim. This is usually the right source for user-facing text; don't translate it into Vietnamese, don't paraphrase it.

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

## 8. Wire real navigation between screens

**Mode A**: use whatever "next screen" information the 화면명세서 source gives directly — map it to the target screens' PageName (derived in step 2A) and wire actual `<Link>` / `useNavigate()` calls. If the source is ambiguous about flow, fall back to inferring from content the same way Mode B does.

**Mode B**: infer navigation from each screen's 결과/화면반응 and 조건/트리거 content (and 기능정의서's Depth structure) to figure out which screens link to which, then wire it the same way.

**Either mode**: wire real `<Link>` / `useNavigate()` calls — not `href="#"` placeholders — for any target screen that exists (already built, or built earlier in this same run). If a linked target isn't built yet, still point the route at the PageName path this command's naming convention would produce, so the link resolves automatically once that screen is generated in a later run.

## 9. Report back

Summarize:
- Which mode was used (Mode A with an externally-supplied 화면명세서, or Mode B in-memory grouping) — if Mode A, name the source file/link that was used
- Screens built this run (화면명, path, member 기능ID's)
- Per screen, the row-to-UI mapping outcome: how many 스펙ID rows are visibly reflected vs. skipped (with reason) — flag any screen where rows were skipped
- registry.js / navigation.js entries added
- Whether the TopNav screen switcher (step 4.6) was newly added this run or already existed
- Screens skipped because they already existed (in `이어서 추가` mode)
- If the scope was larger than what got built this run (per step 3.5), say so explicitly and name what's left for a follow-up run
- If the user cancelled, or a prerequisite tab was missing, say so plainly instead of reporting output
- Remind the user: `npm run dev`로 확인 가능하고, TopNav에서 정의서·명세서 탭과 나란히 두고 리뷰하면 됨