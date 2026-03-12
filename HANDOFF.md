# Handoff Notes

## Session outcome
This session focused on repairing the MVP flow quality and aligning behavior more tightly with the product constraints:
- Normal Mode speed and clarity first
- Hard Mode as advanced optional extension
- English-only learning flow
- No multiple-choice / no translation

## What changed
1. **Session flow split and friction reduction**
   - Split exercise into explicit Question and Answer Reveal screens.
   - Kept reveal → self-rate → next as a short single-action chain.

2. **Hard Mode behavior improved**
   - Implemented explicit one-sentence delay stages:
     - play sentence 1
     - play sentence 2
     - reconstruct sentence 1
     - reveal + self-rate

3. **Review UX improvements**
   - Added dedicated Review Queue screen with due count and queue list.
   - Added “Start due review” path from queue screen.

4. **Missing audio resilience**
   - Kept clear English-only error messaging.
   - Added skip control in question flow so broken items do not block session tempo.

5. **Home and stats polish**
   - Home now shows due review count and recent attempt count (7-day view).

6. **Documentation refresh**
   - Rewrote README for practical setup/content authoring clarity.
   - Added explicit mode differences, naming rules, folder structure, and roadmap.

## Current known limitations
- Dataset loading is still static (`alice.json` only).
- No automated test suite yet.
- Hard Mode is functional for delayed flow but still intentionally minimal in controls.

## Recommended next session
1. Add tests for scheduler/storage/session progression.
2. Extract session logic into dedicated mode modules (`/src/modes`) for cleaner maintenance.
3. Add optional per-session review-only setup controls (size/filter) before start.
4. Add richer stats cards while keeping UI minimal.

## Operational reminders
- Keep stable IDs as primary keys; never key by sentence text.
- Keep all learning-facing copy English-only.
- Continue manual audio placement under `public/audio/<work>/`.
