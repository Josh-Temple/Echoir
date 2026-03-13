# Echoir

Echoir is a fast, minimal listening-and-reconstruction app for intermediate+ English learners.

Core value: **reconstruction after listening**, not feature breadth.

## Product scope
- English-only learning flow.
- No Japanese in learning UX.
- No translation-based activity.
- No multiple-choice activity.
- Self-rating is the center of the loop.

## Learning modes

### Normal Mode (primary)
1. Input sentence (audio or text).
2. Reconstruct mentally or out loud.
3. Reveal answer.
4. Self-rate: **Good / Close / Missed**.
5. Continue quickly.

### Hard Mode (advanced)
1. Sentence 1 input.
2. Sentence 2 interference input.
3. Reconstruct sentence 1.
4. Reveal and self-rate.

## Study mode
- **Text Only** (default)
  - **Standard Recall**: Look → Hide → Reconstruct → Reveal → Rate
  - **Timed Recall**: brief auto-hide glimpse (2s / 4s / 6s)
  - **Retry Recall**: after `Close`/`Missed`, optional **Try once more** before moving on, then final re-rate
  - Optional **shadow reveal cue** before full answer
- **Audio + Text**: play audio, reconstruct, reveal, rate

## Tech stack
- React
- TypeScript
- Vite
- localStorage

## Dataset format
Each file under `src/data/*.json` is a JSON array of sentence items.

```json
{
  "id": "alice-wonderland-1865-c1-b2-001",
  "unit": "alice-wonderland-ch1",
  "level": "b2",
  "order": 1,
  "text": "Alice was beginning to get very tired of sitting by her sister on the bank.",
  "audio": "/audio/alice-wonderland-ch1/alice-wonderland-1865-c1-b2-001--n.mp3",
  "tags": ["alice-wonderland", "chapter1"],
  "chunks": ["Alice was beginning", "to get very tired"]
}
```

Required fields:
- `id`, `unit`, `level`, `order`, `text`, `audio`

Optional fields:
- `tags`
- `chunks` (future-friendly text chunk cues)

## Naming convention (standardized)
Echoir uses one future-proof identifier style everywhere:

```text
<work>-<sourceYear>-<chapter>-<level>-<serial>
```

Examples:
- `alice-wonderland-1865-c1-b2-001`
- `sherlock-hound-1902-c1-b2-001`

Audio file rule:

```text
/audio/<unit>/<sentence_id>--n.mp3
```

## Included sample datasets
- `src/data/alice.json` (`alice-wonderland-ch1`)
- `src/data/sherlock.json` (`sherlock-hound-ch1`)

The app loads both datasets through `src/data/index.ts`.

## Local development
```bash
npm install --offline
npm run dev
```

Build:
```bash
npm run build
```

Lint:
```bash
npm run lint
```

## Deployment
### Vercel
- Build command: `npm run build`
- Output directory: `dist`

### GitHub Pages
```bash
VITE_BASE_PATH=/Echoir/ npm run build
```

## Review logic (MVP)
- `Good`: remove from review queue.
- `Close`: same-session repeat + future review.
- `Missed`: same-session repeat + future review.
- Future intervals by attempt: **1 day, 3 days, 7 days**.

## Project status and next priorities
See `HANDOFF.md` for implementation status, recent changes, and next priorities.


## Tooling note
- ESLint v9 uses `eslint.config.js` in this repository.
