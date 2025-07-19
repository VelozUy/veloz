## 🧾 PROMPT FOR CURSOR – IMPLEMENT LIGHT GRAY BACKGROUND WITH HIERARCHICAL ELEMENTS

Update the design system to apply contextual background colors based on **section type** and **element priority** using Tailwind CSS and theme tokens.

### 🎯 GOALS

- Use a consistent light gray background across all pages
- Allow components and sections to express hierarchy through contrast, elevation, and composition
- Maintain visual coherence with the Veloz brand identity

---

### 🔧 TAILWIND TOKENS

Only use the **REDJOLA** font for the VELOZ brand title in the logo. All other headings, buttons, and body text must use **Roboto** to maintain clarity and consistency throughout the app. (define in tailwind.config.ts)

```ts
colors: {
  charcoal: '#1a1b1f',       // dark base for visual/hero blocks
  gray-light: '#f0f0f0',     // neutral for text sections and forms
  gray-medium: '#d2d2d2',    // borders and cards
  blue-accent: '#1d7efc',    // CTA and focus
  white: '#ffffff'           // elevated cards or clean sections
}
```

---

### 📐 VISUAL HIERARCHY ON LIGHT GRAY BACKGROUND

#### 🥇 Top Priority Elements (Hero, CTA, Project Titles)

- Use `bg-white` cards with soft shadows
- Large text in `text-charcoal` or `text-blue-accent`
- Elements: titles, buttons, main callouts

#### 🥈 Mid Priority (Content, Process, Testimonials)

- Placed directly on `bg-gray-light`
- Typography: `text-charcoal`, `text-gray-medium`
- Cards can be `bg-white` or outlined

#### 🥉 Low Priority (Meta info, Tags, Footers)

- Subtle styling: `text-gray-medium`, `border-gray-medium`
- Avoid colored backgrounds or saturated components

---

### 📌 OUTPUT

Apply background color contextually based on section `type` or `priority` prop in your component system (e.g., `sectionType="hero"` → `bg-charcoal`).

Ensure each section explicitly controls both `bg` and text/icon contrast.

Use responsive `className` logic or utility functions to generate layout variants for light vs dark backgrounds.
