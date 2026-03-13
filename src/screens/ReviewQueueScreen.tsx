import Card from '../components/Card';
import type { ReviewQueueEntry } from '../types';

interface ReviewQueueScreenProps {
  reviewQueue: ReviewQueueEntry[];
  dueCount: number;
  onStartDueReview: () => void;
  onBack: () => void;
}

export default function ReviewQueueScreen({ reviewQueue, dueCount, onStartDueReview, onBack }: ReviewQueueScreenProps) {
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
          <button onClick={onStartDueReview} disabled={dueCount === 0}>Start due review</button>
          <button onClick={onBack}>Back</button>
        </div>
      </Card>
    </main>
  );
}
