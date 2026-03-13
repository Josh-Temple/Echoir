import Card from '../components/Card';
import type { SelfRating, SentenceItem } from '../types';

interface RevealRetryState {
  rating: Exclude<SelfRating, 'good'>;
  stage: 'offer' | 'retry';
  answerVisible: boolean;
}

interface RevealScreenProps {
  promptItem: SentenceItem;
  cueText: string;
  showShadowCue: boolean;
  fullAnswerVisible: boolean;
  retryState: RevealRetryState | null;
  onRevealFullAnswer: () => void;
  onRate: (rating: SelfRating) => void;
  onStartRetry: () => void;
  onRevealRetryAnswer: () => void;
  onSkipRetry: () => void;
  onRateAfterRetry: (rating: SelfRating) => void;
}

export default function RevealScreen({
  promptItem,
  cueText,
  showShadowCue,
  fullAnswerVisible,
  retryState,
  onRevealFullAnswer,
  onRate,
  onStartRetry,
  onRevealRetryAnswer,
  onSkipRetry,
  onRateAfterRetry
}: RevealScreenProps) {
  return (
    <main className="container">
      <Card>
        <h2>Answer Reveal</h2>

        {retryState ? (
          <>
            {retryState.stage === 'offer' ? (
              <>
                <p className="answer">{promptItem.text}</p>
                <p className="hint">Try once more before next?</p>
                <div className="actions">
                  <button onClick={onStartRetry}>Try once more</button>
                  <button onClick={onSkipRetry}>Next</button>
                </div>
              </>
            ) : (
              <>
                {!retryState.answerVisible ? (
                  <p className="hint">Reconstruct again from memory.</p>
                ) : (
                  <p className="answer">{promptItem.text}</p>
                )}
                <div className="actions">
                  <button onClick={onRevealRetryAnswer}>{retryState.answerVisible ? 'Hide' : 'Reveal answer'}</button>
                  <button onClick={onSkipRetry}>Next</button>
                </div>
                {retryState.answerVisible && (
                  <>
                    <p>Final self-rating</p>
                    <div className="actions">
                      <button onClick={() => onRateAfterRetry('good')}>Good</button>
                      <button onClick={() => onRateAfterRetry('close')}>Close</button>
                      <button onClick={() => onRateAfterRetry('missed')}>Missed</button>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {showShadowCue && !fullAnswerVisible ? (
              <>
                <p className="hint">Cue</p>
                <p className="answer">{cueText}…</p>
                <button onClick={onRevealFullAnswer}>Reveal answer</button>
              </>
            ) : (
              <p className="answer">{promptItem.text}</p>
            )}

            <p>How close was your reconstruction?</p>
            <div className="actions">
              <button onClick={() => onRate('good')} disabled={showShadowCue && !fullAnswerVisible}>Good</button>
              <button onClick={() => onRate('close')} disabled={showShadowCue && !fullAnswerVisible}>Close</button>
              <button onClick={() => onRate('missed')} disabled={showShadowCue && !fullAnswerVisible}>Missed</button>
            </div>
          </>
        )}
      </Card>
    </main>
  );
}
