---
designTokens:
  colors:
    core:
      background:
        value: "oklch(1 0 0)"
        description: "Pure white for main application background"
      foreground:
        value: "oklch(0.145 0 0)"
        description: "Deep, almost-black slate for primary text"
      muted:
        value: "oklch(0.97 0 0)"
        description: "Very light gray for subtle backgrounds and panels"
      mutedForeground:
        value: "oklch(0.556 0 0)"
        description: "Medium gray for secondary text and descriptions"
      border:
        value: "oklch(0.922 0 0)"
        description: "Light gray for subtle dividers and card outlines"
    brand:
      primary:
        value: "oklch(0.205 0 0)"
        description: "Dark gray/black used for solid high-contrast elements"
      primaryForeground:
        value: "oklch(0.985 0 0)"
        description: "Off-white text on primary elements"
    accents:
      blue:
        value: "#2563EB"
        description: "Tailwind blue-600. Core accent color for Trust and Action."
      indigo:
        value: "#4F46E5"
        description: "Tailwind indigo-600. Used in gradients with blue."
      red:
        value: "#EF4444"
        description: "Tailwind red-500. Used for destructive actions and urgency."
      orange:
        value: "#F97316"
        description: "Tailwind orange-500. Paired with red for warm gradients."
    gradients:
      primaryCta:
        value: "linear-gradient(to right, #2563EB, #4F46E5)"
        description: "Blue to Indigo gradient for primary action buttons"
      highlightText:
        value: "linear-gradient(to right, #EF4444, #F97316)"
        description: "Red to Orange gradient for dramatic text emphasis"

  typography:
    fontFamilies:
      sans:
        value: "'Geist', system-ui, sans-serif"
        description: "Primary clean, geometric sans-serif for UI and content"
      mono:
        value: "'Geist Mono', monospace"
        description: "Monospace font for technical data or code snippets"
    weights:
      medium: "500"
      semibold: "600"
      bold: "700"
      extrabold: "800"
      black: "900"
    sizes:
      sm: "0.875rem"
      base: "1rem"
      lg: "1.125rem"
      xl: "1.25rem"
      2xl: "1.5rem"
      4xl: "2.25rem"
      7xl: "4.5rem"

  radii:
    base:
      value: "0.625rem"
      description: "Standard UI element rounding (inputs, standard buttons)"
    lg:
      value: "1rem"
      description: "Slightly larger rounding for smaller cards"
    3xl:
      value: "1.5rem"
      description: "Generous rounding for feature cards and pricing tiers"
    full:
      value: "9999px"
      description: "Pill shape for primary CTAs and badges"

  shadows:
    sm:
      value: "0 1px 2px 0 rgb(0 0 0 / 0.05)"
      description: "Subtle lift for basic cards and inputs"
    xl:
      value: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
      description: "Dramatic lift on hover for interactive elements"
    
  motion:
    transitions:
      default:
        value: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        description: "Smooth, standard transition for hovers and state changes"
      hoverFloat:
        value: "transform -10px"
        description: "Upward lift animation on feature cards"
---

# ClinicPilot Design System

## Overview & Vibe
ClinicPilot's visual identity strikes a deliberate balance between **medical professionalism** and **modern SaaS agility**. The interface is designed to feel exceptionally clean, trustworthy, and fast. It avoids the cluttered, dense feeling of legacy hospital management software (like Practo), opting instead for spacious layouts, crisp typography, and highly focused user flows.

The design language speaks directly to modern Indian clinics: it is premium but accessible, heavily utilizing white space to reduce cognitive load in high-stress clinic environments. 

## Color Strategy
- **Monochrome Base:** The foundation of the app relies heavily on a grayscale palette (slate-50 to slate-900). Pure white backgrounds with deep, near-black text create maximum readability and a premium "Apple-like" crispness.
- **Trust Accents (Blue/Indigo):** Bright blue (`blue-600`) transitioning into indigo is the primary action color. This directly subconsciously aligns with WhatsApp (the core value proposition of the product) and universally signifies medical trust and technological reliability.
- **Dramatic Highlights:** Warm gradients (Red to Orange) are used extremely sparingly to draw the eye to critical marketing statements (e.g., the "no-show killer" headline), creating a stark, engaging contrast against the cool-toned application.

## Typography
We use **Geist** (and Geist Mono) as the sole typeface. Geist provides a technical, precise, yet highly legible aesthetic.
- **Headings:** Feature extremely tight tracking (`tracking-tight`) and heavy weights (`extrabold`, `black`) to create bold, punchy marketing statements.
- **Body Copy:** Uses `medium` weights with relaxed line height (`leading-relaxed`) in slate-600/500 colors. This reduces eye strain and ensures that secondary information is easily scannable but never overpowering.

## Shape & Elevation
- **Soft Geometry:** The UI relies on generous border radii. Large feature cards use `3xl` (24px) rounding, which feels friendly, approachable, and modern, moving away from harsh, corporate 90-degree angles.
- **Pill Buttons:** Primary calls-to-action utilize fully rounded (`rounded-full`) pill shapes, making them highly clickable and distinct from structural elements.
- **Dynamic Elevation:** Elements at rest remain relatively flat (`shadow-sm` and subtle `slate-100` borders). However, they respond dynamically to user interaction. Feature cards "float" upwards by 10px while casting a deep, dramatic shadow (`shadow-xl`) when hovered, making the interface feel alive, responsive, and tactile.

## Interactivity & Motion
Micro-interactions are crucial to the "premium" feel. 
- Primary buttons feature subtle hover translations (`-translate-y-1`) accompanied by shadow expansion (`hover:shadow-2xl`).
- Status indicators (like the "WhatsApp Automated Tool" badge) use pulsing animations (`animate-ping`) to signify real-time, active systems.
- Transitions are deliberately smooth (`duration-300`), ensuring that the application feels fluid and deliberate rather than jarring or instantaneous.
