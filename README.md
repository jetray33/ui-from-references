# ui-from-references

> Turn references into shipped UI code without a Figma detour.

A skill for AI agents that enforces a disciplined 4-phase pipeline:

1. **LOCK** the design language as `design-tokens.json` + `design-dna.md`
2. **MANIFEST** every icon and image asset before generation
3. **CODE** screens in React + Tailwind + shadcn/ui using only locked tokens
4. **VERIFY** with screenshot diffs against references

See [`SKILL.md`](./SKILL.md) for the full agent-facing spec.

---

## Why this exists

If your end goal is "AI generates production UI code", **a Figma file is a lossy detour**.

Agents that try to use Figma as an intermediate produce drift: colors picked from one screen don't match the next, components are hand-drawn copies instead of system primitives, icons end up as emojis or screenshots. Every "fix" in Figma must be re-translated to code, doubling the work.

This skill skips Figma entirely. The discipline lives in two checked-in files:

- `design-tokens.json` — single source of truth for color/type/spacing/radius
- `asset-manifest.json` — single source of truth for every image and icon

Code generates directly from those. Verification happens by screenshotting the rendered React.

---

## Quick start

### Prerequisites

- `OPENROUTER_API_KEY` set (for the embedded `image-generation` skill)
- Target codebase is React + Tailwind v4 (or v3 with extend config)
- shadcn/ui installed: `npx shadcn@latest init`
- Playwright available for verification screenshots
- Lucide installed: `npm i lucide-react`

### One-time setup per project

```bash
# 1. From your code repo root, scaffold the skill's outputs
mkdir -p public/assets

# 2. Drop the skill instructions into your agent's working context
# (use the `skill` tool from OpenCode: skill(name='ui-from-references'))

# 3. Provide references — typically a folder of mockup PNGs + prompt .txt files
ls .sisyphus/bake-off/client-flows/
# c01-splash.png + c01-splash.txt + ... etc.
```

### Run

Invoke the skill with a clear directive:

```
Use ui-from-references skill. References at .sisyphus/bake-off/client-flows/.
Build screens: c08-game-list, c16-deposit-landing.
Output to app/.
```

The agent will:

1. **Phase 1 — LOCK**: read every prompt + image, extract tokens, ask you to confirm.
2. **Phase 2 — MANIFEST**: list icons (from the embedded Lucide subset) and images (to generate). Ask you to confirm. Generate images.
3. **Phase 3 — CODE**: write `tailwind.config.ts` and `app/c08-game-list.tsx`, `app/c16-deposit-landing.tsx`.
4. **Phase 4 — VERIFY**: take screenshots, diff against references, iterate.

---

## File map

```
ui-from-references/
├── SKILL.md                          ← Primary agent instructions
├── README.md                         ← This file (human-facing)
├── VERIFICATION.md                   ← Phase 4 audit checklist
├── templates/
│   ├── design-tokens.json            ← Schema for the locked token set
│   ├── components.md                 ← Catalog of component patterns
│   ├── screen-spec.md                ← Per-screen breakdown template
│   ├── asset-manifest.json           ← Schema for the asset manifest
│   └── tailwind-mapping.md           ← How tokens → Tailwind config
├── icon-library/
│   └── lucide-icons.json             ← Curated Lucide subset (~120 icons)
├── prompts/
│   ├── token-extraction.md           ← Internal agent prompt for Phase 1
│   ├── image-asset.md                ← Internal agent prompt for Phase 2
│   └── screen-code.md                ← Internal agent prompt for Phase 3
└── examples/
    └── pokerhouse/                   ← Worked example (forthcoming)
```

---

## Design principles encoded in the skill

| Principle | How enforced |
|---|---|
| Tokens before code | Phase 1 user gate; cannot proceed without confirmation |
| No emojis | Phase 3 code prompt explicitly forbids; Phase 4 audit greps for emoji codepoints |
| No arbitrary Tailwind values | Phase 3 forbids `bg-[#xxx]`; Phase 4 audit greps for `bg-\[`, `text-\[`, etc. |
| No Tailwind default colors | Phase 3 forbids `bg-gray-500` etc.; Phase 4 audit greps for them |
| Icons from one library | Embedded Lucide subset; Phase 4 validates import names against it |
| Images are manifested | Phase 2 builds `asset-manifest.json`; Phase 4 validates every image import resolves |
| Verify against references | Phase 4 requires a Playwright screenshot before sign-off |

---

## Working with the skill

### When the user provides only an image, no prompt

The agent will still extract tokens but will flag many open questions. You'll be asked to fill them in. Expect more back-and-forth in Phase 1.

### When the user already has a `tailwind.config.ts` they want to keep

The agent will REUSE it. `design-tokens.json` is reverse-extracted from the existing config in Phase 1.

### When the references are wildly inconsistent (different styles per screen)

The agent will flag this in Phase 1 and ask: "Which reference is canonical? Or should I derive a unified system?" Don't proceed until decided.

### When an icon isn't in the embedded Lucide subset

The agent has three options in priority order:
1. Pick a close substitute from the subset
2. Propose adding the new icon to the subset (you approve)
3. If the concept truly isn't an icon, demote it to a generated image

### When a generated image looks bad

The agent will iterate on the prompt (up to 3 times by default). After that, you're asked to refine the prompt yourself or skip the asset.

---

## Cost discipline

| Resource | Typical cost per project |
|---|---|
| `gpt-5.4-image-2` per asset | $0.10–$0.20 |
| Default asset cap per project | 20 (override at Phase 2) |
| Total image budget | $2–$4 |
| Agent token costs | ~$0.50 per screen (Phase 3 generation + Phase 4 verification) |

If you hit the asset cap mid-project, the agent will pause and ask before exceeding it.

---

## Limitations

- **React + Tailwind only** (by default). Other stacks require explicit Phase 1 override.
- **No animation choreography.** The skill sets `motion.duration/easing` tokens but doesn't compose full animation timelines. Use Framer Motion separately.
- **No layout responsive scaling.** Each screen is generated for ONE viewport. Add breakpoint variants manually if needed.
- **No design system handoff to Figma.** Codegen is the deliverable; the skill won't sync back to a Figma library.

---

## Comparison with alternatives

| Approach | Strength | Weakness |
|---|---|---|
| **Figma → human translates** | Best for designer-led teams | Doubles work; drifts; AI handoff is lossy |
| **Figma → "code export" plugin** | Single click | Produces unmaintainable slop; ignores tokens |
| **ui-from-references (this)** | Direct code; token-disciplined; AI-friendly | No visual design tool; relies on prompts/refs for ideation |
| **AI yolos UI from a screenshot** | Fastest | No consistency across screens; impossible to maintain |

---

## Roadmap

- [ ] `examples/pokerhouse/` — full worked example using the existing client-flows references
- [ ] Storybook integration (auto-generate stories from components.md)
- [ ] Token diff tool (compare locked tokens across versions)
- [ ] Auto-screenshot CI gate (Phase 4 as a GitHub Action)

---

## Contributing

When you find a pattern the skill should enforce but doesn't, add it to:

- `SKILL.md` if it's a process rule
- `VERIFICATION.md` if it's an audit step
- `prompts/*.md` if it's an internal prompt refinement

Commit with a clear message; the skill picks up changes on next invocation.
