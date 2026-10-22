# Memservice Design System

This document specifies the design tokens, color palette, typography scale, spacing, elevation, and accessibility standards for both the Storefront (`apps/web`) and the Admin Dashboard (`apps/admin`).

---

## 1. Color Palette & Semantic Tokens

All components use semantic CSS variables mapped in Tailwind. Direct hex values in components are forbidden.

### 1.1 Color Tokens Specification

| Token Name | Role | Light Theme (RGB / Hex) | Dark Theme (RGB / Hex) |
|---|---|---|---|
| `--background` | Page background | `255 255 255` (`#ffffff`) | `11 20 32` (`#0b1420`) |
| `--foreground` | Default body text | `15 23 42` (`#0f172a`) | `248 250 252` (`#f8fafc`) |
| `--card` | Surface cards | `255 255 255` (`#ffffff`) | `18 31 48` (`#121f30`) |
| `--card-foreground` | Text on surface cards | `15 23 42` (`#0f172a`) | `248 250 252` (`#f8fafc`) |
| `--popover` | Dropdowns, menus, modals | `255 255 255` (`#ffffff`) | `22 38 58` (`#16263a`) |
| `--popover-foreground` | Text inside popovers | `15 23 42` (`#0f172a`) | `248 250 252` (`#f8fafc`) |
| `--primary` | Primary brand CTA (Sky Blue) | `11 122 163` (`#0b7aa3`) | `21 169 227` (`#15a9e3`) |
| `--primary-foreground` | Text on primary brand buttons | `255 255 255` (`#ffffff`) | `11 20 32` (`#0b1420`) |
| `--secondary` | Neutral secondary surfaces | `241 245 249` (`#f1f5f9`) | `26 44 68` (`#1a2c44`) |
| `--secondary-foreground` | Text on secondary surfaces | `15 23 42` (`#0f172a`) | `248 250 252` (`#f8fafc`) |
| `--muted` | Subdued backgrounds / badges | `241 245 249` (`#f1f5f9`) | `24 40 62` (`#18283e`) |
| `--muted-foreground` | Subdued captions / hints | `71 85 105` (`#475569`) | `148 163 184` (`#94a3b8`) |
| `--accent` | Warm CTA / Highlight (Orange) | `242 151 31` (`#f2971f`) | `242 151 31` (`#f2971f`) |
| `--accent-foreground` | Text on accent | `15 23 42` (`#0f172a`) | `11 20 32` (`#0b1420`) |
| `--destructive` | Errors, delete actions, warnings | `220 38 38` (`#dc2626`) | `220 38 38` (`#dc2626`) |
| `--destructive-foreground` | Text on destructive actions | `255 255 255` (`#ffffff`) | `255 255 255` (`#ffffff`) |
| `--border` | Dividers and element borders | `226 232 240` (`#e2e8f0`) | `30 50 78` (`#1e324e`) |
| `--input` | Form input borders | `226 232 240` (`#e2e8f0`) | `30 50 78` (`#1e324e`) |
| `--ring` | Focus outline rings | `21 169 227` (`#15a9e3`) | `21 169 227` (`#15a9e3`) |

### 1.2 Brand Color Aliases (Backward Compatibility)
Existing utility aliases are preserved in Tailwind:
- `sky-blue`: `#15a9e3`
- `deep-sea-blue`: `#184363`
- `sunset-orange`: `#F2971F`
- `accent-orange`: `rgb(237, 86, 33)`
- `fresh-green`: `#39CB74`
- `light-mist`: `#EDF4F6`
- `soft-lavender`: `#F6F5FA`
- `neutral-gray`: `#9a9a9a`

---

## 2. Typography Scale

Default Font: **PT Sans** (Google Fonts) on Storefront; System Sans / Inter on Admin.

| Level | Size | Line Height | Weight | Tailwind Class |
|---|---|---|---|---|
| Display | 48px / 3rem | 1.15 | 700 Bold | `text-4xl md:text-5xl font-bold` |
| H1 | 36px / 2.25rem | 1.2 | 700 Bold | `text-3xl md:text-4xl font-bold` |
| H2 | 30px / 1.875rem | 1.25 | 700 Bold | `text-2xl md:text-3xl font-bold` |
| H3 | 24px / 1.5rem | 1.3 | 600 SemiBold | `text-xl md:text-2xl font-semibold` |
| H4 | 20px / 1.25rem | 1.35 | 600 SemiBold | `text-lg md:text-xl font-semibold` |
| Body | 15px / 0.9375rem | 1.5 | 400 Regular | `text-[15px] font-normal` |
| Body Small | 13px / 0.8125rem | 1.45 | 400 Regular | `text-xs md:text-sm` |
| Caption / Chip | 11px / 0.6875rem | 1.4 | 600 SemiBold | `text-[11px] font-semibold tracking-wider uppercase` |

---

## 3. Spacing, Radius & Elevation

### 3.1 Border Radius
- `--radius-sm`: `calc(var(--radius) - 4px)` = `4px`
- `--radius-md`: `calc(var(--radius) - 2px)` = `6px`
- `--radius-lg`: `var(--radius)` = `8px` (`0.5rem`)
- `--radius-full`: `9999px`

### 3.2 Shadows (Elevation)
- **Subtle (Cards):** `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`
- **Medium (Popovers, Dropdowns):** `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`
- **High (Modals, Drawers):** `0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1)`

### 3.3 Motion & Transitions
- Respect `prefers-reduced-motion: reduce`: `transition: none` when reduced motion is requested.
- Standard Transition Duration: `150ms` - `200ms` with `cubic-bezier(0.4, 0, 0.2, 1)`.
- Color/Background transitions only: Avoid animating layout dimensions where possible to eliminate reflows.

---

## 4. Accessibility Standards
1. **Contrast Compliance:** Every foreground/background pair must meet or exceed WCAG AA ratio (`>= 4.5:1` for regular text). Automated verification via `node scripts/check-contrast.mjs`.
2. **Focus Visibility:** Interactive elements must have a high-contrast focus ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
3. **Minimum Touch Target:** Interactive targets must be at least `40px x 40px` on mobile viewports.
