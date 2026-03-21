# Echoir Handoff

## Current implementation status
Echoir remains MVP-sized and focused on reconstruction + self-rating. This pass adds baseline **PWA support** so the app can be installed and can reopen offline after the first successful load.

## Recent changes (this pass)

### 1) Baseline PWA implementation
The app now includes the minimum pieces required for Progressive Web App behavior:
- web app manifest
- installable text-based SVG app icons
- service worker registration in the production client
- offline caching for the app shell and same-origin GET responses

Relevant files:
- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icons/icon.svg`
- `public/icons/icon-maskable.svg`
- `src/lib/pwa.ts`
- `src/main.tsx`
- `index.html`

### 2) Deployment compatibility
The service worker is registered with `import.meta.env.BASE_URL` scope so the PWA works when deployed at the site root or under a subpath such as GitHub Pages.

### 3) Documentation refresh
- Updated `README.md` with a dedicated PWA section.
- Replaced this handoff file so the latest session status reflects the new PWA work.

## Current PWA behavior
- Works in production builds over HTTPS (or localhost during browser checks).
- Caches the app shell during service worker install.
- Caches same-origin GET responses after first fetch.
- Supports install prompts in browsers that expose install UI.

## Suggested next priorities
1. Add a small in-app install prompt UX using `beforeinstallprompt` so mobile/desktop install is easier to discover.
2. Add version/update messaging when a new service worker is available.
3. Consider a more selective runtime caching strategy if audio files become large.
4. If audio assets are added to production, verify offline expectations explicitly for those files.
