---
name: ui-from-references
description: Turn vague creative references (mockup images, prompts, mood boards, existing screenshots) into shipped React+Tailwind UI code through a disciplined 4-phase pipeline (Lock → Manifest → Code → Verify). Use when the user wants to build a UI from references rather than from a Figma file, ESPECIALLY when the end goal is AI-generated code. Forbids the agent from inventing tokens or hallucinating icons. Calls `image-generation` skill for asset PNGs and uses an embedded Lucide icon subset for UI controls.
---

# UI from References — Skill

A disciplined pipeline that turns creative references into production-ready React + Tailwind code. Replaces "design in Figma, then translate" with "extract a locked spec, then generate code directly."

> **When to use:** the user wants UI built from images, prompts, or mood boards, and the deliverable is code (not a Figma file).
> **When NOT to use:** the user wants a Figma file as the final deliverable; a human designer will iterate visually.

---

## Core Operating Principles (NON-NEGOTIABLE)

1. **Lock before designing.** The agent MUST extract `design-tokens.json` and `design-dna.md` BEFORE generating any screen code. No exceptions.
2. **Tokens are the only source of color, type, spacing, radius.** The agent NEVER picks colors from a reference image during code generation — only from the locked tokens.
3. **No emoji icons. Ever.** Icons come from the embedded Lucide subset (`icon-library/lucide-icons.json`) or from explicitly listed library imports.
4. **Image assets are generated, not invented.** Hero illustrations, game art, splash artwork, empty states — anything raster — uses the `image-generation` skill. Filenames and prompts go in `asset-manifest.json`.
5. **Reference images are for LAYOUT and MOOD ONLY.** Never as the source for hex codes, font sizes, or component sizing.
6. **Output is React + Tailwind + shadcn/ui** unless the user explicitly chooses another stack.
7. **Verify with screenshots.** After codegen, screenshot the rendered UI and compare to references. Iterate ONLY on code.

---

## Pipeline

```
[references: images + prompts + mood]
            │
            ▼
┌───────────────────────────────────────┐
│ Phase 1 — LOCK (one-time per project) │
│   • Extract design tokens             │
│   • Write design DNA (3 lines)        │
│   • USER GATE: confirm tokens         │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│ Phase 2 — MANIFEST (per feature)      │
│   • List icons needed (from library)  │
│   • List image assets needed          │
│   • Generate image assets             │
│   • USER GATE: confirm manifest       │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│ Phase 3 — CODE (per screen)           │
│   • tailwind.config.ts from tokens    │
│   • Per-screen .tsx file              │
│   • Compose from shadcn primitives    │
│     + icon library + generated assets │
└───────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│ Phase 4 — VERIFY                      │
│   • Render in dev server              │
│   • Screenshot with Playwright        │
│   • Diff vs. reference                │
│   • Iterate in CODE only              │
└───────────────────────────────────────┘
```

---

## Phase 1 — LOCK

### Inputs
- Reference images (PNG/JPG at any resolution)
- Prompt files describing the design system (optional but preferred)
- Existing brand guidelines or theme docs (optional)

### Steps

1. **Read every reference.** Use the `Read` tool for prompt/markdown files and `look_at` for images.
2. **Identify explicit token sources.** Prompts that say `Background: #070707` are HIGHER PRIORITY than colors visually picked from images. Reason: prompts are authoritative; image pixels are aspirational and may have been over-/under-saturated by the generator.
3. **Fill in the schema** at `templates/design-tokens.json`. Every required field must be populated. If a field cannot be confidently filled, write `null` and add a note to `design-dna.md` listing the open question.
4. **Write `design-dna.md`** — exactly 3 sections:
   - **Voice** (1 line, e.g. "Premium dark casino, neon-confident, image-led")
   - **Forbidden** (3-5 bullets of what this design IS NOT — e.g. "no emoji, no skeuomorphism, no gradients on text")
   - **Open questions** (any null tokens with reasoning)
5. **Present to user.** Use the `question` tool: "Here are the extracted tokens and DNA. Approve, or tell me what to change."
6. **Lock.** Save final files in the project root or specified location.

### Output files
- `design-tokens.json` (see schema in `templates/`)
- `design-dna.md`

### Anti-patterns
- ❌ Skipping the user gate. Tokens MUST be confirmed before Phase 2.
- ❌ Inventing colors that aren't in any reference. If a token is missing, mark `null` and ask.
- ❌ Letting Tailwind defaults bleed into the token set. Project-specific values only.

---

## Phase 2 — MANIFEST

### Inputs
- Locked `design-tokens.json`
- Screen reference images and prompts
- List of features/screens to build

### Steps

1. **For each screen, enumerate UI elements.** Walk through the screen reference image. Categorize every element as:
   - **Token-shaped** (uses tokens directly — buttons, cards, text, dividers) → no asset needed
   - **Icon** → look up in `icon-library/lucide-icons.json`. If not present, propose an alternative or add to the library.
   - **Generated image** (hero art, game thumbnails, illustrations, splash logo) → goes in `asset-manifest.json`
2. **Build `asset-manifest.json`** at the project root. Schema in `templates/asset-manifest.json`. Each entry has:
   - `id`: stable kebab-case id used in code imports
   - `path`: where the PNG will live, e.g. `public/assets/game/mahjong-ways.png`
   - `aspect`: aspect ratio (1:1, 16:9, 9:16, etc.)
   - `prompt`: the exact text prompt to send to `gpt-5.4-image-2`
   - `refs`: optional list of reference image paths to attach
3. **Generate the image assets.** Invoke the `image-generation` skill (see `prompts/image-asset.md` for the request shape). Save PNGs to the manifest paths.
4. **Verify assets.** Each generated PNG must exist on disk and pass a quick `file` check (valid PNG, expected aspect ratio).
5. **Present to user.** "Here's the asset manifest with N icons from Lucide and M generated images. Approve, or tell me what to change."

### Output files
- `asset-manifest.json`
- All generated PNGs at their specified paths

### Anti-patterns
- ❌ Calling icons "to be designed later." Every icon must resolve NOW.
- ❌ Treating a UI element as an icon when it's actually a generated image. Game art ≠ icon.
- ❌ Generating images without putting them in the manifest first. Always manifest then generate.

---

## Phase 3 — CODE

### Inputs
- Locked `design-tokens.json`
- Approved `asset-manifest.json`
- Generated PNGs on disk
- Embedded Lucide icon library
- Screen reference image + prompt (for layout cues only)

### Steps

1. **Build `tailwind.config.ts`** (or extend it) from `design-tokens.json`. Use the mapping in `templates/tailwind-mapping.md`. Tokens become semantic Tailwind theme entries:
   - `design-tokens.json::colors.bg.base` → `theme.extend.colors.bg.base`
   - `design-tokens.json::radius.card` → `theme.extend.borderRadius.card`
   - etc.

   **Tailwind v4 only — REQUIRED `@theme` line.** Every v4 `@theme` block MUST include `--spacing: 0.25rem;` or every spacing utility (`pb-22`, `h-13`, `gap-1.5`, `size-6`, etc.) silently resolves to `0px`. See `templates/tailwind-mapping.md` → "Known gotchas" for the symptom and verification snippet. This is the single most common Phase 3 failure mode.
2. **For each screen, write one `.tsx` file** using:
   - Tailwind classes that reference the tokens (`bg-bg-base`, `text-text-primary`)
   - shadcn primitives (`Button`, `Card`, `Input`) installed via `npx shadcn@latest add ...`
   - Icons imported from `lucide-react` using exact names from the icon library JSON
   - Image assets imported from the manifest paths
3. **Compose top-down.** Frame → header → content rows → bottom nav. Each section uses semantic Tailwind classes.
4. **No inline hex codes.** Every color, every radius, every font size goes through a Tailwind token class. If something can't be expressed as a token class, the token set is incomplete — go back to Phase 1.

### Output files
- `tailwind.config.ts` (created or modified)
- `app/<screen>.tsx` files
- Optional: `components/ui/...` if new shadcn primitives are added

### Anti-patterns
- ❌ Inline `style={{ color: '#25F95C' }}`. Use `text-accent-neon` instead.
- ❌ Hand-rolling a button when shadcn already has one. Always check shadcn first.
- ❌ Importing an icon name not in the library JSON. Add it to the library or pick a substitute.

---

## Phase 4 — VERIFY

### Inputs
- Generated code
- Reference images
- A running dev server (or static export)

### Steps

1. **Render the screen.** Either:
   - Start dev server (`npm run dev`) and navigate to the route
   - Or run a static build + open
2. **Screenshot with Playwright** at the target viewport (iPhone 15 Pro Max = 440×956 logical for client screens).
3. **Side-by-side diff** the screenshot against the reference image. Identify gaps:
   - Color drift → token incorrect → fix tokens.json, regenerate config
   - Spacing wrong → fix Tailwind classes
   - Wrong icon → fix import
   - Missing asset → fix manifest, regenerate, re-import
4. **Iterate in code only.** Never edit the reference image. Never edit the screenshot.
5. **Stop when divergence is acceptable** (the user is the judge; offer 2-3 candidate fixes if uncertain).

### Output
- Verified working screen
- Notes on residual differences (if any)

### Anti-patterns
- ❌ Calling the screen "done" without screenshot verification.
- ❌ Editing reference images to match the code. References are immutable.
- ❌ Adjusting tokens to fix one screen if it breaks others. Tokens are global.

---

## Skill Files

| File | Purpose |
|---|---|
| `SKILL.md` | This file. The agent's primary instructions. |
| `templates/design-tokens.json` | Required schema for the locked token set. |
| `templates/components.md` | Reference component spec markdown. |
| `templates/screen-spec.md` | Per-screen breakdown template. |
| `templates/asset-manifest.json` | Schema for image+icon manifest. |
| `templates/tailwind-mapping.md` | How tokens map into `tailwind.config.ts`. |
| `icon-library/lucide-icons.json` | Embedded subset of Lucide icons with names and tags. |
| `prompts/token-extraction.md` | Prompt template the agent uses internally when extracting tokens from references. |
| `prompts/image-asset.md` | Prompt template for invoking the `image-generation` skill on each asset. |
| `prompts/screen-code.md` | Prompt template for generating React+Tailwind screen code. |
| `examples/pokerhouse/` | Reference example: tokens + manifest + one screen generated from the existing pokerhouse references. |

---

## Sub-skill Dependencies

- **`image-generation`** — required. Used in Phase 2 to produce all raster assets.
- **`playwright`** (built-in) — required for Phase 4 screenshots.

---

## Default Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React 19 | Largest AI training corpus → highest codegen quality |
| Styles | Tailwind v4 | Tokens map cleanly to `theme.extend.*`; semantic class names |
| Components | shadcn/ui | Copy-paste primitives; AI generates near-perfect uses |
| Icons | Lucide React | Tree-shakeable; embedded subset shipped with this skill |
| Images | `<img>` or `next/image` | From `public/assets/...` paths in the manifest |
| Routing | Whatever the host project uses | Skill is route-agnostic |

**Other stacks (Vue, Svelte, Qwik) require explicit user override at Phase 1.** Document the override in `design-dna.md` under Voice.

---

## Why this skill exists

Designing a UI in Figma when the goal is AI-generated code is a lossy detour:

| Concern | Figma path | This skill path |
|---|---|---|
| Token consistency | Manual styles, drift-prone | Single source `design-tokens.json` |
| Icon usage | SVG import (often broken in MCPs) | Direct lucide imports |
| Image assets | Cannot reliably import into Figma | Generated to disk, imported in code |
| Output format | Figma file → human translates | Code directly |
| Iteration | Edit Figma → re-export → re-translate | Edit code → screenshot → done |
| AI handoff | Lossy (must read Figma API) | Direct (AI reads structured input) |

The skill encodes the discipline of locking the design language BEFORE writing code, which prevents AI agents from drifting mid-project and producing inconsistent UI.
