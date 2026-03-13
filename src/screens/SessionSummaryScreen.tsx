import Card from '../components/Card';
import type { SessionState } from '../lib/session';

interface SessionSummaryScreenProps {
  session: SessionState;
  onBackHome: () => void;
}

export default function SessionSummaryScreen({ session, onBackHome }: SessionSummaryScreenProps) {
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
        <button onClick={onBackHome}>Return home</button>
      </Card>
    </main>
  );
}
