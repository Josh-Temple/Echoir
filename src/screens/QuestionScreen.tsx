import Card from '../components/Card';
import { timedRevealSeconds } from '../lib/textPresentation';
import type { SessionSettings, SentenceItem } from '../types';
import type { SessionState } from '../lib/session';

interface QuestionScreenProps {
  session: SessionState;
  promptItem: SentenceItem;
  interferenceItem: SentenceItem | null;
  settings: SessionSettings;
  onToggleTextPeek: () => void;
  onAdvanceHardTextStage: () => void;
  onPlayCurrentAudio: () => void;
  onRevealAnswer: () => void;
  onSkip: () => void;
}

export default function QuestionScreen({
  session,
  promptItem,
  interferenceItem,
  settings,
  onToggleTextPeek,
  onAdvanceHardTextStage,
  onPlayCurrentAudio,
  onRevealAnswer,
  onSkip
}: QuestionScreenProps) {
  const isTextOnly = settings.studyMode === 'text';
  const isTimedRecall = isTextOnly && settings.textPresentation === 'timed';

  const instruction =
    session.mode === 'hard'
      ? isTextOnly
        ? session.hardStage === 'play-first'
          ? 'Look at sentence 1.'
          : session.hardStage === 'play-second'
            ? 'Look at sentence 2, then reconstruct sentence 1.'
            : 'Reconstruct sentence 1, then reveal answer.'
        : session.hardStage === 'play-first'
          ? 'Step 1: play sentence 1.'
          : session.hardStage === 'play-second'
            ? 'Step 2: play sentence 2, then reconstruct sentence 1.'
            : 'Reconstruct sentence 1 now, then reveal the answer.'
      : isTextOnly
        ? 'Look, reconstruct, reveal, self-rate.'
        : 'Listen. Reconstruct the sentence in your mind or out loud.';

  const canRevealByMode = session.mode !== 'hard' || session.hardStage === 'reconstruct';
  const canReveal = isTextOnly
    ? canRevealByMode &&
      !session.textPeekVisible &&
      (session.mode === 'hard' ? session.hardFirstSeen && (interferenceItem ? session.hardSecondSeen : true) : session.textPeekSeen)
    : canRevealByMode;

  const textPrompt = session.mode === 'hard' && session.hardStage === 'play-second' && interferenceItem
    ? interferenceItem.text
    : promptItem.text;

  return (
    <main className="container">
      <Card>
        <h2>{session.mode === 'hard' ? 'Advanced mode' : session.mode === 'review' ? 'Review session' : 'Normal mode'}</h2>
        <p>Item {session.index + 1} / {session.queue.length}</p>
        <p>{instruction}</p>

        {isTextOnly ? (
          <>
            {session.mode === 'hard' && session.hardStage === 'reconstruct' ? (
              <p className="hint">Sentence is hidden. Reconstruct from memory, then reveal answer.</p>
            ) : (
              <>
                {session.textPeekVisible ? <p className="answer">{textPrompt}</p> : <p className="hint">Sentence is hidden.</p>}
                <button onClick={onToggleTextPeek}>{session.textPeekVisible ? 'Hide' : 'Look'}</button>
              </>
            )}

            {isTimedRecall && (
              <p className="hint">Timed glimpse: {timedRevealSeconds[settings.timedRevealPreset]}s auto-hide.</p>
            )}

            {session.mode === 'hard' && session.hardStage !== 'reconstruct' && (
              <button onClick={onAdvanceHardTextStage} disabled={session.textPeekVisible}>
                {session.hardStage === 'play-first' ? 'Continue to sentence 2' : 'Start reconstruction'}
              </button>
            )}
          </>
        ) : (
          <>
            <button onClick={onPlayCurrentAudio} disabled={session.mode !== 'hard' && session.replayUsed >= settings.replayCount}>
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
          </>
        )}

        <div className="actions">
          <button onClick={onRevealAnswer} disabled={!canReveal}>Reveal answer</button>
          <button onClick={onSkip}>Skip item</button>
        </div>
      </Card>
    </main>
  );
}
