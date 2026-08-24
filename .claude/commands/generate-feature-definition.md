---
description: Read an IA doc (link or local file) and generate/append to a local feature-definition xlsx
argument-hint: [IA source: URL or docs/ file path, one or more] [area name (optional)]
allowed-tools: WebFetch, Bash, Read, Write, Edit, Glob, AskUserQuestion
---

# Generate Feature Definition Doc (기능정의서)

Follow these steps in order to build a 기능정의서(xlsx) from one or more IA sources. Output is always a local file — no Google Drive step. If the user wants a copy in Drive, they can drag-and-drop the local xlsx there afterward; that preserves formatting perfectly and doesn't depend on this command.

**Naming convention (applies everywhere in this command, no exceptions):** output artifact names — the local filename, the sheet name — are always in **English** (`Feature Definitions`, `feature-docs.xlsx`, etc.), even though every row's content (기능명, 기능정의, ...) stays in Korean. Don't switch a name to Korean just because the surrounding content is Korean.

## 0. Parse input

From `$ARGUMENTS`, split into tokens and classify each:
- **Source**: anything starting with `http://` or `https://` → treat as a **link** (this is the IA doc to *read from* — reading external links is fine, it's only writing to Drive that's been removed). Anything else → treat as a **local file path** (relative to project root, typically under `docs/`).
- **Area name** (optional): if the last token doesn't look like a URL or an existing file path, treat it as the IA area name (e.g. `"Dealer Admin IA"`). If omitted, infer it from the document title/top-level header, and ask the user only if genuinely ambiguous.

If no valid source is found, stop and ask the user for an IA link or file path. Do not guess.

**One document can contain multiple IA areas.** Google Docs "tabs" (URLs differing only in `#tab=...`) are sections of the *same* file, not separate files — fetching the doc once returns all tabs' content together. So a single source may span more than one area (e.g. "사용자 IA", "딜러 어드민 IA", "관리 어드민 IA" as consecutive top-level headings in one doc). Don't ask the user to re-run the command per tab; detect and split this within one run (see step 2).

## 1. Read the IA source(s)

- Each link with `WebFetch`.
- If it fails with an auth error (401/403): retry with a connected Google Drive MCP tool if one is available in this session (reading is fine — it's only the write-back-to-Drive path that's been removed from this command).
- If still unreadable, stop and ask the user to either share the doc as "Anyone with the link – Viewer" or drop a copy into the project's `docs/` folder. Never fabricate content.
- For local file paths: confirm existence with `Glob`/`Bash`. If missing, stop and tell the user.
- Read according to extension: `.md`/`.txt` → `Read` directly; `.docx` → `pandoc <file> -t plain` or `python-docx`; `.xlsx`/`.csv` → `pandas`/`openpyxl`; `.pdf` → `pdfplumber`/`markitdown`.

Whether from a link or a file, work only from what was actually read — never fill gaps from assumption.

## 2. Parse the IA structure

**First, split by area.** Scan the fetched content for top-level headings that name an IA area (e.g. "사용자 IA", "딜러 어드민 IA", "관리 어드민 IA", or whatever the doc's own section titles are — don't assume only these three). Treat each such section as its own area with its own prefix (step 3), all processed in this same run. If the user passed an explicit area name in `$ARGUMENTS` and the doc turns out to contain multiple areas, ignore the single override and use the doc's own section headings instead — ask the user only if a section's area type is genuinely unclear. Sections that are clearly not a feature IA (e.g. "운영준비 항목") are skipped — note them in the final report instead of forcing them into rows.

Then, within each area section, extract:
- **Depth 1**: top-level section/menu
- **Depth 2**: the leaf item that becomes one feature = one row
- Reuse any existing description / target user / phase / revenue notes already in the doc. Don't invent values — leave blank or mark "needs confirmation" instead.

An item with only Depth 1 (no Depth 2) is treated as one feature on its own.

## 3. Assign feature IDs

- Pick a prefix from the area name. Convention so far:
  - User-facing IA (buyer/seller) → `FN-USER-`
  - Dealer Admin IA → `FN-DLR-`
  - Management Admin IA → `FN-ADM-`
  - New area not seen before → derive a short English abbreviation from the area name and confirm with the user.
- **If the output file already exists** (see step 5) and already has rows with this prefix, continue numbering from the highest existing number instead of restarting at 1. Never reuse or collide with an existing ID.
- Zero-pad to 3 digits (`001`, `002`, ...).

## 4. Write the feature definition

For each Depth 2 item, write (don't just copy the IA doc's wording — rephrase into this format):
- **기능명**: short noun phrase
- **기능 정의**: 1–2 sentences in `목적 / Input / Output` format

This command produces the **feature definition doc only**. Detailed behavior / exception handling (기능명세서) is out of scope here — that belongs to `/generate-feature-spec`.

## 5. Create or update the local xlsx

Default output path: `docs/feature-docs.xlsx` (confirm with the user first if this doesn't match their project layout).

**If the file already exists**, don't append right away — first read it and show the user what's already there: existing areas, their ID ranges (e.g. `FN-USER-001~028`), and total row count. Then ask with `AskUserQuestion`: "기존 파일이 있습니다. 어떻게 할까요?" with options `이어서 추가`, `새 파일로 따로 만들기`, `취소`.
- `이어서 추가` → append new rows into the existing file.
- `새 파일로 따로 만들기` → leave the existing file completely untouched, and create a new file instead. Ask the user for a filename (don't silently overwrite `feature-docs.xlsx`; suggest something like `feature-docs-2.xlsx` or let them name it).
- `취소` → stop here without writing anything, existing file untouched.

**If the file doesn't exist**, create it fresh, no confirmation needed.

- Append new rows with openpyxl — never overwrite existing rows.
- Keep the sheet/column contract fixed:
  - Sheet name: `Feature Definitions` (기능정의서)
  - Header row 3 (row 1 = title, row 2 blank): `IA 영역 | Depth 1 | Depth 2 | 기능 ID | 기능명 | 대상 | Phase | 기능 정의 (목적 / Input / Output) | 수익 모델`
  - Header fill `#305496`, white bold Arial text; body Arial 9pt, wrap text
  - Recompute `freeze_panes` and `auto_filter` after appending
- `pip install openpyxl --break-system-packages` only if the import fails.
- No formulas needed here (single sheet, nothing to reference yet).

## 6. Report back

Summarize:
- Each area name found and the number of features added per area this run (if the source had multiple areas, list them all, not just one)
- The feature ID range assigned per area (e.g. `FN-USER-001 ~ 028`, `FN-DLR-001 ~ 014`, `FN-ADM-001 ~ 044`)
- Output file path
- If the user cancelled at the existing-file check, say so plainly and confirm nothing was written, instead of reporting output
- If the user chose `새 파일로 따로 만들기`, make clear in the report that this is a **separate new file** — name both the old (untouched) and new file paths so there's no confusion about which one has what
- Any non-feature sections skipped (e.g. operations-readiness checklists)
- Any fields left blank or marked "needs confirmation" because the source IA doc was unclear
- Remind the user, if relevant: "Drive에 올리려면 이 파일을 직접 드래그해서 업로드하면 서식까지 그대로 유지됩니다."