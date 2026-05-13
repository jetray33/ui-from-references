# Screen Spec — &lt;screen-id&gt;

> One file per screen. Filled out by the agent during Phase 2 (after Lock, before Code).
> The agent uses this as a checklist; the user reviews it before code generation.

## Identity

- **Screen ID**: `&lt;e.g. c08-game-list&gt;`
- **Route**: `&lt;e.g. /games&gt;`
- **Auth required**: `yes | no`
- **Bottom nav active tab**: `&lt;none | home | wallet | promo | profile&gt;`
- **Reference image**: `&lt;path to reference PNG&gt;`
- **Reference prompt**: `&lt;path to prompt .txt, if any&gt;`

## Composition (top → bottom)

| # | Section | Component(s) | Token notes |
|---|---|---|---|
| 1 | Status bar | Native (skip in code) | — |
| 2 | Header | `Top Bar / Default` | title: "เกมทั้งหมด" |
| 3 | Filter row 1 | `Chip / Filter` × N | GameType: สล็อต/คาสิโนสด/... |
| 4 | Filter row 2 | `Chip / Filter` × N | Provider: ทั้งหมด/PG Soft/... |
| 5 | Results count | `text-caption text-text-secondary` | "พบ 247 เกม" |
| 6 | Grid | `Card / Game Tile` × N in CSS grid | 3 cols, gap-1.5 |
| 7 | Load more | `Button / Secondary` | "โหลดเพิ่ม" |
| 8 | Bottom nav | `Bottom Nav / 5-tab` | active tab varies |

## Assets needed

### Icons (from Lucide subset)
- `Search` (header)
- `LayoutGrid` (header view toggle)
- `ChevronLeft` (header back)
- `Menu`, `Home`, `Wallet`, `Gift`, `User` (bottom nav)

### Images (from asset-manifest.json)
- `game/mahjong-ways` (1:1)
- `game/lucky-neko` (1:1)
- `game/sweet-bonanza` (1:1)
- ... one entry per visible game card

## Data shape (for typed handoff)

```ts
type ScreenData = {
  gameType: "SLOT" | "CASINO" | "POKER" | "SPORT" | "FISHING";
  provider: string;
  totalCount: number;
  games: Array&lt;{
    id: string;
    name: string;
    provider: string;
    image: string;          // path matches asset-manifest.json entry
    badge?: "NEW" | "HOT";
  }&gt;;
};
```

## Layout rules

- Container is a fixed-width phone frame on desktop preview (`max-w-[440px]`), full-width on mobile.
- Vertical rhythm: `space-y-4` between top-level sections.
- All horizontal padding: `px-4` unless component-internal.
- Bottom nav is sticky/fixed at bottom; main content has `pb-22` so it isn't covered.

## State checklist

- [ ] Loading skeleton (game tiles → Skeleton with same aspect ratio)
- [ ] Empty state (no games match filter)
- [ ] Error state (provider fetch fails)
- [ ] Infinite scroll / pagination behavior
- [ ] RTL/LTR safe (text directionality)
- [ ] Accessibility (alt text on game art, focus order, escape closes filters)

## Open questions

> Filled by agent during spec. Resolved before Code phase.

- (none yet)
