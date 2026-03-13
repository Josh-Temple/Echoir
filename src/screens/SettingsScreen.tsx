import Card from '../components/Card';

interface SettingsScreenProps {
  studyMode: 'text' | 'audio';
  onResetDefaults: () => void;
  onClearLearningData: () => void;
  onBack: () => void;
}

export default function SettingsScreen({ studyMode, onResetDefaults, onClearLearningData, onBack }: SettingsScreenProps) {
  return (
    <main className="container">
      <Card>
        <h2>Settings</h2>
        <p>All data is stored locally in your browser.</p>
        <p>Current study mode default: <strong>{studyMode === 'text' ? 'Text Only' : 'Audio + Text'}</strong></p>
        <div className="actions">
          <button onClick={onResetDefaults}>Reset session defaults</button>
          <button onClick={onClearLearningData}>Clear learning data</button>
          <button onClick={onBack}>Back</button>
        </div>
      </Card>
    </main>
  );
}
