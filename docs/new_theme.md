# NEW_THEME.md – Veloz Color Application Guide

Based on the official Veloz Brand Manual and tailored to a Tailwind CSS + shadcn/ui architecture.

---

## 🎨 Core Palette

| Name         | HEX       | Recommended Use                             |
| ------------ | --------- | ------------------------------------------- |
| Veloz Blue   | `#0019AA` | Primary color (CTAs, links, highlights)     |
| Carbon Black | `#212223` | Main text, icons, strong contrast           |
| White        | `#FFFFFF` | Light backgrounds, inverted text            |
| Light Gray 1 | `#d4d4d4` | Borders, neutral backgrounds                |
| Light Gray 2 | `#afafaf` | Disabled UI elements, secondary visual tone |

---

## ✅ Application Hierarchy

### 1. **Site Background**

- `bg-[#d4d4d4]` as the default base background
- `bg-white` for visual contrast in blocks or containers

### 2. **Text and Headings**

- Base text: `text-[#212223]`
- On dark/blue backgrounds: `text-white`
- Headings: `uppercase`, `tracking-tight`
- Use REDJOLA font only for major titles or the VELOZ logo

### 3. **Buttons**

- **Primary**: `bg-[#0019AA] text-white hover:bg-[#000f75]`
- **Secondary**: `bg-[#afafaf] text-[#212223] hover:bg-[#999999]`
- **Tertiary**: `border border-[#0019AA] text-[#0019AA] hover:bg-[#0019AA] hover:text-white`

### 4. **Inputs / Forms**

- Background: `bg-white` or `bg-[#f5f5f5]`
- Border: `border-[#d4d4d4]`
- Focus ring: `focus:ring-[#0019AA]`
- Text: `text-[#212223]`

### 5. **Cards & Containers**

- Background: `bg-white` or `bg-[#f5f5f5]`
- Border: `border border-[#d4d4d4]`
- Corners: `rounded-none`
- Shadows: none or `shadow-sm` for hierarchy

---

## 💡 UX Visual Rules

### Additional Tokens for UX-Focused Interfaces

```css
:root {
  --gallery-bg: var(--card);
  --gallery-border: var(--border);
  --gallery-caption: var(--base-700);

  --overlay-bg: oklch(0.145 0 0 / 0.8);

  --tab-active: var(--primary-700);
  --tab-hover: var(--primary-300);

  --input-placeholder: var(--base-600);
}
```

### Usage Contexts

- `--gallery-bg`: used as background for media tiles or image grids.

- `--gallery-border`: to frame individual items in media-focused sections.

- `--gallery-caption`: subtle text below images, for descriptions or tags.

- `--overlay-bg`: for modals, dialogs or lightbox backgrounds.

- `--tab-active`: highlight the active state in tab or category navigation.

- `--tab-hover`: hover feedback for navigation tabs.

- `--input-placeholder`: for consistent placeholder text tone across inputs.

- **Veloz Blue** is reserved for CTAs, active links, and selected inputs

- Grays support form layouts, structure, and admin surfaces

- Use white to emphasize blocks with heavy content

- Section separators: `border-t border-[#afafaf]`

- Never combine Veloz Blue with Light Gray 2 in the same button

---

## 🛠️ CSS Variable Map (compatible with global.css scale)

Adapt the theme to match a scale-based system like the one used in `global.css`, using oklch values:

```css
:root {
  /* Base scale */
  --base-50: oklch(0.985 0 0);
  --base-100: oklch(0.97 0 0);
  --base-200: oklch(0.922 0 0);
  --base-300: oklch(0.8699 0 0);
  --base-400: oklch(0.708 0 0);
  --base-500: oklch(0.556 0 0);
  --base-600: oklch(0.439 0 0);
  --base-700: oklch(0.371 0 0);
  --base-800: oklch(0.269 0 0);
  --base-900: oklch(0.205 0 0);
  --base-950: oklch(0.145 0 0);
  --base-1000: oklch(0.106 0 0);

  /* Veloz primary blue scale */
  --primary-900: oklch(0.3516 0.219 264.19); /* Main action */
  --primary-700: oklch(0.4892 0.3027 262.99); /* Hover */

  /* Grays */
  --gray-light-1: var(--base-200); /* borders */
  --gray-light-2: var(--base-400); /* muted */

  /* Tokens */
  --background: var(--base-100);
  --foreground: var(--base-800);
  --card: var(--color-white);
  --card-foreground: var(--base-800);
  --border: var(--gray-light-1);
  --muted: var(--gray-light-2);
  --primary: var(--primary-900);
  --primary-foreground: white;
  --accent: var(--base-100);
  --accent-foreground: var(--base-800);
  --radius: 0rem;
}
```

Use this naming system to ensure modular theming and token reuse across all components.

```css
:root {
  --color-primary: #0019aa;
  --color-text: #212223;
  --color-bg: #d4d4d4;
  --color-surface: #ffffff;
  --color-border: #d4d4d4;
  --color-muted: #afafaf;
}
```

---

> This file should accompany your design system and `tailwind.config.ts`, ensuring visual consistency across the Veloz interface.
