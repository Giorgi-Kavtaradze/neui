# NeUI Design Language Specification

> **The NeUI Standard** — An authoritative guide to the UI/UX design system, visual hierarchy, color semantics, typography, density rules, theming architecture, and component authoring conventions for **NeUI** (v2.1.8).
>
> Scope: this document governs the NeUI marketing/docs site (`app/`, `components/`, `styles/`) **and** every registry artifact shipped to consumers (`registry/`, `registry-neui/`, `public/r/styles/**`). If a design decision is not described here, it is not part of the language.

***

## 0. Design Principles

1. **Copy-and-own, never lock-in.** Everything ships as readable source (`registry:ui`, `registry:base`, `registry:theme`, `registry:font`). No black-box npm components.
2. **Tokens over hex codes.** No hardcoded colors, radii, or font stacks in components. Every visual decision resolves through a CSS variable defined in `styles/globals.css`, `styles/default.css`, or a generated `style-*.css` / theme file.
3. **Density is a feature.** NeUI pages are dashboards and docs, not marketing splash screens. Information density, scannability, and keyboard flow beat whitespace theatre.
4. **8 styles, one engine.** Vega, Nova, Maia, Lyra, Mira, Luma, Sera, Rhea are pure CSS overrides over the same semantic tokens and the same `cn-*` class contracts — never forks of component logic.
5. **Dual primitives, single API shape.** All 19 in-house components ship in both **Base UI** (`registry-neui/bases/base`) and **Radix UI** (`registry-neui/bases/radix`) variants with identical composition semantics.
6. **Docs are the product.** Live previews, copyable source, and the `shadcn` CLI path (`npx shadcn add @neui/...`) are first-class surfaces, not afterthoughts.

***

## 1. Core Axiom: Semantics Before Decoration

In NeUI, color, type, and elevation are **semantic signals**, not decoration. Every token answers the question *"what does this mean?"* before *"what does this look like?"*.

| Token Group | CSS Variables | Exclusive Purpose | Rules & Constraints |
| :---------- | :------------ | :---------------- | :------------------ |
| **Ink / Primary** | `--primary` / `--primary-foreground` | Primary actions, key buttons, strongest emphasis | Near-black (`oklch(0.205 0 0)`) in light mode, near-white (`oklch(0.922 0 0)`) in dark mode. Never a saturated hue. |
| **Surfaces** | `--background`, `--card`, `--popover`, `--muted`, `--surface` | Page, card, popover, and subtle step surfaces | Light: pure white page/card, `oklch(0.97 0 0)` muted step. Depth comes from hairlines + steps, not shadows. |
| **Structure** | `--border`, `--input`, `--ring` | Hairline borders, input frames, focus rings | Borders are `oklch(0.922 0 0)` light / `white 10%` dark. Focus is always `ring` at 50% opacity, 3px (`focus-visible:ring-3`). |
| **Status** | `--destructive`, `--success`, `--info`, `--warning` (+ `-foreground`) | Feedback, alerts, validation, badges | Light `-foreground` is dark-saturated (`red-800`, `emerald-900`, `violet-900`, `yellow-900`); dark mode uses `*-600/500`. Always pair bg tint + tinted text — never solid saturated badges. |
| **Inversion** | `--invert` / `--invert-foreground` | Deliberate polarity flips (dark chips on light UI and vice versa) | `zinc-900 → zinc-50` light; `zinc-700 → zinc-50` dark. Use sparingly. |
| **Charts** | `--chart-1` … `--chart-5`, `--site-chart-1` … | Data visualization ramps | Neutral ramp by default (oklch grays); theme overlays recolor. No chart color may leak into buttons or text. |
| **Sidebar** | `--sidebar*` (8 vars) | App/docs navigation surfaces | Independent surface token set so sidebars can invert polarity without touching page tokens. |
| **Code** | `--code`, `--code-foreground`, `--code-highlight`, `--code-number` | Code blocks, pretty-code figures, line numbers | Code surfaces derive from `--surface`. Shiki light/dark variables switch via `.dark` — never hardcode code colors. |

> **Rule 1.1 — No raw color in components.** `bg-[#...]`, `text-red-500`, `border-zinc-200` and friends are forbidden inside `registry/**` and `registry-neui/**`. Use `bg-primary`, `text-muted-foreground`, `border-border`, `bg-success/10 + text-success-foreground`, etc.
> **Rule 1.2 — Pastel-soft status.** Status pills = soft same-hue tint background + darker same-hue text (`text-xs font-medium`). Never solid saturated badges.
> **Rule 1.3 — Focus is sacred.** Every interactive primitive carries `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3` (or the Base-UI `data-focus-visible:` equivalent). Removing it is a defect.

***

## 2. Typography Architecture

### A. Font Roles

| Role | Token / Variable | Source | Usage |
| :--- | :--------------- | :----- | :---- |
| **Site body + UI** | `font-site-sans` → `--site-font-sans` → `--font-inter` | `styles/default.css`, `lib/fonts.ts` (Inter) | Entire docs/marketing chrome: header, sidebar, footer, prose. Applied via `font-site-sans` on shell containers. |
| **Preview body** | `--font-sans` (`--font-inter` default) | `styles/globals.css` `:root` | The component preview surface. Swappable per user-selected registry font. |
| **Preview heading** | `--font-heading` (`--font-inter` default) | `styles/globals.css` + `registry/fonts.ts` | Independent heading voice; `inherit` resolves to body font via `getInheritedHeadingFontValue()`. |
| **Code / Data** | `--font-mono` (system mono stack) + `--font-site-mono` | `styles/globals.css`, `styles/default.css` | Code blocks, CLI snippets, registry JSON, tabular counts. Always `tabular-nums` for numbers. |
| **Registry fonts** | `font-<name>`, `font-heading-<name>` items | `lib/font-definitions.ts` (Geist, Inter, Manrope, Space Grotesk, IBM Plex Sans, JetBrains Mono, Geist Mono, Noto Serif, Playfair Display, …) | User-pickable via the Create/Design-System configurator; shipped as `registry:font` dependencies. |

```tsx
// Canonical shell wiring — app/layout.tsx
<html className={cn(fontVariables, "overscroll-none")}>
  <body className={cn("[&:not(:has([data-slot=component-preview]))]:font-site-sans", "style-nova")}>
```

### B. Type Scale & Hierarchy

| Level | Spec | Tailwind | Notes |
| :---- | :--- | :------- | :---- |
| Page / category title | 20–24px semibold, tight tracking | `text-xl/2xl font-semibold tracking-tight` | Catalog heroes and docs H1. Always paired with a count or description. |
| Section heading | 16–18px semibold | `text-base/lg font-semibold` | Preview group headers, docs H2. |
| Component title (alert/dialog) | 16–18px medium | `text-base/lg font-medium` | Vega uses `text-lg`; Nova compacts to `text-base`. Both valid per style. |
| Body / preview copy | 13–14px normal | `text-sm text-foreground` | Default for all component content (`cn-alert`, `cn-dialog-description`, table cells). |
| Column headers / eyebrows | 11–12px medium, uppercase, wide | `text-xs font-medium text-muted-foreground uppercase tracking-wider` | Table headers, card eyebrows, sidebar group labels. |
| Metadata / code | 11–12px mono | `font-mono text-xs text-muted-foreground` + `tabular-nums` | CLI commands, counts, line numbers, registry paths. |
| Descriptions | 14px balanced | `text-sm text-muted-foreground text-balance md:text-pretty` | Long-form readability rule — always `text-balance`, `md:text-pretty`. |

> **Rule 2.1 — Two voices max per surface.** Site chrome speaks Inter (`font-site-sans`); previews speak the selected registry font. Never mix a third display face into UI surfaces.
> **Rule 2.2 — Mono means machine.** IDs, CLI strings, counts, and code are always `font-mono`. Prose never is.

***

## 3. Surface, Depth & Layout System

### A. Dual-Surface Shell (Site Chrome vs. Preview Surface)

| World | Tokens | Implementation | Purpose |
| :---- | :----- | :------------- | :------ |
| **Site chrome** (`site-*` namespace) | `--site-background`, `--site-foreground`, `--site-card`, `--site-border`, `--site-muted`, … | `styles/default.css` → `@theme inline` maps `--color-site-*`; components use `bg-site-background`, `text-site-foreground`, `site-rounded-*` | Docs/marketing identity. Immune to user theme/style selection — the showroom walls never repaint when the exhibit changes. |
| **Preview / registry surface** (bare namespace) | `--background`, `--card`, `--popover`, `--muted`, `--surface`, … | `styles/globals.css` `:root` / `.dark` + `registry/styles/style-*.css` overlays | What the user actually copies. Fully driven by selected base + style + theme + font. |

The split is enforced in `app/layout.tsx`: the `<body>` carries `style-nova` (preview default) while header/footer/captions bind `bg-site-*` / `text-site-*` / `font-site-sans` explicitly.

### B. Depth Mechanics

* Depth = **hairline borders + surface steps**, never heavy drop shadows.
* Standard card: `bg-card text-card-foreground rounded-lg border` (+ `border-grid` = `border-border/50 dark:border-border` for dense grids).
* Overlays only (popover, dropdown, tooltip, dialog, drawer, command menu): `shadow-md` + `ring-1 ring-foreground/10`.
* Soft section washes: `section-soft` utility (`from-background to-surface/40 bg-gradient-to-b`).
* Code figures: `bg-code text-code-foreground rounded-lg` with title bar at 4% foreground mix — see `styles/globals.css` `[data-rehype-pretty-code-figure]`.

### C. Spacing, Radius & Container Contracts

```css
/* Spacing rhythm — Tailwind spacing scale, semantic usage */
--spacing * 1   (4px)   → icon padding, tight gaps
--spacing * 2   (8px)   → inline gaps, chip padding
--spacing * 4   (16px)  → card padding (Vega p-6 / Nova p-4 per density style)
--spacing * 6   (24px)  → section gaps
--spacing * 8+  (32px+) → page section separation

/* Radius — base --radius: 0.625rem; styles shift the whole ladder */
--radius-sm: calc(var(--radius) - 4px)   /* inputs, kbd */
--radius-md: calc(var(--radius) - 2px)   /* buttons, badges */
--radius-lg: var(--radius)               /* cards, popovers */
--radius-xl: calc(var(--radius) + 4px)   /* dialogs, drawers */
--radius-full: 9999px                    /* pills, avatars */

/* Site containers — styles/globals.css @utility */
container-wrapper  → mx-auto w-full px-4 lg:px-6 (max 2xl+2rem at 3xl)
container          → mx-auto max-w-[1400px] px-4 lg:px-6 (max-7xl at 3xl)
```

Header height is a contract: `--header-height: --spacing(14)` (56px), announcement slot `--announcement-height`, sticky offset `--site-top-offset: calc(var(--header-height) + var(--announcement-height))`. Sidebars: `--blocks-sidebar-width: 256px`, `--customizer-sidebar-width: 240px`.

***

## 4. Theming Architecture: Base × Style × Theme × Font

NeUI theming is a **four-axis configurator** (`registry/config.ts` → `designSystemConfigSchema`), resolved server-side and baked into versioned registry JSON under `public/r/styles/**`.

```
user picks ─┬─ base:  base (Base UI) · radix (Radix UI) · aria (React Aria, config-only)
            ├─ style: vega · nova · maia · lyra · mira · luma · sera · rhea
            ├─ theme: neutral · stone · zinc · mauve · olive · mist · taupe (+ accents: red→teal …)
            ├─ font:  inter · geist · manrope · space-grotesk · outfit · … (+ independent heading font)
            └─ radius / menuColor / menuAccent / pointer / rtl
                  │  scripts/build-registry.mts
                  ▼
         public/r/styles/<base>-<style>/<theme>/<name>.json?v=<deploymentId>
```

### A. Axis Definitions

| Axis | Source of Truth | What It Controls |
| :--- | :-------------- | :--------------- |
| **Base** | `registry/bases.ts` (`base`, `aria`, `radix`); in-house dual source `registry-neui/bases/{base,radix}` | Primitive dependency (`@base-ui/react` vs `radix-ui`), `data-*` vs `aria-*` state selectors, trigger/component wiring. |
| **Style** (density + geometry voice) | `registry/styles.tsx` metadata + `registry/styles/style-<name>.css` | Padding/margin density, radius posture, icon sizing, trigger typography — via `cn-*` class overrides scoped under `.style-<name>`. |
| **Theme** (color voice) | `registry/themes.ts` (full) filtered to 7 `registry/base-colors.ts` base colors + accent overlays | ONLY CSS variables (`cssVars.light/dark/theme`). Never layout, never class structure. |
| **Font** | `registry/fonts.ts` ← `lib/font-definitions.ts` | `registry:font` items setting `--font-sans` / `--font-heading`. |

### B. Style Voices (the 8 dialects)

| Style | `registry/styles.tsx` tagline | CSS posture (`style-*.css`) | When to reach for it |
| :---- | :---------------------------- | :-------------------------- | :------------------- |
| **Vega** | "Clean, neutral, and familiar" | Generous: `p-6` dialogs, `size-16` media, `text-lg` titles, `rounded-md/xl` | Default-safe choice; marketing-adjacent product UI. |
| **Nova** | "Reduced padding and margins" | Compact: `p-4` dialogs, `size-10` media, `text-base` titles, `rounded-lg` | Dense dashboards; **site default** (`<body class="style-nova">`). |
| **Maia** | "Rounded, with generous spacing" | Soft + roomy: large radii, airy gaps | Friendly SaaS, onboarding flows. |
| **Lyra** | "Boxy and sharp. For mono fonts" | Minimal radius, structural | Devtools, terminal-adjacent UI, mono pairings. |
| **Mira** | "Made for compact interfaces" | Tightest density | Data grids, admin tables, command palettes. |
| **Luma** | "Fluid, luminous, and soft" | Luminous washes, pill shapes | Hero/feature surfaces. |
| **Sera** | "Editorial and typographic" | Type-led hierarchy, restrained chrome | Docs, blogs, content-heavy pages. |
| **Rhea** | "Like Luma but compact" | Luma softness at Mira density | Dense but warm operational UI. |

> **Rule 4.1 — Styles override classes, themes override variables.** A `style-*.css` file may only redefine `cn-*` `@apply` blocks under its `.style-<name>` scope. A theme file may only set CSS vars. Cross-contamination is a defect.
> **Rule 4.2 — `cn-*` contracts are stable.** Component TSX exposes `cn-accordion-trigger`, `cn-alert-dialog-content`, `cn-popover-content`, … as styling API. Styles restyle them; TSX never renames them per style.

### C. Dark Mode & Registry Versioning

* Dark mode is class-driven (`.dark`), toggled by `components/theme-provider.tsx` (next-themes) with `META_THEME_COLORS` (`#ffffff` / `#09090b`) pre-painted to avoid flashes.
* Registry JSON is immutable per deploy: `next.config.mjs` appends `?v=<VERCEL_DEPLOYMENT_ID|commit|local>` to every `/r/styles/**` URL and serves year-long immutable cache headers when `?v=` is present.
* RTL, pointer cursor (`button{cursor:pointer}`), `menuColor`/`menuAccent` are config flags in the `registry:base` payload — never per-component branches.

***

## 5. UI Primitives & Signature Patterns

### A. Site Chrome (the showroom, not the exhibit)

| Element | Implementation | Spec |
| :------ | :------------- | :--- |
| **Site header** (`components/site-header.tsx`) | `bg-site-background text-site-foreground font-site-sans`; 3-col grid `auto 1fr auto` (xl: `1fr auto 1fr`); height `calc(var(--header-height) - 1px)` + 1px `bg-site-border/80` rule | Left: mobile nav + `Logo`; center: `DesktopNav` (Components, Docs); right: command palette (`CommandMenuLazy`), theme toggle, X/GitHub links. |
| **Command palette** (`command-menu*.tsx`) | Derived from `lib/nav-config.tsx` single source (`navEntries` → `navFlatItems`) | Only internal routes; `soon` items render disabled, never as badges. |
| **Site footer** (`components/site-footer.tsx`) | `bg-site-background`, top `bg-site-border` hairline, `container` `py-8 md:py-10`, compact bottom bar | Product + Community link groups; `text-sm`, `text-site-muted-foreground → hover:text-site-foreground`; bottom bar with MIT line + X/GitHub icons. |
| **Progress + scroll** (`top-progress-bar.tsx`, `scroll-to-top.tsx`) | Suspense/Nuqs-safe client islands | Route-change progress; scroll restoration. Never restyled per theme. |

### B. Catalog & Docs Surfaces

| Pattern | Implementation | Spec |
| :------ | :------------- | :--- |
| **Catalog hero** (`catalog-page-hero.tsx`) | Category title + live count (`getComponentsTotalCount()` / `getComponentCategories()`) | Title `tracking-tight font-semibold`; count in `font-mono tabular-nums`; description `text-balance`. |
| **Component preview** (`docs-component-preview.tsx`, `component-preview-tabs.tsx`) | `[data-slot=component-preview]` scope opts OUT of `font-site-sans` (see layout) so the registry font speaks | Preview / Code / CLI tabs; `Copy` + `npx shadcn add @neui/...` affordances; preview bundles prebuilt by `pnpm components:packages`. |
| **Source view** (`component-source*.tsx`, `code-tabs.tsx`, `code-block-command.tsx`) | Shiki via `rehype-pretty-code` on `--code*` tokens | Title bar `font-mono text-xs`; sticky line numbers (`--code-number`); highlight wash (`--code-highlight`). |
| **Docs sidebar/TOC** (`docs-sidebar.tsx`, `docs-toc.tsx`, `docs-page-tree.ts`) | `content/docs/**` (Fumadocs) + generated category trees | 13px labels, 28–32px rows, subtle active fill; TOC right-rail on desktop. |
| **SEO/OG** (`lib/seo.ts`, `app/og/**`, `json-ld.tsx`) | CDN-cached dynamic OG per page; JSON-LD per category | Every category page ships title/description/keywords from `lib/components.ts` SEO map. |

### C. Registry Component Anatomy (what consumers copy)

Every shadcn primitive lives at `registry/bases/{base,radix}/ui/*.tsx`; every in-house primitive at `registry-neui/bases/{base,radix}/neui/*` (+ `data-grid/`, `event-calendar/`, `gantt/` subfolders). Anatomy:

```tsx
// 1. cn-* styling contract (Nova excerpt) — registry/styles/style-nova.css
.style-nova {
  .cn-alert-dialog-content {
    @apply bg-popover text-popover-foreground ring-foreground/10 gap-4 rounded-xl p-4 ring-1 duration-100 ...;
  }
}
// 2. TSX binds the contract, cva enumerates variants — never inline colors
<div data-slot="alert-dialog-content" className={cn("cn-alert-dialog-content", className)} ... />
// 3. _registry.ts declares files + deps + cssVars deltas per item
```

Key contracts: `cn-button*` (variants via `cva`: default/secondary/outline/ghost/destructive + sizes), `cn-badge*` (neutral `default` pill; status via soft tints), `cn-input*` (`border-input`, `ring-ring/50` focus), `cn-card*` (`bg-card rounded-lg border`), `cn-dialog/popover/tooltip/sheet/drawer*` (overlay `bg-black/10 + backdrop-blur-xs`, content `rounded-xl ring-1 shadow-md`).

### D. The 19 In-House Components

| Component | Path (`registry-neui/bases/*/neui/`) | Purpose |
| :-------- | :---------------------------------- | :------ |
| `alert.tsx` | `neui/alert.tsx` | Extended alert with `success/info/warning/invert` voices on `--success/--info/--warning/--invert` tokens |
| `autocomplete.tsx` | `neui/autocomplete.tsx` | Combobox + scroll-area command list |
| `badge.tsx` | `neui/badge.tsx` | Neutral + soft-status pill system |
| `date-selector.tsx` | `neui/date-selector.tsx` | Preset + calendar date picking |
| `filters.tsx` | `neui/filters.tsx` | Faceted dashboard filter bar |
| `frame.tsx` | `neui/frame.tsx` | Device/browser preview frame |
| `icon-stack.tsx` / `icon-tile.tsx` | `neui/icon-*.tsx` | Overlapping avatar/icon stacks; single-icon tiles |
| `kanban.tsx` | `neui/kanban.tsx` | Drag-and-drop board (`@dnd-kit`) |
| `number-field.tsx` | `neui/number-field.tsx` | Stepped numeric input |
| `phone-input.tsx` | `neui/phone-input.tsx` | International phone field (`react-phone-number-input`) |
| `rating.tsx` | `neui/rating.tsx` | Star/heart rating input + display |
| `scrollspy.tsx` | `neui/scrollspy.tsx` | Scroll-linked section nav |
| `sortable.tsx` | `neui/sortable.tsx` | Sortable lists (`@dnd-kit/sortable`) |
| `stepper.tsx` | `neui/stepper.tsx` | Multi-step wizard + progress |
| `timeline.tsx` | `neui/timeline.tsx` | Vertical event timeline |
| `tree.tsx` | `neui/tree.tsx` | Accessible tree view (`@headless-tree`) |
| `data-grid/` | `neui/data-grid/` | Virtualized table (`@tanstack/react-table` + `react-virtual`) |
| `event-calendar/` | `neui/event-calendar/` | Month/week/day scheduling grid |
| `gantt/` | `neui/gantt/` | Project timeline with dependencies |

Plus the realistic composition layer: **1000+ `c-*` examples** composed from these primitives into dashboard flows (tables, forms, charts, kanban boards) — shown in situ, never as isolated dots.

***

## 6. Motion, Micro-Interaction & Iconography

### A. Motion Principles

| Principle | Description | Implementation |
| :-------- | :---------- | :------------- |
| **Purposeful** | Every animation answers feedback, transition, or guidance | Accordion/collapsible height (200ms), overlay fade+zoom (100ms), drawer slide (300ms) |
| **Performant** | GPU properties only; no layout thrash | `transform` + `opacity` (`fade-in-0`, `zoom-in-95`, `slide-in-from-*`); `tw-animate-css` primitives |
| **Respectful** | Honor reduced motion | `motion` (Motion One) + `@media (prefers-reduced-motion: reduce)` gates on celebratory effects |
| **Subtle** | UI whispers, pages breathe | Micro 100–150ms, UI 200ms, route/sheet 300ms, celebration ≤500ms |

```css
/* Canonical overlay Choreography — style-nova.css */
.cn-alert-dialog-overlay { @apply data-open:fade-in-0 data-closed:fade-out-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs; }
.cn-alert-dialog-content { @apply data-open:fade-in-0 data-closed:fade-out-0 data-open:zoom-in-95 data-closed:zoom-out-95 duration-100; }
.cn-popover-content      { @apply data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 ... duration-100; }
```

```tsx
// Celebration micro-interactions live in components/ui/ + components/neui/
Confetti             // canvas burst — success milestones only
CoolMode             // pointer particle trail — playful CTAs only
NumberTicker         // count-up KPIs — tabular-nums, respects reduced motion
InteractiveHoverButton // expanding-dot CTA — landing/empty states only
Lens / PixelImage / Globe // zoom + reveal + 3D — hero/feature surfaces only
```

### B. Timing Scale

```
micro-interaction   100–150ms  → focus rings, toggles, hovers, overlay fade/zoom
ui-transition       200ms      → accordion, collapsible, dropdown, tooltip, carousel (embla)
page-transition     300ms      → sheets, drawers, route progress
attention           ≤500ms     → confetti, number-ticker, onboarding spotlights
marquee             linear     → marquee-left/right/up keyframes (globals.css) for logo rails
```

### C. Iconography

* **Product/UI icons:** `lucide-react` (site default per `components.json` `iconLibrary: lucide`) + Tabler/Remix/Hugeicons where the registry icon library demands it (`optimizePackageImports` covers all five).
* **Nav brand glyphs:** Hugeicons (e.g. `FigmaIcon` wrapper in `lib/nav-config.tsx`) where Lucide dropped brand icons — always `currentColor` strokes inheriting container color.
* **Sizing contract:** row icons `size-4`, media icons scale per style (`size-6` Nova alert-dialog media → `size-8` Vega), avatar fallbacks inherit. Never hand-size one-offs.
* **No emoji as UI.** Emoji appear only in docs prose kill-lists (❌/✅) — never as component icons, bullets, or status signals.

***

## 7. Accessibility & Responsive Requirements

### A. WCAG 2.1 AA Compliance (non-negotiable)

* **Contrast:** ≥4.5:1 body, ≥3:1 large text. Soft-status pills pair dark-saturated text (`red-800/emerald-900/violet-900/yellow-900`) on tints precisely for this.
* **Focus:** visible `ring-3 ring-ring/50 + border-ring` on every interactive element; Base-UI uses `data-focus-visible:` parity selectors (`cn-radio-group-item-aria`). `extend-touch-target` utility guarantees 44px coarse-pointer targets.
* **Keyboard:** all triggers, menus, dialogs, drawers, trees, and dnd surfaces fully operable; roving tabindex where the primitive demands it (tabs, radio, tree, menubar).
* **Screen readers:** `data-slot` anatomy doubles as query hooks; live regions for sonner/toast, `aria-invalid` + `aria-checked` styling hooks on form controls, `srLabel` on nav badges (`NAV_BADGE_PRESETS`), skip links on docs layout.

### B. Reduced Motion & Focus Management

```tsx
// Pattern: celebratory motion must degrade to instant state
import { motion, useReducedMotion } from "motion/react";
const reduce = useReducedMotion();
<motion.div initial={{ opacity: 0, y: reduce ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.3 }} />
```

* Modals/drawers trap focus and restore it to the trigger on close (Base-UI/Radix primitives handle this — never reimplement).
* Command palette + mobile drawer share `navFlatItems`; `soon` items are focusable-but-disabled with `aria-disabled`, never hidden.

### C. Responsive Rules

| Breakpoint | Width | Layout behavior |
| :--------- | :---- | :-------------- |
| base–`sm` | <640px | Single column; mobile drawer nav; tables → scroll-x or card transform; touch targets ≥44px; `active:opacity-60` feedback (`globals.css` base layer) |
| `md` | 768px | Sidebar collapses to icons/overlay; preview tabs scroll (`no-scrollbar` utility) |
| `lg` | 1024px | Desktop nav appears (`hidden lg:flex`); docs two-column (content + TOC) |
| `xl` / `2xl` | 1280/1536px | Header grid widens (`xl:grid-cols-[1fr_auto_1fr]`); `container` caps at 1400px |
| `3xl` / `4xl` | 1600/2000px | Custom `--breakpoint-3xl/4xl`; containers pin (`3xl:fixed:max-w-…`) |

* Scrollbars: `no-scrollbar` for tab rails; `scrollbar` (thin, `var(--input)` thumb) for code/panels.
* Images: `next/image` with `minimumCacheTTL` 30d; remote allowlist only (`avatars.githubusercontent.com`, `images.unsplash.com`, `avatar.vercel.sh`, `picsum.photos`).

***

## 8. Component Catalog (Authoritative Index)

### A. Site Shell & Docs Infrastructure (`components/`)

| Component | Purpose |
| :-------- | :------ |
| `site-header.tsx` / `site-footer.tsx` / `sticky-site-chrome.tsx` / `app-site-shell.tsx` | Showroom chrome (`site-*` tokens only) |
| `desktop-nav.tsx` / `mobile-nav.tsx` / `command-menu*.tsx` | Nav derived from `lib/nav-config.tsx` single source |
| `docs-sidebar.tsx` / `docs-toc.tsx` / `docs-page-tree.ts` / `docs-design-system-sync.tsx` | Fumadocs trees + configurator sync |
| `docs-component-preview.tsx` / `docs-component-live-preview.tsx` / `component-preview-tabs.tsx` / `docs-component-source.tsx` / `component-source*.tsx` | Preview/Code/CLI tab system + bundle loader (`lib/component-preview-loader.ts`) |
| `code-tabs.tsx` / `code-block-command.tsx` / `code-collapsible-wrapper.tsx` / `copy-*.tsx` | Shiki code display + copy affordances |
| `theme-provider.tsx` / `theme-mode-toggle-button.tsx` / `tailwind-indicator.tsx` / `top-progress-bar.tsx` / `scroll-to-top.tsx` / `analytics.tsx` | Environment islands |
| `logo.tsx` / `icons.tsx` / `github-link.tsx` / `x-link.tsx` / `figma-link.tsx` | Brand + social atoms (Figma URL centralized in `FIGMA_URL`) |

### B. shadcn Primitives, Dual-Base (`registry/bases/{base,radix}/ui/`)

accordion · alert · alert-dialog · aspect-ratio · attachment · avatar · badge · breadcrumb · bubble · button · button-group · calendar · card · carousel · chart · checkbox · collapsible · combobox · command · context-menu · dialog · direction · drawer · dropdown-menu · empty · field · hover-card · input · input-group · input-otp · item · kbd · label · marker · menubar · message · message-scroller · menubar · native-select · navigation-menu · pagination · popover · progress · radio-group · resizable · scroll-area · select · separator · sheet · sidebar · skeleton · slider · sonner · spinner · switch · table · tabs · textarea · toast · toggle · toggle-group · tooltip — each with `_registry.ts` declaring `registryDependencies`, `dependencies`, and light/dark `cssVars` deltas.

### C. In-House 19 (`registry-neui/bases/{base,radix}/neui/`)

alert · autocomplete · badge · date-selector · filters · frame · icon-stack · icon-tile · kanban · number-field · phone-input · rating · scrollspy · sortable · stepper · timeline · tree · data-grid/ · event-calendar/ · gantt/ — see §5.D for the role table. Both bases share identical file paths; only the primitive imports and state selectors differ.

### D. Composition Examples (`packages/registry/bases/**/dist/` at runtime; `c-*` source)

1000+ realistic blocks (dashboards, auth, billing, tables, wizards) compiled by `scripts/build-component-packages.mts` into preview bundles. Category pages render bundles, never raw source — which is why `pnpm dev` alone shows stale previews after editing `c-*` or in-house primitives (see §10).

### E. Visual-Effect Atoms (`components/ui/` + `components/neui/` site-side only)

`confetti` · `cool-mode` · `globe` · `interactive-hover-button` · `lens` · `number-ticker` · `pixel-image` · `magnetic-button-demo` · `background-ripple-effect-demo` — **site chrome only**. Never shipped in registry payloads; never used inside dashboard-density surfaces.

***

## 9. Design Token Reference

### A. Core Tokens (`styles/globals.css` `:root` / `.dark`)

```css
/* Typography */
--font-sans: var(--font-inter);
--font-heading: var(--font-inter);
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
--radius: 0.625rem;

/* Light — surfaces & structure */
--background: oklch(1 0 0);            --foreground: oklch(0.145 0 0);
--card: oklch(1 0 0);                  --card-foreground: oklch(0.145 0 0);
--popover: oklch(1 0 0);               --popover-foreground: oklch(0.145 0 0);
--primary: oklch(0.205 0 0);           --primary-foreground: oklch(0.985 0 0);
--secondary: oklch(0.97 0 0);          --secondary-foreground: oklch(0.205 0 0);
--muted: oklch(0.97 0 0);              --muted-foreground: oklch(0.556 0 0);
--accent: oklch(0.97 0 0);             --accent-foreground: oklch(0.205 0 0);
--destructive: oklch(0.577 0.245 27.325);
--border: oklch(0.922 0 0);            --input: oklch(0.922 0 0);  --ring: oklch(0.708 0 0);

/* Status voices (light → dark) */
--success: emerald-500 → emerald-500;  --success-foreground: emerald-900 → emerald-600;
--info: violet-500 → violet-500;       --info-foreground: violet-900 → violet-600;
--warning: yellow-500 → yellow-500;    --warning-foreground: yellow-900 → yellow-600;
--invert: zinc-900 → zinc-700;         --invert-foreground: zinc-50 → zinc-50;
--destructive-foreground: red-800 → red-600;

/* Dark — surfaces & structure */
--background: oklch(0.145 0 0);        --foreground: oklch(0.985 0 0);
--card: oklch(0.205 0 0);              --popover: oklch(0.269 0 0);
--primary: oklch(0.922 0 0);           --primary-foreground: oklch(0.205 0 0);
--muted: oklch(0.269 0 0);             --muted-foreground: oklch(0.708 0 0);
--accent: oklch(0.371 0 0);            --accent-foreground: oklch(0.985 0 0);
--destructive: oklch(0.704 0.191 22.216);
--border: oklch(1 0 0 / 10%);          --input: oklch(1 0 0 / 15%); --ring: oklch(0.556 0 0);

/* Code & selection */
--surface: oklch(0.98 0 0) → dark oklch(0.2 0 0);
--code: var(--surface);  --code-highlight: oklch(0.96 0 0) → dark oklch(0.27 0 0);
--code-number: oklch(0.56 0 0) → dark oklch(0.72 0 0);
--selection: oklch(0.145 0 0) → dark oklch(0.922 0 0);
```

### B. Site Tokens (`styles/default.css` — `site-*` namespace, light → dark)

`--site-background: oklch(1 0 0) → oklch(0.145 0 0)` · `--site-card: oklch(1 0 0) → oklch(0.205 0 0)` · `--site-primary: oklch(0.205 0 0) → oklch(0.922 0 0)` · `--site-muted: oklch(0.97 0 0) → oklch(0.269 0 0)` · `--site-border: oklch(0.922 0 0) → white 10%` · radii `--site-radius-xs(2px) sm(4px) md(6px) lg(8px) xl(12px) 2xl(16px) 3xl(24px) full` via `site-rounded-*` utilities.

### C. Spacing / Radius / Shadow Scales

```
4px xs    → icon padding, tight gaps
8px sm    → inline gaps, chip padding
16px md   → card padding baseline (Vega p-6 / Nova p-4 per style voice)
24px lg   → section gaps, card margins
32px xl   → large section spacing
48px 2xl  → page section separation

radius-sm (-4px) → inputs, kbd          radius-md (-2px) → buttons, badges
radius-lg (=)    → cards, popovers      radius-xl (+4px) → dialogs, drawers
radius-full      → pills, avatars

shadow: none on static surfaces · shadow-md + ring-foreground/10 on overlays only
```

### D. Registry Wiring (how tokens ship)

```ts
// components.json — consumer contract
{ "style": "new-york", "tailwind": { "css": "app/globals.css", "baseColor": "neutral", "cssVariables": true },
  "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui" },
  "registries": { "@neui": "https://neui.io/r/{style}/{name}.json", ... } }
```

```ts
// Theme items ship light/dark cssVars; style items ship cn-* overrides; fonts ship variables
buildRegistryBase(config) → { name: `${base}-${style}`, extends: "none", type: "registry:base",
  cssVars: { light, dark, theme }, css: { '@layer base': { '*': '@apply border-border outline-ring/50', body: '@apply bg-background text-foreground' } } }
```

***

## 10. Contribution Workflow (Design-Safe Change Paths)

| Editing… | Source | Rebuild with | Why |
| :------- | :----- | :----------- | :-- |
| `c-*` examples or in-house primitives (`registry-neui/**/neui/**`) | Bundled preview packages | `pnpm dev:packages` (build + watch) | Plain `dev` serves stale bundles → category pages hang on `Module not found: @neui/components-...` |
| shadcn base primitives (`registry/**/ui/`), site chrome, `lib/`, `hooks/` | Fast Refresh | plain `pnpm dev` | No bundling step; HMR picks it up |
| Registry JSON for CLI testing | `public/r/styles/**` | `pnpm registry:build` (+ `registry:verify` in CI) | Validates every generated payload |
| Metadata/counts/search | `registry-neui/_meta/` | `pnpm components:build` (auto on `postinstall`/predev) | Rarely by hand |
| Everything from scratch | full pipeline | `pnpm registry:all` / `pnpm build:local` | metadata → packages → registry → verify → build |

> If Turbopack panics after many rebuilds: stop, `rm -rf .next`, restart. If a preview bundle is missing: `pnpm components:packages` then restart `dev`.

### Authoring Checklist (every registry PR)

1. Tokens only — no hex, no raw palette classes.
2. `cn-*` contract preserved — style files restyle, TSX keeps names.
3. Both bases (or explicit exemption) — `base` + `radix` variants for in-house components.
4. `_registry.ts` updated — files, deps, `registryDependencies`, light/dark `cssVars` deltas.
5. Focus + keyboard + `aria-*`/`data-*` parity — test with keyboard only.
6. Docs + preview + CLI path — category renders, source copies, `npx shadcn add @neui/...` resolves.
7. `pnpm lint` + `pnpm typecheck` clean; `registry:verify` passes when JSON changed.

***

## 11. Anti-Pattern Kill-List

The following are explicitly prohibited across all NeUI surfaces (site + registry). Reviewers must reject on sight:

1. ❌ **No raw colors.** `bg-[#...]`, `text-red-500`, `border-zinc-200` inside `registry/**` / `registry-neui/**` — use semantic tokens.
2. ❌ **No solid saturated badges.** Status = soft tint bg + dark tint text (`text-xs font-medium`). Never `bg-red-500 text-white` pills.
3. ❌ **No heavy static shadows.** `shadow-lg/xl` on cards, rows, or page sections — hairlines + steps instead. `shadow-md + ring-1` is overlays-only.
4. ❌ **No gradient text in UI.** `bg-gradient-to-r text-transparent bg-clip-text` is banned on functional surfaces (hero art excepted, site-side only).
5. ❌ **No display-face sprawl.** Max two voices per surface: site Inter vs. selected registry font. No third display font in components.
6. ❌ **No style/theme cross-wiring.** Themes set variables only; styles set `cn-*` classes only. A theme file touching layout (or vice versa) is a defect.
7. ❌ **No `cn-*` renames per style.** Contracts are API. Add a new contract; never rename per dialect.
8. ❌ **No `site-*` leakage into registry.** `bg-site-*`, `font-site-sans`, `site-rounded-*` never ship in copyable components — showroom paint stays in the showroom.
9. ❌ **No emoji as UI.** Lucide/Hugeicons only. Emoji live in docs prose, never in buttons, badges, or status.
10. ❌ **No red alarmism.** Destructive confirmation uses `outline` + plain text; solid red is reserved for irreversible data destruction.
11. ❌ **No motion without a gate.** Celebratory effects (`Confetti`, `CoolMode`) without `prefers-reduced-motion` handling are rejected.
12. ❌ **No stale-bundle commits.** Editing `registry-neui/**` without rebuilding preview packages (`dev:packages`) and verifying previews render.

***

<div align="center">

**NeUI Design Language** · *Design-forward shadcn/ui platform — copy, own, and ship production UI faster.*

`components.json` · `registry/` · `registry-neui/` · `registry/styles/style-*.css` · `styles/globals.css` · `styles/default.css`

</div>
