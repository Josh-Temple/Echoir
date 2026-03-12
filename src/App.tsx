import { useMemo, useState } from 'react';
import Card from './components/Card';
import aliceData from './data/alice.json';
import { isoDate } from './lib/date';
import { playAudio } from './lib/audio';
import { addHistory, getDefaultSettings, loadStorage, saveStorage, upsertReviewEntry } from './lib/storage';
import { sameDayRepeatNeeded } from './lib/scheduler';
import type { Mode, SelfRating, SentenceItem, SessionSettings } from './types';

type View = 'home' | 'setup' | 'question' | 'reveal' | 'summary' | 'settings' | 'reviewQueue';
type HardStage = 'play-first' | 'play-second' | 'reconstruct';

interface SessionState {
  mode: Mode;
  queue: SentenceItem[];
  index: number;
  replayUsed: number;
  sameDayQueue: SentenceItem[];
  ratings: Record<SelfRating, number>;
  reviewItemsAdded: number;
  audioMessage: string;
  hardStage: HardStage;
}

const items = (aliceData as SentenceItem[]).sort((a, b) => a.order - b.order);

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const todayIso = () => isoDate();

const getRecentAttemptCount = (timestamps: string[]): number => {
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return timestamps.filter((t) => now - new Date(t).getTime() <= sevenDaysMs).length;
};

export default function App() {
  const stored = loadStorage();
  const [view, setView] = useState<View>('home');
  const [settings, setSettings] = useState<SessionSettings>(stored.settings ?? getDefaultSettings());
  const [history, setHistory] = useState(stored.history);
  const [reviewQueue, setReviewQueue] = useState(stored.reviewQueue);
  const [session, setSession] = useState<SessionState | null>(null);

  const allUnits = useMemo(() => [...new Set(items.map((x) => x.unit))], []);
  const allLevels = useMemo(() => [...new Set(items.map((x) => x.level))], []);

  const dueItems = reviewQueue.filter((entry) => entry.dueDate <= todayIso());
  const dueCount = dueItems.length;
  const recentAttempts = getRecentAttemptCount(history.map((h) => h.reviewedAt));

  const persist = (nextHistory = history, nextQueue = reviewQueue, nextSettings = settings) => {
    saveStorage({ history: nextHistory, reviewQueue: nextQueue, settings: nextSettings });
  };

  const buildQueue = (mode: Mode, picked: SessionSettings): SentenceItem[] => {
    const filtered = items.filter(
      (item) =>
        (picked.units.length === 0 || picked.units.includes(item.unit)) &&
        (picked.levels.length === 0 || picked.levels.includes(item.level))
    );

    if (mode === 'review') {
      return dueItems
        .map((entry) => filtered.find((item) => item.id === entry.id))
        .filter((item): item is SentenceItem => Boolean(item));
    }

    return shuffle(filtered).slice(0, picked.sessionSize);
  };

  const startSession = (mode: Mode) => {
    const queue = buildQueue(mode, settings);
    if (queue.length === 0) {
      return;
    }

    setSession({
      mode,
      queue,
      index: 0,
      replayUsed: 0,
      sameDayQueue: [],
      ratings: { good: 0, close: 0, missed: 0 },
      reviewItemsAdded: 0,
      audioMessage: '',
      hardStage: mode === 'hard' ? 'play-first' : 'reconstruct'
    });
    setView('question');
  };

  const getPromptItem = (state: SessionState): SentenceItem | null => {
    if (state.mode === 'hard') {
      return state.queue[state.index] ?? null;
    }

    return state.queue[state.index] ?? null;
  };

  const getInterferenceItem = (state: SessionState): SentenceItem | null => {
    if (state.mode !== 'hard') return null;
    return state.queue[state.index + 1] ?? null;
  };

  const promptItem = session ? getPromptItem(session) : null;
  const interferenceItem = session ? getInterferenceItem(session) : null;

  const nextTurn = (state: SessionState): SessionState => {
    const nextIndex = state.index + 1;
    return {
      ...state,
      index: nextIndex,
      replayUsed: 0,
      audioMessage: '',
      hardStage: state.mode === 'hard' ? 'play-first' : 'reconstruct'
    };
  };

  const moveForwardWithoutRating = () => {
    if (!session) return;

    const isQueueEnd = session.index >= session.queue.length - 1;
    const nextState = nextTurn(session);

    if (isQueueEnd || nextState.index >= session.queue.length) {
      setSession(session);
      setView('summary');
      return;
    }

    setSession(nextState);
    setView('question');
  };

  const playCurrentAudio = async () => {
    if (!session || !promptItem) return;

    if (session.mode !== 'hard' && session.replayUsed >= settings.replayCount) {
      return;
    }

    if (session.mode === 'hard') {
      if (session.hardStage === 'play-first') {
        const firstResult = await playAudio(promptItem.audio);
        setSession({
          ...session,
          replayUsed: 1,
          hardStage: interferenceItem ? 'play-second' : 'reconstruct',
          audioMessage: firstResult.message ?? ''
        });
        return;
      }

      if (session.hardStage === 'play-second' && interferenceItem) {
        const secondResult = await playAudio(interferenceItem.audio);
        setSession({
          ...session,
          replayUsed: 1,
          hardStage: 'reconstruct',
          audioMessage: secondResult.message ?? ''
        });
      }

      return;
    }

    const result = await playAudio(promptItem.audio);
    setSession({
      ...session,
      replayUsed: session.replayUsed + 1,
      audioMessage: result.message ?? ''
    });
  };

  const revealAnswer = () => {
    if (!session) return;
    if (session.mode === 'hard' && session.hardStage !== 'reconstruct') return;
    setView('reveal');
  };

  const rateAndNext = (rating: SelfRating) => {
    if (!session || !promptItem) return;

    const existingAttempt = reviewQueue.find((entry) => entry.id === promptItem.id)?.attempts ?? 0;
    const nextQueue = upsertReviewEntry(reviewQueue, promptItem.id, rating, existingAttempt + 1);
    const nextHistory = addHistory(history, {
      id: promptItem.id,
      mode: session.mode,
      selfRating: rating,
      reviewDue: nextQueue.find((entry) => entry.id === promptItem.id)?.dueDate ?? null
    });

    const shouldRepeat = sameDayRepeatNeeded(rating);
    const updatedSameDay = shouldRepeat ? [...session.sameDayQueue, promptItem] : session.sameDayQueue;
    const isQueueEnd = session.index >= session.queue.length - 1;
    const mergedQueue = isQueueEnd && updatedSameDay.length > 0 ? [...session.queue, ...updatedSameDay] : session.queue;

    const currentWithRating: SessionState = {
      ...session,
      queue: mergedQueue,
      sameDayQueue: isQueueEnd ? [] : updatedSameDay,
      ratings: {
        ...session.ratings,
        [rating]: session.ratings[rating] + 1
      },
      reviewItemsAdded: rating === 'good' ? session.reviewItemsAdded : session.reviewItemsAdded + 1
    };

    const nextState = nextTurn(currentWithRating);

    setHistory(nextHistory);
    setReviewQueue(nextQueue);
    persist(nextHistory, nextQueue);

    if (nextState.index >= nextState.queue.length) {
      setSession(currentWithRating);
      setView('summary');
      return;
    }

    setSession(nextState);
    setView('question');
  };

  const toggleChoice = (type: 'units' | 'levels', value: string) => {
    const source = settings[type];
    const next = source.includes(value) ? source.filter((item) => item !== value) : [...source, value];
    const updated = { ...settings, [type]: next };
    setSettings(updated);
    persist(history, reviewQueue, updated);
  };

  if (view === 'home') {
    return (
      <main className="container">
        <Card>
          <h1>Echoir</h1>
          <p>Fast, minimal, repeatable listening reconstruction.</p>
          <div className="actions">
            <button onClick={() => { setSettings((prev) => ({ ...prev, mode: 'normal' })); setView('setup'); }}>Start Normal Mode</button>
            <button onClick={() => { setSettings((prev) => ({ ...prev, mode: 'hard' })); setView('setup'); }}>Start Hard Mode</button>
            <button onClick={() => setView('reviewQueue')}>Review Queue</button>
            <button onClick={() => startSession('review')} disabled={dueCount === 0}>Start Review Session</button>
          </div>
          <p>Review due today: <strong>{dueCount}</strong></p>
          <p>Attempts in last 7 days: <strong>{recentAttempts}</strong></p>
          <button className="link" onClick={() => setView('settings')}>Settings</button>
        </Card>
      </main>
    );
  }

  if (view === 'reviewQueue') {
    return (
      <main className="container">
        <Card>
          <h2>Review Queue</h2>
          <p>Due now: {dueCount}</p>
          {reviewQueue.length === 0 && <p>No review items yet.</p>}
          {reviewQueue.length > 0 && (
            <ul className="queueList">
              {reviewQueue
                .slice()
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .map((entry) => (
                  <li key={entry.id}>
                    <strong>{entry.id}</strong>
                    <span>Due: {entry.dueDate}</span>
                    <span>Last rating: {entry.lastRating}</span>
                  </li>
                ))}
            </ul>
          )}
          <div className="actions">
            <button onClick={() => startSession('review')} disabled={dueCount === 0}>Start due review</button>
            <button onClick={() => setView('home')}>Back</button>
          </div>
        </Card>
      </main>
    );
  }

  if (view === 'setup') {
    return (
      <main className="container">
        <Card>
          <h2>Session Setup</h2>
          <label>
            Mode
            <select
              value={settings.mode}
              onChange={(e) => setSettings({ ...settings, mode: e.target.value as SessionSettings['mode'] })}
            >
              <option value="normal">Normal Mode</option>
              <option value="hard">Advanced Mode</option>
            </select>
          </label>
          <label>
            Session length
            <input
              type="number"
              min={3}
              max={30}
              value={settings.sessionSize}
              onChange={(e) => setSettings({ ...settings, sessionSize: Number(e.target.value) })}
            />
          </label>
          <label>
            Replay count
            <select
              value={settings.replayCount}
              onChange={(e) => setSettings({ ...settings, replayCount: Number(e.target.value) as 1 | 2 })}
              disabled={settings.mode === 'hard'}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </label>
          {settings.mode === 'hard' && <p className="hint">Advanced mode uses one play for each step to keep delay pressure high.</p>}

          <p>Units</p>
          <div className="chips">
            {allUnits.map((unit) => (
              <button
                key={unit}
                className={settings.units.includes(unit) ? 'chip active' : 'chip'}
                onClick={() => toggleChoice('units', unit)}
              >
                {unit}
              </button>
            ))}
          </div>
          <p>Levels</p>
          <div className="chips">
            {allLevels.map((level) => (
              <button
                key={level}
                className={settings.levels.includes(level) ? 'chip active' : 'chip'}
                onClick={() => toggleChoice('levels', level)}
              >
                {level}
              </button>
            ))}
          </div>

          <div className="actions">
            <button onClick={() => startSession(settings.mode)}>Start session</button>
            <button onClick={() => setView('home')}>Back</button>
          </div>
        </Card>
      </main>
    );
  }

  if (view === 'settings') {
    return (
      <main className="container">
        <Card>
          <h2>Settings</h2>
          <p>All data is stored locally in your browser.</p>
          <div className="actions">
            <button
              onClick={() => {
                const fresh = getDefaultSettings();
                setSettings(fresh);
                persist(history, reviewQueue, fresh);
              }}
            >
              Reset session defaults
            </button>
            <button
              onClick={() => {
                setHistory([]);
                setReviewQueue([]);
                persist([], [], settings);
              }}
            >
              Clear learning data
            </button>
            <button onClick={() => setView('home')}>Back</button>
          </div>
        </Card>
      </main>
    );
  }

  if (view === 'summary' && session) {
    return (
      <main className="container">
        <Card>
          <h2>Session Summary</h2>
          <p>Total rated items: {session.ratings.good + session.ratings.close + session.ratings.missed}</p>
          <p>Good: {session.ratings.good}</p>
          <p>Close: {session.ratings.close}</p>
          <p>Missed: {session.ratings.missed}</p>
          <p>Review items added: {session.reviewItemsAdded}</p>
          <p>Suggested next action: run a short review session later today.</p>
          <button onClick={() => setView('home')}>Return home</button>
        </Card>
      </main>
    );
  }

  if (!session || !promptItem) {
    return (
      <main className="container">
        <Card>
          <p>No items available. Adjust filters in Session Setup.</p>
          <button onClick={() => setView('setup')}>Back</button>
        </Card>
      </main>
    );
  }

  if (view === 'question') {
    const hardInstruction =
      session.mode === 'hard'
        ? session.hardStage === 'play-first'
          ? 'Step 1: play sentence 1.'
          : session.hardStage === 'play-second'
            ? 'Step 2: play sentence 2, then reconstruct sentence 1.'
            : 'Reconstruct sentence 1 now, then reveal the answer.'
        : 'Listen. Reconstruct the sentence in your mind or out loud.';

    const canReveal = session.mode !== 'hard' || session.hardStage === 'reconstruct';

    return (
      <main className="container">
        <Card>
          <h2>{session.mode === 'hard' ? 'Advanced mode' : session.mode === 'review' ? 'Review session' : 'Normal mode'}</h2>
          <p>Item {session.index + 1} / {session.queue.length}</p>
          <p>{hardInstruction}</p>
          <button onClick={playCurrentAudio} disabled={session.mode !== 'hard' && session.replayUsed >= settings.replayCount}>
            {session.mode === 'hard'
              ? session.hardStage === 'play-first'
                ? 'Play sentence 1'
                : session.hardStage === 'play-second'
                  ? 'Play sentence 2'
                  : 'Replay disabled in Advanced mode'
              : 'Play audio'}
          </button>
          {session.mode !== 'hard' && <p>Replay used: {session.replayUsed}/{settings.replayCount}</p>}
          {session.audioMessage && <p className="error">{session.audioMessage}</p>}

          <div className="actions">
            <button onClick={revealAnswer} disabled={!canReveal}>Reveal answer</button>
            <button onClick={moveForwardWithoutRating}>Skip item</button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="container">
      <Card>
        <h2>Answer Reveal</h2>
        <p className="answer">{promptItem.text}</p>
        <p>How close was your reconstruction?</p>
        <div className="actions">
          <button onClick={() => rateAndNext('good')}>Good</button>
          <button onClick={() => rateAndNext('close')}>Close</button>
          <button onClick={() => rateAndNext('missed')}>Missed</button>
        </div>
      </Card>
    </main>
  );
}
