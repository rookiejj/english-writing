---
name: design-system
description: Use this whenever building, styling, or modifying any UI in this project — new prototype screens, existing component tweaks, colors, typography, spacing, buttons, cards, nav, forms, or any visual decision at all. This is the project's locked design system (colors, type scale, spacing, radius, and named components), not a suggestion — check it before inventing any visual value, whether you're running /generate-prototype or just asked to "change this button's color."
---

# Design System

The actual design tokens live in `DESIGN.md` in this same folder — read that file in full before making any visual decision. This file is just the pointer; don't try to style anything from this file alone.

## What to do

1. **Read `DESIGN.md` in this skill's folder, in full**, before writing or editing any UI. It's the single source of truth for colors, typography, spacing, radius, elevation, and named components — this file intentionally contains none of those values itself, so there's nothing here to go stale when `DESIGN.md` changes.
2. **Use its values exactly, don't approximate.** Whatever it specifies, use precisely — don't round to "something close," don't substitute a similar-looking default from elsewhere. If a named component already covers what you're building, use its exact spec rather than improvising a new one.
3. **Don't invent new tokens that duplicate existing ones.** If you need something `DESIGN.md` already defines (a button style, a card, an input, a nav element), reuse it. Only introduce something new for a genuine gap it doesn't cover, and keep it consistent with its existing scales and principles rather than freelancing a new visual style.
4. **`DESIGN.md`'s "Do's and Don'ts" (or equivalent) section is a hard boundary, not a style preference.** Follow it exactly, even when a particular screen seems like it would benefit from bending it.
5. **If `DESIGN.md` genuinely doesn't cover something**, say so explicitly rather than quietly inventing a value that looks plausible — propose something consistent with its existing scales and flag it as new, rather than deciding silently.

## Where this applies

Every prototype screen, every component, every one-off "can you tweak this" edit in this codebase. This isn't specific to `/generate-prototype` — it applies any time Claude is touching this project's UI, including outside that command.