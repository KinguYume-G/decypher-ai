---
name: Decypher AI Protocol
colors:
  surface: '#15121b'
  surface-dim: '#15121b'
  surface-bright: '#3c3742'
  surface-container-lowest: '#100d16'
  surface-container-low: '#1d1a24'
  surface-container: '#221e28'
  surface-container-high: '#2c2833'
  surface-container-highest: '#37333e'
  on-surface: '#e8dfee'
  on-surface-variant: '#ccc3d8'
  inverse-surface: '#e8dfee'
  inverse-on-surface: '#332f39'
  outline: '#958da1'
  outline-variant: '#4a4455'
  surface-tint: '#d2bbff'
  primary: '#d2bbff'
  on-primary: '#3f008e'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#732ee4'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#ffb784'
  on-tertiary: '#4f2500'
  tertiary-container: '#a15100'
  on-tertiary-container: '#ffe0cd'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb784'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#713700'
  background: '#15121b'
  on-background: '#e8dfee'
  surface-variant: '#37333e'
typography:
  display-xl:
    fontFamily: Outfit
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 48px
  margin-mobile: 20px
  unit: 8px
---

## Brand & Style

The design system is built on a "Cyber-Premium" aesthetic—a fusion of high-end SaaS sophistication and the raw, high-tech energy of a cyberpunk terminal. It targets a technical, forward-thinking audience that values both aesthetic polish and computational power.

The visual narrative is defined by **Atmospheric Glassmorphism**. Surfaces are not just containers but filtered viewports into a deep, layered digital environment. The emotional response is one of "Intellectual Authority": the UI should feel like a sentient command center—fast, precise, and infinitely capable. 

Key stylistic pillars include:
- **Luminous Depth:** Using light as a functional material rather than just decoration.
- **Translucent Obsidian:** Deep, dark glass surfaces that maintain legibility through high-precision typography.
- **The AI Pulse:** Subtle, animated gradients that mimic a heartbeat or data flow, indicating system "thought" processes.

## Colors

This design system utilizes a strictly nocturnal palette. The base is a deep, obsidian navy that provides the necessary contrast for vibrant, neon-inflected accents.

- **Foundational Layers:** The background uses `#13131f` to anchor the experience. Interactive surfaces and cards use `#1e1e2e` at varying opacities (usually 60-80%) to allow background glows to bleed through.
- **Accents & Action:** Primary actions leverage a high-energy gradient transition from Neon Purple to Electric Blue. This is the "active state" of the AI.
- **Utility:** Borders are kept subtle (`#2a2a3e`) to define structure without breaking the seamless glass effect. Success states should lean into the Electric Blue spectrum, while warnings utilize a sharp Magenta.

## Typography

The typographic hierarchy balances human-centric readability with machine-like precision.

- **Headlines:** 'Outfit' is used for its geometric, modern profile. Headings are always crisp white (`#ffffff`) to pop against the dark background.
- **Body:** 'Inter' provides a systematic, highly legible experience for complex data. Body text is set in Slate-300 (`#cbd5e1`) to reduce eye strain and establish a clear hierarchy beneath headings.
- **Data & Mono:** 'JetBrains Mono' is introduced for labels, metadata, and AI-generated code snippets, reinforcing the "hacker" ethos of the platform.

## Layout & Spacing

This design system employs a **Fluid Grid** with a refined 8px spacing rhythm. 

- **Desktop:** A 12-column grid with 24px gutters. Content is housed in glass containers that often span 4, 6, or 8 columns to create asymmetrical, sophisticated layouts.
- **Mobile:** Transition to a 4-column grid. Margins compress to 20px. 
- **Rhythm:** Use spacing units in multiples of 8. Consistent internal padding within cards (typically 24px or 32px) is essential to maintain the "premium" feel of the glass containers.

## Elevation & Depth

Depth is conveyed through **Light and Refraction** rather than traditional drop shadows.

1.  **The Base:** `#13131f` (Solid).
2.  **Surface Level:** `#1e1e2e` with a 16px to 32px `backdrop-blur`. These surfaces feature a 1px solid border at 10% white to simulate a glass edge.
3.  **Floating Level:** Used for modals and dropdowns. These feature a stronger backdrop blur (40px) and a subtle "Outer Glow" (`box-shadow`) using the primary purple at 15% opacity to suggest the element is powered by an internal light source.
4.  **Interaction:** Elements "lift" by increasing the border opacity and the intensity of the inner glow.

## Shapes

The shape language is "Organic Geometric." While the underlying grid is rigid and technical, the corners are generously rounded to provide a friendly, sophisticated SaaS feel.

- **Standard Elements:** Buttons and small inputs use `0.5rem` (rounded).
- **Containers:** Primary cards and dashboards sections use `1rem` (rounded-lg) to `1.5rem` (rounded-xl).
- **Interactive Triggers:** Search bars and pill-tags may use full rounding (pill-shaped) to distinguish them from structural content.

## Components

### Buttons
- **Primary:** Gradient background (Purple to Blue). No border. White text. Subtle outer glow on hover.
- **Secondary:** Ghost style. Transparent background with a 1px gradient border. Text uses the Electric Blue color.
- **Tertiary:** Pure glass. Blur effect with a subtle white border (10% opacity).

### Cards
- Always use `backdrop-blur`.
- Feature a subtle 1px top-border that is slightly lighter than the side borders to simulate overhead lighting in a digital space.

### Input Fields
- Dark background (`#13131f`) with a `0.5rem` radius. 
- The border glows Electric Blue only when focused.
- Placeholder text in Slate-500.

### AI Glow Indicators
- Used to highlight active AI processes. A small, 8px circular dot with a 12px blurred "aura" in Neon Purple.

### Chips/Tags
- Small, uppercase labels using 'JetBrains Mono'.
- Backgrounds are low-opacity versions of the accent colors (e.g., Purple at 10% opacity).