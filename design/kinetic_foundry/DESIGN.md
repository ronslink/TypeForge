# Design System Specification: Industrial Precision

## 1. Overview & Creative North Star
The Creative North Star for this system is **"The Kinetic Foundry."** 

This design system rejects the "softness" of modern SaaS interfaces in favor of a high-contrast, mechanical aesthetic that feels machined rather than drawn. It is an editorial-technical hybrid—combining the authoritative weight of a high-end broadsheet with the cold precision of a laboratory instrument. 

To break the "template" look, we utilize **Intentional Asymmetry**. Layouts should never feel perfectly mirrored; lean into heavy left-aligned display type balanced by sparse, high-density technical data on the right. Overlapping elements and "broken" grids are encouraged to create a sense of physical assembly.

---

## 2. Colors & Atmospheric Depth
Our palette is rooted in a deep, atmospheric charcoal to simulate a darkened workshop where only the most critical data points are illuminated.

- **Primary (Amber #f0a500):** Use for high-impact actions and critical highlights. It represents "Active Power."
- **Secondary (Teal #41e4c0):** Reserved for "Precision Metrics." It is the color of laser-calibration and success.
- **Error (Soft Red #ffb4ab):** A muted, technical red that signals caution without breaking the atmospheric tone.

### The "No-Line" Rule
**Explicit Prohibition:** 1px solid borders for sectioning are strictly forbidden. 
Structural boundaries must be defined through:
1.  **Tonal Transitions:** Moving from `surface` (#111319) to `surface_container_low` (#191b22).
2.  **Negative Space:** Utilizing the Spacing Scale (e.g., `spacing.12` or `spacing.16`) to create distinct "islands" of content.

### Surface Hierarchy & Nesting
Treat the UI as a series of machined plates.
- **Base Layer:** `surface_dim` (#111319).
- **In-set Containers:** Use `surface_container_lowest` (#0c0e14) to create "wells" for technical input.
- **Raised Components:** Use `surface_container_high` (#282a30) for cards that require user focus.

### The "Glass & Gradient" Rule
To add "soul" to the mechanical rigidity, floating elements (modals, tooltips) must use **Glassmorphism**. Apply `surface_container` with a `backdrop-blur` of 12px-20px. For primary CTAs, use a subtle linear gradient from `primary` (#ffc56c) to `primary_container` (#f0a500) at a 45-degree angle to simulate the sheen of polished brass.

---

## 3. Typography: The Editorial Tech-Stack
We use a tri-font system to establish a hierarchy of authority, utility, and readability.

- **Display & Headlines (Newsreader):** Use for high-impact editorial moments. It provides a human, historical counterpoint to the machine.
  - *Token:* `display-lg` (3.5rem) or `headline-lg` (2rem).
- **Body Text (Manrope):** Use for all long-form descriptions and UI instructions. It is neutral and highly legible.
  - *Token:* `body-md` (0.875rem).
- **Technical Labels & Data (Space Grotesk):** Use for all metrics, buttons, and metadata. This mono-spaced font conveys "Precision."
  - *Token:* `label-md` (0.75rem).

---

## 4. Elevation & Depth: Tonal Layering
In this design system, we do not use "shadows" in the traditional sense. We use light and material density.

- **The Layering Principle:** Achieve lift by stacking. A `surface_container_highest` (#33343b) element sitting on a `surface` background provides all the "elevation" required.
- **Ambient Glow:** If a floating element needs further separation, use a diffused glow instead of a shadow. Set the shadow color to `primary` (#ffba44) at 5% opacity with a 32px blur.
- **The Ghost Border:** For high-density data tables where separation is critical, use the `outline_variant` (#514533) at **15% opacity**. This creates a "hairline" feel that suggests a seam rather than a border.

---

## 5. Components

### Notched Buttons
All buttons must have a **0px border-radius**. Primary and active states must feature a **notched corner** (bottom-right) using a CSS `clip-path`.
- **Primary:** `primary_container` background, `on_primary` text (Space Grotesk, All Caps).
- **State Change:** On hover, the notch deepens or shifts to the top-right.

### High-Density Stat Cards
Cards should feel like "Instrument Clusters."
- **Background:** `surface_container_low`.
- **Overlay:** A subtle 1px dot-grid pattern or "crosshair" corner marks using `outline_variant`.
- **Content:** Large `secondary` (Teal) metrics in Space Grotesk, paired with `label-sm` descriptors.

### Monospace Typing Interfaces
Input fields are styled as "Command Lines."
- **Style:** No fill, only a `surface_container_highest` bottom-bar.
- **Active State:** The bottom-bar shifts to `primary` (Amber).
- **Font:** All user input must be in Space Grotesk to maintain the technical persona.

### Lists & Tables
- **Rule:** Forbid divider lines.
- **Execution:** Use alternating row fills (e.g., `surface` vs `surface_container_low`) or 1.1rem (`spacing.5`) vertical gaps.

---

## 6. Do’s and Don’ts

### Do:
- **Do** lean into extreme white space. A single technical metric in a large empty `surface` container feels more "premium" than a crowded dashboard.
- **Do** use `secondary` (Teal) sparingly. It should only represent "Go" or "Calibrated."
- **Do** align serif display type (Newsreader) against rigid mono-spaced labels (Space Grotesk) to create editorial tension.

### Don’t:
- **Don’t** use a border-radius of any value. Not even 1px. The system is "Industrial," not "Consumer."
- **Don’t** use standard "drop shadows." Use background color shifts.
- **Don’t** center-align long-form text. Keep the layout grounded in a left-heavy, technical grid.
- **Don’t** use icons with rounded terminals. Use sharp, geometric iconography to match the 0px radius rule.