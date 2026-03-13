# Handoff Notes

## Session outcome
Adjusted the current Chapter I implementation to match the intended Text Only workflow (**show once, hide, then reconstruct**) and reinforced naming guidance that clearly separates Wonderland from sequel datasets.

## What changed
1. **Text Only reconstruction flow hardening (`src/App.tsx`)**
   - Added Text Only state tracking in session state:
     - `textPeekVisible`, `textPeekSeen`
     - `hardFirstSeen`, `hardSecondSeen`
   - Implemented `toggleTextPeek()` so learners explicitly control sentence visibility.
   - Implemented stage guards in `advanceHardTextStage()`:
     - Cannot advance while text is visible.
     - Cannot advance until the relevant stage sentence has been shown at least once.
   - Updated question rendering logic:
     - Text Only now shows a hidden-state hint by default.
     - Learner uses `Show sentence` / `Hide sentence` before reconstruction.
     - In Advanced mode, reconstruction stage keeps text hidden and asks for memory recall.
   - Updated reveal gating:
     - In Text Only, Reveal requires hidden text and prior peek action.

2. **Naming guidance updates (`README.md`)**
   - Updated naming examples to explicitly include Wonderland and Looking-Glass style IDs.
   - Updated audio filename examples to match disambiguated naming.
   - Added a dedicated Text Only operation pattern section documenting expected usage.

## Validation run
- `npm run build` could not be completed in this environment because dependencies were unavailable and `npm install` was blocked (403 from npm registry).

## Screenshot status
- Screenshot not captured in this session because the app could not be started without dependencies.

## Recommended next session
1. Add UI tests for Text Only gating (show/hide requirement and reveal enablement).
2. If adding sequel datasets, keep mirrored naming (`alice-looking-glass-*`) and separate units.
3. Consider adding a subtle progress indicator for Text Only stages (shown/hidden/ready).
