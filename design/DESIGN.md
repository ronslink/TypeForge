# Design System Specification: Industrial Precision

## 1. Overview & Creative North Star
### The Kinetic Foundry
This design system is built upon the "Kinetic Foundry" North Star—a philosophy where the raw, industrial power of a forge meets the microscopic precision of modern digital engineering. We are moving away from the soft, rounded "friendly" web of the last decade. Instead, we embrace a high-contrast, editorial aesthetic that rewards accuracy and celebrates the mechanical soul of typing.

The system breaks the "standard template" look through **intentional asymmetry**, **high-density technical readouts**, and **structural "notched" geometry**. We do not use soft corners; we use sharp, machined edges. We do not use borders; we use tonal shifts and light-leak glows to define space.

---

## 2. Colors & Chromatic Rigor
The palette is rooted in a deep, atmospheric charcoal to provide a high-contrast stage for the "Amber" action color. This mimics the glow of molten metal in a dark workshop.

### Palette Strategy
- **Primary (Amber - `#ffc56c` / `#f0a500`):** Use for high-intent actions. This is the "heat" of the forge.
- **Secondary (Teal - `#41e4c0`):** Dedicated exclusively to accuracy, success, and precision metrics.
- **Tertiary (Soft Red - `#ffb4ab`):** Reserved for errors and friction points.
- **Surface Architecture:** 
    - `surface`: `#111319` (The foundational anvil)
    - `surface_container`: `#1d2025` (Standard component background)
    - `surface_container_highest`: `#32353b` (Active or highlighted states)

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. For instance, a list of typing stats (`surface_container_low`) should sit on the main page background (`surface`) without a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. To create depth:
1.  **Level 0:** `background` (#111319) - The base environment.
2.  **Level 1:** `surface_container` (#1d2025) - Main content areas.
3.  **Level 2:** `surface_container_high` (#272a30) - Nested elements like cards or technical readouts.

### The "Glass & Glow" Rule
To evoke a high-tech engine feel, use **Glassmorphism** for floating elements (e.g., tooltips, dropdowns). Apply `surface_variant` with a 60% opacity and a `20px` backdrop-blur. Main CTAs should feature a subtle "Amber" outer glow (`0px 0px 15px rgba(240, 165, 0, 0.3)`) to simulate the heat of the action.

---

## 3. Typography: The Editorial Cadence
We utilize a triad of typefaces to balance heritage with technical utility.

| Category | Token | Font Family | Purpose |
| :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Newsreader (Serif) | High-impact headlines. Large, elegant, and authoritative. |
| **Headline** | `headline-md` | Newsreader (Serif) | Section headers that require an editorial "voice." |
| **Technical** | `label-md` | Space Grotesk (Mono) | High-density stats, WPM, and accuracy percentages. |
| **Body** | `body-md` | Manrope (Sans) | Instructional text and long-form reading for maximum legibility. |

**Hierarchy Note:** Use extreme scale differences. A `display-lg` headline should sit directly adjacent to `label-sm` technical metadata to create a "Technical Journal" aesthetic.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering**, not structural lines.

- **The Layering Principle:** Avoid shadows for static elements. Instead, use the `surface-container` tiers to create a "stacked" effect. A `surface_container_highest` card on a `surface` background provides all the separation required.
- **Ambient Shadows:** For floating modals, use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5)`. The shadow must feel like an absence of light, not a printed grey blur.
- **Ghost Borders:** If a boundary is strictly required for accessibility, use the `outline_variant` token at **15% opacity**. 100% opaque borders are strictly forbidden.

---

## 5. Components: The Machined Aesthetic

### Buttons (The Notched Forge)
All buttons must abandon the "rounded-rect" standard.
- **Shape:** Sharp `0px` corners. Use a `clip-path` to create a 4px "notched" corner on the top-right and bottom-left only.
- **Primary:** `primary_container` background with `on_primary_container` text.
- **Hover State:** Transition to `primary_fixed` with a subtle `1px` Amber glow.

### High-Density Stat Cards
- **Structure:** No borders. Use `surface_container_low`. 
- **Layout:** Use a subtle `10px` grid overlay (opacity 5%) as a background pattern to emphasize the "precision engine" theme.
- **Typography:** Metrics (WPM/Accuracy) should use `label-md` in `secondary` (Teal).

### Typing Input Fields
- **State:** Unfocused inputs are `surface_container_lowest`. 
- **Focus State:** The container shifts to `surface_bright`. Use a `2px` solid Amber "notch" in the bottom-right corner rather than a full border.
- **Monospace Integration:** All typing input must use `DM Mono` (or the `spaceGrotesk` label token) to maintain code-like precision.

### Lists & Dividers
**Rule:** Never use horizontal lines. Separate list items using the spacing scale (e.g., `spacing-4`) or by alternating background shifts between `surface_container` and `surface_container_low`.

---

## 6. Do’s and Don’ts

### Do:
- **Use Intentional Asymmetry:** Align text to the left but offset technical stats to a rigid right-hand grid.
- **Embrace "Data Density":** Don't be afraid of showing multiple data points (WPM, Burst, Raw, Consistency) simultaneously.
- **Apply Tonal Depth:** Use the `surface-container` scale to create clear visual hierarchy.

### Don't:
- **No Border Radius:** Never use `border-radius`. If a corner feels too sharp, use a `clip-path` notch, not a curve.
- **No Generic Icons:** Icons should be thin-stroke (1px or 1.5px) and geometric. Avoid "filled" or "bubbly" icon sets.
- **No Pure Black:** Never use `#000000`. Use the `surface_container_lowest` (#0b0e13) for the deepest shadows to maintain tonal texture.

### Accessibility Note:
While we use low-opacity "Ghost Borders," ensure that the contrast between `surface` and `surface_container` maintains at least a 3:1 ratio for UI components and 4.5:1 for typography. High-contrast Amber (`#f0a500`) is our primary tool for ensuring core actions are visible to all users.