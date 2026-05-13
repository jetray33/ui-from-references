# Internal Prompt — Token Extraction

> The agent uses this template internally during **Phase 1 — LOCK**. It is NOT shown to the user. It is the structured reasoning the agent applies when extracting a design token set from references.

## Inputs

- `<refs>`: list of paths to reference images (PNG/JPG)
- `<prompts>`: list of paths to text prompts (the .txt files that describe design intent)
- `<existing>`: optional path to an existing partial `design-tokens.json` to extend

## Procedure

### Step 1 — Source priority

When the same token appears in multiple sources, USE THIS PRIORITY:

1. **Explicit text in a prompt file** (`Background: #070707` → authoritative)
2. **Existing locked tokens** (don't rebreak)
3. **Pixel-picked color from a reference image** (use only if no text source exists)

NEVER let pixel-picked colors override prompt text.

### Step 2 — Required tokens checklist

For each field below, decide: present, derived, or open question.

- [ ] `colors.bg.base`
- [ ] `colors.bg.raised`
- [ ] `colors.border.subtle`
- [ ] `colors.text.primary`
- [ ] `colors.text.secondary`
- [ ] `colors.text.inverse` (text color that goes ON accent-primary fills)
- [ ] `colors.accent.primary`
- [ ] `typography.fontFamily.display`
- [ ] `typography.fontFamily.body`
- [ ] `typography.scale.display.size`
- [ ] `typography.scale.title.size`
- [ ] `typography.scale.heading.size`
- [ ] `typography.scale.body.size`
- [ ] `typography.scale.caption.size`
- [ ] `typography.scale.micro.size`
- [ ] `radius.card`
- [ ] `radius.pill`
- [ ] `meta.viewport.width`
- [ ] `meta.viewport.height`
- [ ] `meta.locale`

For each item marked "open question", add a bullet to `design-dna.md::Open questions`.

### Step 3 — Derived tokens

These can be computed when the explicit value is missing:

- `colors.bg.elevated` = `colors.bg.raised` lightened by 5% (if not specified)
- `colors.border.strong` = `colors.border.subtle` lightened by 10% (if not specified)
- `colors.text.muted` = `colors.text.secondary` darkened by 40% (if not specified)
- `colors.accent.primary_pressed` = `colors.accent.primary` darkened by 8% (if not specified)
- All `radius.*` values not specified default to: `sm=8, md=12, card=16, pill=20, full=9999`

### Step 4 — Compose `design-dna.md`

Three sections only:

```markdown
# Design DNA — <project>

## Voice
<one line — premium/playful/edgy/minimal, primary accent, image emphasis>

## Forbidden
- <thing this design is NOT>
- <thing this design is NOT>
- ...

## Open questions
- <token name>: <why uncertain> — <agent's recommendation>
```

The "Forbidden" section is critical — it prevents drift later. Always include at least:
- "No emoji icons anywhere"
- "No inline hex codes in component files"
- "No Tailwind default colors (gray-500, blue-500, etc.)"

Add 2–4 project-specific bans (e.g. "No gradients on text", "No skeuomorphism", "No drop shadows on cards").

### Step 5 — Present to user

Always use the `question` tool. Sample message:

```
I extracted these tokens from the references. Open questions: <list>.

Approve as-is, ask me to change something specific, or paste alternate values.
```

Wait for explicit confirmation before saving as the locked file.

### Step 6 — Save

Write to `<project-root>/design-tokens.json` and `<project-root>/design-dna.md`.
Bump `design-tokens.json::meta.version` if this is a re-extraction.

## Failure modes to avoid

- **Token over-extraction**: don't invent 12 shades of gray when the design only uses 3. Each token must have at least one demonstrated use.
- **Token under-extraction**: if you see a 4th surface elevation in a reference, add it as `bg.elevated_2` — don't pretend it doesn't exist.
- **Mixing pixel-picked with prompt-text**: hold the line. Prompt text wins.
- **Skipping the user gate**: never proceed to Phase 2 without explicit user approval.
