# Verification Checklist

> Phase 4 gate. Run this list before declaring a screen done.

## Token Discipline (BLOCKING)

- [ ] No inline hex codes in any `.tsx` file generated this session
- [ ] No arbitrary Tailwind values (`bg-[#xxx]`, `text-[14px]`, `rounded-[7px]`)
- [ ] No Tailwind default palette classes (`bg-gray-500`, `text-blue-400`, etc.)
- [ ] Every used class resolves through tokens in `tailwind.config.ts` (or `@theme`)

### Quick audit command

Two-part audit. The first scans `.tsx` files only (skipping `globals.css` where the hex codes are the locked source of truth, and excluding lines that are doc comments containing the warning patterns).

```bash
# 1. Inline hex / arbitrary values in .tsx files (excluding comment lines)
grep -nE '#[0-9A-Fa-f]{6}\b|bg-\[#|text-\[#|border-\[#|rounded-\[' app/*.tsx components/*.tsx 2>&1 \
  | grep -vE '^\s*\*|//.*no bg-\['

# 2. Default Tailwind palette classes
grep -nE 'bg-(gray|zinc|slate|blue|red|green|yellow|amber|purple|pink|orange|neutral|stone)-[0-9]+|text-(gray|zinc|slate|blue|red|green|yellow|amber|purple|pink|orange|neutral|stone)-[0-9]+' app/*.tsx components/*.tsx
```

Both commands MUST produce no output. If either does: STOP, fix violations, re-run.

---

## Icon Discipline (BLOCKING)

- [ ] No emoji characters in any `.tsx` file
- [ ] Every icon imported from `lucide-react`
- [ ] Every imported icon name exists in `icon-library/lucide-icons.json`
- [ ] No inline `<svg>` for UI controls (decorative SVG illustrations are OK if they came from `asset-manifest.json` as PNGs)

### Quick audit command

macOS `grep` doesn't support `-P` (PCRE). Use Python for emoji detection:

```bash
python3 -c "
import re, glob
emoji_re = re.compile(r'[\U0001F300-\U0001FAFF\u2600-\u27BF]')
clean = True
for f in glob.glob('app/*.tsx') + glob.glob('components/*.tsx'):
    with open(f) as fp:
        for i, line in enumerate(fp, 1):
            if emoji_re.search(line):
                print(f'{f}:{i}: {line.rstrip()}')
                clean = False
print('(clean)' if clean else '')
"

# Icon import validation — every name in lucide-react import MUST be in the library JSON
node -e "
const fs = require('fs');
const lib = JSON.parse(fs.readFileSync('.sisyphus/skills/ui-from-references/icon-library/lucide-icons.json'));
const allowed = new Set(lib.icons.map(i => i.name));
const files = require('child_process').execSync('grep -rl \"from .lucide-react.\" app components || true', {encoding:'utf-8'}).split('\n').filter(Boolean);
for (const f of files) {
  const src = fs.readFileSync(f, 'utf-8');
  const match = src.match(/from\s+['\"]lucide-react['\"];?[^]*?import\s*{([^}]+)}/s);
  if (!match) continue;
  const used = match[1].split(',').map(s => s.trim()).filter(Boolean);
  for (const u of used) {
    if (!allowed.has(u)) console.error('FORBIDDEN ICON: ' + u + ' in ' + f);
  }
}
"
```

---

## Asset Discipline (BLOCKING)

- [ ] Every imported asset path exists on disk
- [ ] Every imported asset is declared in `asset-manifest.json`
- [ ] No orphan assets (entries in manifest with no importer)

### Quick audit command

```bash
# Verify every asset import resolves to a real file on disk
node -e "
const fs = require('fs');
const path = require('path');
const files = require('child_process').execSync('grep -rl \"public/assets\" app components || true', {encoding:'utf-8'}).split('\n').filter(Boolean);
for (const f of files) {
  const src = fs.readFileSync(f, 'utf-8');
  const matches = src.matchAll(/from\s+['\"]([^'\"]*public\/assets\/[^'\"]+)['\"]/g);
  for (const m of matches) {
    const target = m[1].replace(/^@\//, '').replace(/^\.\.\//, '');
    if (!fs.existsSync(target)) console.error('MISSING ASSET: ' + target + ' (imported by ' + f + ')');
  }
}
"
```

---

## Layout Discipline (NON-BLOCKING but recommended)

- [ ] Container max-width matches `design-tokens.json::meta.viewport.width`
- [ ] Bottom nav, if present, is fixed and the main content has `pb-22` (or equivalent) so it isn't covered
- [ ] No horizontal scroll on the target viewport
- [ ] All buttons hit minimum 44×44px touch target

---

## Accessibility (NON-BLOCKING but expected)

- [ ] Every interactive element has visible text OR `aria-label`
- [ ] Every `<img>` has `alt` (use `alt=""` for purely decorative images)
- [ ] Color contrast ≥ 4.5:1 for body text; ≥ 3:1 for large text — verify with WebAIM or `@axe-core/cli`
- [ ] Focus visible on every focusable element (default Tailwind `focus-visible:` styles)
- [ ] Heading order is correct (single `<h1>` per screen, then `<h2>`, etc.)

---

## Visual Verification (REQUIRED)

- [ ] Screenshot the screen at target viewport using Playwright
- [ ] Side-by-side with reference image
- [ ] Differences are explainable (e.g. "reference shows N games, ours shows M; data shape allows both")
- [ ] User has reviewed and approved (or noted residual differences)

### Playwright snippet

```ts
// scripts/screenshot.ts
import { chromium, devices } from "playwright";

const viewport = { width: 440, height: 956 };

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport,
  deviceScaleFactor: 3,
});
const page = await ctx.newPage();
await page.goto("http://localhost:3000/games");
await page.screenshot({ path: ".sisyphus/snapshots/games.png", fullPage: true });
await browser.close();
```

---

## Anti-pattern Sweep (BLOCKING)

The following patterns indicate the agent drifted from the discipline. If ANY appear, the code is rejected:

- Inline `style={{ ... }}` with color, font-size, or padding values that should be tokens
- `setTimeout`/`setInterval` for layout (use CSS animations / Framer Motion instead)
- Hardcoded data inline in JSX when it should be a typed const at top of file
- Untyped event handlers (`onClick={(e: any) => ...}`)
- `// @ts-ignore` or `// @ts-expect-error`
- `as unknown as <Type>` casts
- Importing a CSS file other than `app/globals.css`

---

## Sign-off

When all blocking checks pass and the user approves the visual, the screen is DONE.

Record completion in `<project-root>/.ui-from-references-log.md`:

```markdown
## <screen-id>

- Generated: <ISO timestamp>
- Tokens version: <design-tokens.json::meta.version>
- Manifest version: <asset-manifest.json::meta.version>
- Reference: <path>
- Notes: <any residual differences accepted by user>
```
