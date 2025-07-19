## 🧾 Prompt for Cursor – Implement Dynamic Background Color System

Update the design system to apply contextual background colors based on **section type** and **element priority** using Tailwind CSS and theme tokens.

### 🎯 Goals

- Improve visual clarity and emotional tone by varying background colors contextually
- Reinforce hierarchy through contrast and color alignment with the Veloz brand

---

### 🔧 Tailwind Tokens (define in tailwind.config.ts)

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

### 📐 Rules by Section Type

#### 🎬 Hero / Visual Impact Sections

- `bg-charcoal`
- Used for hero blocks, full-screen galleries, emotional project intros
- Elements: large text (`text-white`), CTA button (`bg-blue-accent`), icons (`text-white` or `text-blue-accent`)

#### 📃 Content / Text Sections

- `bg-gray-light`
- Used for FAQs, paragraphs, process steps
- Elements: `text-charcoal`, cards (`bg-white`), links (`text-blue-accent`)

#### ✍️ Forms / Inputs / Contact

- `bg-gray-light` or white card over `gray-light`
- Inputs: `bg-white`, `border-gray-medium`, `focus:ring-blue-accent`
- Buttons: `bg-blue-accent`, `text-white`

#### 🧾 Testimonials / Crew

- `bg-white`
- Cards: border `gray-medium`, `text-charcoal`

#### 🧲 CTA / Conversion Section

- Background: `charcoal` or `blue-accent`
- Button: contrast color (white on blue, or blue on light)
- Optional: inverted layout with dark text on light BG or vice versa

---

### 📌 Output

Apply background color contextually based on section `type` or `priority` prop in your component system (e.g., `sectionType="hero"` → `bg-charcoal`).

Ensure each section explicitly controls both `bg` and text/icon contrast.

Use responsive `className` logic or utility functions to generate layout variants for light vs dark backgrounds.
