# Design DNA — pokerhouse-client

## Voice
Premium dark casino, neon-confident, image-led. Black canvas, single neon-green accent for active states and CTAs, generous breathing room, large vivid game artwork as the visual hero. Thai-first typography. No clutter, no sparkles, no skeuomorphism.

## Forbidden
- No emoji icons anywhere — use Lucide
- No inline hex codes — every color through Tailwind token classes
- No arbitrary Tailwind values (`bg-[#xxx]`, `text-[14px]`) — token classes only
- No Tailwind default palette (`gray-500`, `blue-400`) — project tokens only
- No gradients on body text or buttons (gradient backgrounds OK on hero artwork only)
- No skeuomorphism (no shiny gloss, no embossed buttons, no felt textures)
- No second accent color beyond `accent.warning` (amber) for cautions — neon green is the only brand color
- No drop shadows on cards by default — use border + subtle inset highlight via `effects.shadow.card`
- No English text in player-facing UI (operator/admin screens may use English)
- No `<svg>` inline for UI controls — all chrome icons come from `lucide-react`; illustrations come from generated PNGs

## Open questions
- `colors.accent.danger`: defaulted to `#EF4444` (Tailwind red-500 hex value). No reference yet showing destructive UI; revisit when first delete/cancel error state is designed.
- `typography.fontFamily.display`: Kanit is the canonical Thai display face but project font hosting must be confirmed. Falls back to `IBM Plex Sans Thai` then system sans.
- `typography.fontFamily.body`: Sarabun confirmed by THEMES.md A1 entry. Same fallback chain.
- `effects.glow.accent`: present in pokerhouse-1.png reference as an ambient atmospheric glow rising from the bottom of the device frame. Confirm with stakeholders before applying to every screen vs. only home/splash.
- `colors.bg.elevated`: derived from prompt as `#15131D`. Used for popover/sheet surfaces. Lift if visual separation feels insufficient in dark mode rendering.
