# Tailwind Mapping

> How `design-tokens.json` becomes `tailwind.config.ts`. Strict 1:1 mapping — no aliasing magic.

## Configuration

Target: **Tailwind v4** with `@theme` blocks (preferred) or v3 `theme.extend` (fallback).

### Tailwind v4 (preferred — CSS-only theme)

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* colors — every leaf in design-tokens.json::colors becomes a class */
  --color-bg-base: #070707;
  --color-bg-raised: #111018;
  --color-bg-elevated: #15131D;
  --color-border-subtle: #2A2832;

  --color-text-primary: #F5F5F7;
  --color-text-secondary: #848484;
  --color-text-muted: #444444;
  --color-text-inverse: #070707;

  --color-accent-primary: #25F95C;
  --color-accent-warning: #FBBF24;

  /* radius — leaves of design-tokens.json::radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-card: 16px;
  --radius-pill: 20px;
  --radius-full: 9999px;

  /* spacing — only if you DON'T want to use the default 4-pt scale */
  --spacing-0: 0;
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;

  /* typography */
  --font-display: 'Kanit', sans-serif;
  --font-body: 'Sarabun', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --text-display: 36px;
  --text-title: 20px;
  --text-heading: 16px;
  --text-body: 15px;
  --text-caption: 13px;
  --text-micro: 11px;

  --leading-display: 1.2;
  --leading-title: 1.3;
  --leading-heading: 1.4;
  --leading-body: 1.5;
  --leading-caption: 1.4;
  --leading-micro: 1.3;

  /* motion */
  --duration-fast: 120ms;
  --duration-default: 200ms;
  --duration-slow: 320ms;
}
```

### Tailwind v3 (fallback — for projects not yet on v4)

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#070707",
          raised: "#111018",
          elevated: "#15131D",
        },
        border: { subtle: "#2A2832" },
        text: {
          primary: "#F5F5F7",
          secondary: "#848484",
          muted: "#444444",
          inverse: "#070707",
        },
        accent: {
          primary: "#25F95C",
          warning: "#FBBF24",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        card: "16px",
        pill: "20px",
      },
      fontFamily: {
        display: ["Kanit", "sans-serif"],
        body: ["Sarabun", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        display: ["36px", { lineHeight: 1.2 }],
        title: ["20px", { lineHeight: 1.3 }],
        heading: ["16px", { lineHeight: 1.4 }],
        body: ["15px", { lineHeight: 1.5 }],
        caption: ["13px", { lineHeight: 1.4 }],
        micro: ["11px", { lineHeight: 1.3 }],
      },
      transitionDuration: {
        fast: "120ms",
        default: "200ms",
        slow: "320ms",
      },
    },
  },
  plugins: [],
};

export default config;
```

## Class usage cheat sheet

After mapping, these classes work directly in `.tsx`:

| What | Class |
|---|---|
| Page background | `bg-bg-base` |
| Card surface | `bg-bg-raised` |
| Border on card | `border border-border-subtle` |
| Primary text | `text-text-primary` |
| Muted text | `text-text-secondary` |
| Neon CTA fill | `bg-accent-primary` |
| Neon CTA text (on light fill) | `text-text-inverse` |
| Pill button | `rounded-pill h-12 px-6` |
| Card | `rounded-card p-5` |
| Display heading | `font-display text-display font-bold` |
| Body copy (Thai) | `font-body text-body` |
| Warning notice | `text-accent-warning` |

## Anti-patterns

- ❌ `style={{ backgroundColor: "#070707" }}` — use `bg-bg-base`
- ❌ `className="bg-[#070707]"` (arbitrary value syntax) — defeats the token system
- ❌ Adding a new color in `tailwind.config.ts` without adding it to `design-tokens.json` first — config drifts from tokens
- ❌ Using Tailwind's default `gray-500` etc. — only use project tokens

## Adding a new token

1. Add the value to `design-tokens.json`
2. Bump `design-tokens.json::meta.version`
3. Add the corresponding line to `globals.css` `@theme` (or `tailwind.config.ts`)
4. Regenerate code if needed
