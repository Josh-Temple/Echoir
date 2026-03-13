# Echoir Handoff

## Current implementation status
Echoir remains MVP-sized and focused on reconstruction + self-rating. This pass improved **Text Only mode** effectiveness while keeping the loop lightweight and mobile-friendly.

## Recent changes (this pass)

### 1) Text Only presentation variants
Session setup now supports three lightweight variants:
- **Standard Recall**
- **Timed Recall** (auto-hide glimpse)
- **Retry Recall** (optional immediate retry after low rating)

Relevant files:
- `src/types/index.ts`
- `src/lib/storage.ts`
- `src/screens/SessionSetupScreen.tsx`

### 2) Timed recall (auto-hide)
Timed Recall now uses simple presets:
- Short: 2s
- Medium: 4s
- Long: 6s

A small helper module controls timing values and keeps this easy to remove later:
- `src/lib/textPresentation.ts`

Auto-hide behavior is handled in `src/App.tsx` via a focused effect.

### 3) Immediate retry after Close/Missed
For **Retry Recall**, after rating `Close` or `Missed`, users can:
- tap **Try once more**
- reattempt from memory
- reveal answer again
- choose a **final self-rating** (or tap **Next** to keep original rating)

This creates a quick recovery path without adding typing/quizzes and allows recovery to be reflected in the final score.

### 4) Optional shadow reveal cue
Text mode can optionally show a short cue before the full answer.
- Uses `chunks[0]` if dataset chunking exists.
- Falls back to first two words.

This is intentionally lightweight and toggleable.

### 5) Future-friendly chunk support
`SentenceItem` now supports optional `chunks?: string[]` for later chunk-based presentation without forcing dataset migration now.

## Why this stays MVP-safe
- Core loop remains fast: **Look → Reconstruct → Reveal → Rate → Next**.
- Self-rating remains central.
- No Japanese, no translation, no multiple-choice, no typing requirements.
- New options are small and removable if they add friction.

## Suggested next priorities
1. Add small unit tests for:
   - timed auto-hide guard behavior,
   - retry flow transitions,
   - shadow cue selection (`chunks` vs fallback).
2. Watch learner friction: if any variant feels noisy, disable by default or remove.
3. Continue content scaling via datasets, not feature branching.


### 6) Lint baseline restored
- Added `eslint.config.js` for ESLint v9 flat-config compatibility.
- `npm run lint` can now run once dependencies are available.

### 7) Added Winnie-the-Pooh Chapter I dataset
- Added `src/data/winnie.json` with Chapter I content normalized for app ingestion.
- Cleaned visible copy artifacts from the provided source text (line-wrap splits and spacing noise).
- Wired new dataset into `src/data/index.ts` so it is included in session item loading.
- Updated README sample dataset list accordingly.
