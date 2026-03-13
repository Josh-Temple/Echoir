# Handoff Notes

## Session outcome
This session refined the Echoir home screen UI hierarchy to make **Normal Mode** the clear primary action, reduce top whitespace on mobile, and separate review actions from main start actions.

## What changed
1. **Home layout hierarchy (`src/App.tsx`)**
   - Reduced perceived hero height by using a home-specific container alignment.
   - Updated tagline to: **"Listen, reconstruct, repeat."**
   - Grouped actions into clear sections:
     - Primary section: **Start Normal Mode** (primary button style)
     - Secondary section: **Start Hard Mode** (secondary button style)
     - Tertiary section: review controls in a separate **Review** block
   - Renamed home action label from **"Review Queue"** to **"View Review Queue"**.
   - Added visual de-emphasis for the review section when `dueCount === 0`.
   - Kept MVP behavior intact (no new features, no flow changes).

2. **Styling refinements (`src/styles.css`)**
   - Added dedicated home-screen styles for tighter top spacing and stronger vertical rhythm.
   - Added button-importance styles (`btnPrimary`, `btnSecondary`, `btnGhost`) to reflect action hierarchy.
   - Added section spacing and visual grouping for start actions, review actions, and stats.
   - Kept rounded card, clean typography, and mobile-friendly full-width button sizing.

## Validation run
- `npm run build` passes locally.

## Screenshot status
- Attempted to capture a browser screenshot with Playwright, but the browser process crashed in this environment (`SIGSEGV`), so no screenshot artifact was produced.

## Recommended next session
1. Fine-tune contrast/tone values after reviewing on actual devices.
2. Consider a tiny visual regression check for the home screen to preserve hierarchy over future edits.
3. If browser container stability improves, add an updated mobile screenshot to docs/PRs.
