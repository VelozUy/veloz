# BORDER RADIUS GUIDELINES – VELOZ UI SYSTEM

This document outlines updated border radius conventions for the Veloz web application, based on recent visual references from the official brand manual.

---

## 🎯 GENERAL PRINCIPLES

- The design system favors **clarity, precision, and modernism**.
- All containers (cards, sections, blocks) should default to **square borders (`rounded-none`)** to emphasize structure and hierarchy.
- Rounded corners are used **intentionally and sparingly**, mostly on tags and buttons.
- Visual asymmetry is acceptable when it reinforces movement or layout emphasis.

---

## ✅ ELEMENT-SPECIFIC GUIDELINES

### 🔘 **Tags, Badges, and Pills**

- Use: `rounded-full`
- Context: category buttons, labels, status indicators
- Purpose: create warmth and clarity at small scale

### 🧱 **Containers: Cards, Modals, Forms, Sections**

- Use: `rounded-none`
- Context: all general-purpose containers, including content blocks, timelines, and dialogs
- Purpose: reinforce the structural, editorial, and technical feel of the brand

### 🧩 **Blocks and Visual Sections**

- Use: asymmetrical border radius
  - Examples:
    - `rounded-tl-[3rem]`
    - `rounded-br-[4rem]`
- Context: hero sections, featured content, layout cuts
- Purpose: express motion and boldness without being ornamental

### ⬛ **Structural/Diagrammatic Elements**

- Use: square corners (`rounded-none`)
- Context: diagrams, wireframes, edge-glow UI elements
- Purpose: precision, consistency with brand visuals

---

## 🔧 IMPLEMENTATION STRATEGY

- Avoid using `rounded-xl` or `rounded-2xl` by default across components
- Use conditional class logic when applying decorative border-radius styles
- Align tailwind tokens with this intent:

```ts
theme.extend.borderRadius = {
  md: '0.375rem', // inputs
  lg: '0.5rem', // cards/forms
  full: '9999px', // badges
  tl: '3rem', // layout curves
};
```

---

## 📌 EXAMPLES

| Component            | Border Radius       |
| -------------------- | ------------------- |
| CTA tag              | `rounded-full`      |
| Input field          | `rounded-md`        |
| Testimonial card     | `rounded-none`      |
| Hero visual block    | `rounded-tl-[3rem]` |
| Visual diagram label | `rounded-none`      |
| Timeline step card   | `rounded-none`      |
| CTA container block  | `rounded-none`      |
| -------------------- | ------------------- |
| CTA tag              | `rounded-full`      |
| Input field          | `rounded-md`        |
| Testimonial card     | `rounded-lg`        |
| Hero visual block    | `rounded-tl-[3rem]` |
| Visual diagram label | `rounded-none`      |

---

> These conventions ensure visual harmony with the Veloz brand while supporting clarity and responsiveness across components.
