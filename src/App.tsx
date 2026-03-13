import { useEffect, useMemo, useState } from 'react';
import Card from './components/Card';
import { sentenceItems } from './data';
import { playAudio } from './lib/audio';
import { isoDate } from './lib/date';
import { applyRatingToSession, getRecentAttemptCount } from './lib/review';
import {
  buildSessionQueue,
  createSessionState,
  getInterferenceItem,
  isSessionEnd,
  nextTurnState,
  type SessionState
} from './lib/session';
import { getShadowCue, timedRevealSeconds } from './lib/textPresentation';
import { addHistory, getDefaultSettings, loadStorage, saveStorage, upsertReviewEntry } from './lib/storage';
import HomeScreen from './screens/HomeScreen';
import QuestionScreen from './screens/QuestionScreen';
import RevealScreen from './screens/RevealScreen';
import ReviewQueueScreen from './screens/ReviewQueueScreen';
import SessionSetupScreen from './screens/SessionSetupScreen';
import SessionSummaryScreen from './screens/SessionSummaryScreen';
import SettingsScreen from './screens/SettingsScreen';
import type { Mode, SelfRating, SessionSettings } from './types';

type View = 'home' | 'setup' | 'question' | 'reveal' | 'summary' | 'settings' | 'reviewQueue';

interface RevealRetryState {
  rating: Exclude<SelfRating, 'good'>;
  stage: 'offer' | 'retry';
  answerVisible: boolean;
}

const todayIso = () => isoDate();

export default function App() {
  const stored = loadStorage();
  const [view, setView] = useState<View>('home');
  const [settings, setSettings] = useState<SessionSettings>(stored.settings ?? getDefaultSettings());
  const [history, setHistory] = useState(stored.history);
  const [reviewQueue, setReviewQueue] = useState(stored.reviewQueue);
  const [session, setSession] = useState<SessionState | null>(null);
  const [revealFullAnswer, setRevealFullAnswer] = useState(false);
  const [revealRetryState, setRevealRetryState] = useState<RevealRetryState | null>(null);

  const allUnits = useMemo(() => [...new Set(sentenceItems.map((x) => x.unit))], []);
  const allLevels = useMemo(() => [...new Set(sentenceItems.map((x) => x.level))], []);

  const dueItems = reviewQueue.filter((entry) => entry.dueDate <= todayIso());
  const dueCount = dueItems.length;
  const recentAttempts = getRecentAttemptCount(history.map((h) => h.reviewedAt));

  useEffect(() => {
    if (!session || settings.studyMode !== 'text' || settings.textPresentation !== 'timed' || !session.textPeekVisible) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSession((prev) => {
        if (!prev || !prev.textPeekVisible) return prev;
        return { ...prev, textPeekVisible: false };
      });
    }, timedRevealSeconds[settings.timedRevealPreset] * 1000);

    return () => window.clearTimeout(timer);
  }, [session, settings.studyMode, settings.textPresentation, settings.timedRevealPreset]);

  const persist = (nextHistory = history, nextQueue = reviewQueue, nextSettings = settings) => {
    saveStorage({ history: nextHistory, reviewQueue: nextQueue, settings: nextSettings });
  };

  const updateSettings = (updated: SessionSettings) => {
    setSettings(updated);
    persist(history, reviewQueue, updated);
  };

  const startSession = (mode: Mode) => {
    const queue = buildSessionQueue(
      sentenceItems,
      settings,
      mode,
      dueItems.map((entry) => entry.id)
    );

    if (queue.length === 0) return;

    persist(history, reviewQueue, settings);
    setSession(createSessionState(mode, queue));
    setRevealFullAnswer(false);
    setRevealRetryState(null);
    setView('question');
  };

  const promptItem = session ? session.queue[session.index] ?? null : null;
  const interferenceItem = session ? getInterferenceItem(session) : null;

  const finalizeRating = (rating: SelfRating) => {
    if (!session || !promptItem) return;

    const existingAttempt = reviewQueue.find((entry) => entry.id === promptItem.id)?.attempts ?? 0;
    const nextQueue = upsertReviewEntry(reviewQueue, promptItem.id, rating, existingAttempt + 1);
    const nextHistory = addHistory(history, {
      id: promptItem.id,
      mode: session.mode,
      selfRating: rating,
      reviewDue: nextQueue.find((entry) => entry.id === promptItem.id)?.dueDate ?? null
    });

    const { currentWithRating, nextState } = applyRatingToSession(session, promptItem, rating);

    setHistory(nextHistory);
    setReviewQueue(nextQueue);
    persist(nextHistory, nextQueue);
    setRevealRetryState(null);
    setRevealFullAnswer(false);

    if (nextState.index >= nextState.queue.length) {
      setSession(currentWithRating);
      setView('summary');
      return;
    }

    setSession(nextState);
    setView('question');
  };

  const moveForwardWithoutRating = () => {
    if (!session) return;

    const nextState = nextTurnState(session);
    setRevealRetryState(null);
    setRevealFullAnswer(false);

    if (isSessionEnd(session) || nextState.index >= session.queue.length) {
      setSession(session);
      setView('summary');
      return;
    }

    setSession(nextState);
    setView('question');
  };

  const toggleTextPeek = () => {
    if (!session) return;

    const nextVisible = !session.textPeekVisible;
    const isFirstStage = session.mode === 'hard' && session.hardStage === 'play-first';
    const isSecondStage = session.mode === 'hard' && session.hardStage === 'play-second';

    setSession({
      ...session,
      textPeekVisible: nextVisible,
      textPeekSeen: session.textPeekSeen || nextVisible,
      hardFirstSeen: session.hardFirstSeen || (isFirstStage && nextVisible),
      hardSecondSeen: session.hardSecondSeen || (isSecondStage && nextVisible)
    });
  };

  const advanceHardTextStage = () => {
    if (!session || session.mode !== 'hard') return;
    if (session.textPeekVisible) return;

    if (session.hardStage === 'play-first') {
      if (!session.hardFirstSeen) return;
      setSession({ ...session, hardStage: interferenceItem ? 'play-second' : 'reconstruct', textPeekVisible: false });
      return;
    }

    if (session.hardStage === 'play-second') {
      if (!session.hardSecondSeen) return;
      setSession({ ...session, hardStage: 'reconstruct', textPeekVisible: false });
    }
  };

  const playCurrentAudio = async () => {
    if (!session || !promptItem) return;
    if (session.mode !== 'hard' && session.replayUsed >= settings.replayCount) return;

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
    setSession({ ...session, replayUsed: session.replayUsed + 1, audioMessage: result.message ?? '' });
  };

  const revealAnswer = () => {
    if (!session) return;
    if (session.mode === 'hard' && session.hardStage !== 'reconstruct') return;
    setRevealFullAnswer(settings.studyMode !== 'text' || !settings.shadowReveal);
    setRevealRetryState(null);
    setView('reveal');
  };

  const rateAndNext = (rating: SelfRating) => {
    const shouldOfferRetry = settings.studyMode === 'text' && settings.textPresentation === 'retry' && rating !== 'good';

    if (shouldOfferRetry) {
      setRevealRetryState({
        rating,
        stage: 'offer',
        answerVisible: true
      });
      return;
    }

    finalizeRating(rating);
  };

  const toggleChoice = (type: 'units' | 'levels', value: string) => {
    const source = settings[type];
    const next = source.includes(value) ? source.filter((item) => item !== value) : [...source, value];
    updateSettings({ ...settings, [type]: next });
  };

  if (view === 'home') {
    return (
      <HomeScreen
        dueCount={dueCount}
        recentAttempts={recentAttempts}
        onStartNormalMode={() => {
          updateSettings({ ...settings, mode: 'normal' });
          setView('setup');
        }}
        onStartHardMode={() => {
          updateSettings({ ...settings, mode: 'hard' });
          setView('setup');
        }}
        onOpenReviewQueue={() => setView('reviewQueue')}
        onStartReviewSession={() => startSession('review')}
        onOpenSettings={() => setView('settings')}
      />
    );
  }

  if (view === 'reviewQueue') {
    return (
      <ReviewQueueScreen
        reviewQueue={reviewQueue}
        dueCount={dueCount}
        onStartDueReview={() => startSession('review')}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'setup') {
    return (
      <SessionSetupScreen
        settings={settings}
        allUnits={allUnits}
        allLevels={allLevels}
        onUpdateSettings={updateSettings}
        onToggleChoice={toggleChoice}
        onStartSession={() => startSession(settings.mode)}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'settings') {
    return (
      <SettingsScreen
        studyMode={settings.studyMode}
        onResetDefaults={() => updateSettings(getDefaultSettings())}
        onClearLearningData={() => {
          setHistory([]);
          setReviewQueue([]);
          persist([], [], settings);
        }}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'summary' && session) {
    return <SessionSummaryScreen session={session} onBackHome={() => setView('home')} />;
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
    return (
      <QuestionScreen
        session={session}
        promptItem={promptItem}
        interferenceItem={interferenceItem}
        settings={settings}
        onToggleTextPeek={toggleTextPeek}
        onAdvanceHardTextStage={advanceHardTextStage}
        onPlayCurrentAudio={playCurrentAudio}
        onRevealAnswer={revealAnswer}
        onSkip={moveForwardWithoutRating}
      />
    );
  }

  return (
    <RevealScreen
      promptItem={promptItem}
      cueText={getShadowCue(promptItem)}
      showShadowCue={settings.studyMode === 'text' && settings.shadowReveal}
      fullAnswerVisible={revealFullAnswer}
      retryState={revealRetryState}
      onRevealFullAnswer={() => setRevealFullAnswer(true)}
      onRate={rateAndNext}
      onStartRetry={() => setRevealRetryState((prev) => (prev ? { ...prev, stage: 'retry', answerVisible: false } : prev))}
      onRevealRetryAnswer={() => setRevealRetryState((prev) => (prev ? { ...prev, answerVisible: !prev.answerVisible } : prev))}
      onSkipRetry={() => {
        if (!revealRetryState) return;
        finalizeRating(revealRetryState.rating);
      }}
      onRateAfterRetry={(rating) => {
        finalizeRating(rating);
      }}
    />
  );
}
