# Handoff Notes

## Session outcome
This session fixed a Vercel/TypeScript build failure (`TS2580: Cannot find name 'process'`) without adding new runtime dependencies.

## What changed
1. **Removed Node-global dependency from Vite config**
   - Updated `vite.config.ts` to use `loadEnv(...)` from Vite instead of `process.env`.
   - This avoids requiring Node type declarations during `tsc -b` for `vite.config.ts`.

2. **Kept deployment behavior intact**
   - Production still uses `VITE_BASE_PATH` when set.
   - Default base remains `/` when `VITE_BASE_PATH` is unset.
   - Dev mode still uses `/`.

## Validation run
- `npm run build` passes locally after this change.

## Recommended next session
1. Add CI checks to run `npm run build` and `npm run lint` on each PR.
2. Add a tiny deployment smoke test (open app root + one client-side route) after Vercel deploy.
3. Consider pinning Node/npm versions in project docs or config for reproducible cloud builds.

## Operational reminders
- For Vercel: only set `VITE_BASE_PATH` if deploying under a subpath.
- For GitHub Pages: set `VITE_BASE_PATH` to the repository path during build.
