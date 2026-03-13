import Card from '../components/Card';

interface HomeScreenProps {
  dueCount: number;
  recentAttempts: number;
  onStartNormalMode: () => void;
  onStartHardMode: () => void;
  onOpenReviewQueue: () => void;
  onStartReviewSession: () => void;
  onOpenSettings: () => void;
}

export default function HomeScreen({
  dueCount,
  recentAttempts,
  onStartNormalMode,
  onStartHardMode,
  onOpenReviewQueue,
  onStartReviewSession,
  onOpenSettings
}: HomeScreenProps) {
  return (
    <main className="container homeContainer">
      <Card>
        <header className="homeHeader">
          <h1>Echoir</h1>
          <p>Listen, reconstruct, repeat.</p>
        </header>

        <section className="mainActions" aria-label="Start modes">
          <button className="btnPrimary" onClick={onStartNormalMode}>Start Normal Mode</button>
          <button className="btnSecondary" onClick={onStartHardMode}>Start Hard Mode</button>
        </section>

        <section className={`reviewSection ${dueCount === 0 ? 'reviewSectionMuted' : ''}`} aria-label="Review actions">
          <p className="sectionLabel">Review</p>
          <p className="reviewDueText">Review due today: <strong>{dueCount}</strong></p>
          <div className="actions reviewActions">
            <button className="btnGhost" onClick={onOpenReviewQueue}>View Review Queue</button>
            <button className="btnGhost" onClick={onStartReviewSession} disabled={dueCount === 0}>Start Review Session</button>
          </div>
        </section>

        <section className="statsSection" aria-label="Recent stats">
          <p>Attempts in last 7 days: <strong>{recentAttempts}</strong></p>
        </section>

        <div className="footerActions">
          <button className="link" onClick={onOpenSettings}>Settings</button>
        </div>
      </Card>
    </main>
  );
}
