# Handoff Notes

## Session outcome
This session prepared the project for Vercel deployment while keeping GitHub Pages compatibility.

## What changed
1. **Vite base path handling is now environment-driven**
   - Updated `vite.config.ts` so production builds use `VITE_BASE_PATH` when provided, and default to `/`.
   - Dev mode always uses `/`.

2. **Vercel SPA routing support added**
   - Added `vercel.json` with rewrite to `index.html` so direct URL access works for SPA behavior.

3. **README deployment docs updated**
   - Added a dedicated Vercel deployment section (build/install/output settings).
   - Updated GitHub Pages instructions to use `VITE_BASE_PATH=/Echoir/ npm run build`.

## Validation run
- `npm run build` could not be validated locally in this environment because npm package installation returned 403 from the registry.

## Recommended next session
1. Configure a production domain and set it in Vercel project settings.
2. Add a lightweight CI workflow (`npm run build` + `npm run lint`) before deployment.
3. Consider adding a minimal health-check page or smoke test for release confidence.

## Operational reminders
- For Vercel: no env var is required unless deploying under a subpath.
- For GitHub Pages: set `VITE_BASE_PATH` to the repository path during build.
