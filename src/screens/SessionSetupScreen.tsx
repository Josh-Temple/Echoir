import Card from '../components/Card';
import type { SessionSettings } from '../types';

interface SessionSetupScreenProps {
  settings: SessionSettings;
  allUnits: string[];
  allLevels: string[];
  onUpdateSettings: (settings: SessionSettings) => void;
  onToggleChoice: (type: 'units' | 'levels', value: string) => void;
  onStartSession: () => void;
  onBack: () => void;
}

export default function SessionSetupScreen({
  settings,
  allUnits,
  allLevels,
  onUpdateSettings,
  onToggleChoice,
  onStartSession,
  onBack
}: SessionSetupScreenProps) {
  return (
    <main className="container">
      <Card>
        <h2>Session Setup</h2>
        <label>
          Mode
          <select
            value={settings.mode}
            onChange={(e) => onUpdateSettings({ ...settings, mode: e.target.value as SessionSettings['mode'] })}
          >
            <option value="normal">Normal Mode</option>
            <option value="hard">Advanced Mode</option>
          </select>
        </label>
        <label>
          Study mode
          <select
            value={settings.studyMode}
            onChange={(e) => onUpdateSettings({ ...settings, studyMode: e.target.value as SessionSettings['studyMode'] })}
          >
            <option value="text">Text Only</option>
            <option value="audio">Audio + Text</option>
          </select>
        </label>

        {settings.studyMode === 'text' && (
          <>
            <label>
              Text presentation
              <select
                value={settings.textPresentation}
                onChange={(e) => onUpdateSettings({ ...settings, textPresentation: e.target.value as SessionSettings['textPresentation'] })}
              >
                <option value="standard">Standard Recall</option>
                <option value="timed">Timed Recall</option>
                <option value="retry">Retry Recall</option>
              </select>
            </label>

            {settings.textPresentation === 'timed' && (
              <label>
                Timed glimpse
                <select
                  value={settings.timedRevealPreset}
                  onChange={(e) => onUpdateSettings({ ...settings, timedRevealPreset: e.target.value as SessionSettings['timedRevealPreset'] })}
                >
                  <option value="short">Short (2s)</option>
                  <option value="medium">Medium (4s)</option>
                  <option value="long">Long (6s)</option>
                </select>
              </label>
            )}

            <label className="toggleRow">
              <input
                type="checkbox"
                checked={settings.shadowReveal}
                onChange={(e) => onUpdateSettings({ ...settings, shadowReveal: e.target.checked })}
              />
              Use shadow reveal cue before full answer
            </label>
          </>
        )}

        <label>
          Session length
          <input
            type="number"
            min={3}
            max={30}
            value={settings.sessionSize}
            onChange={(e) => onUpdateSettings({ ...settings, sessionSize: Number(e.target.value) })}
          />
        </label>
        <label>
          Replay count
          <select
            value={settings.replayCount}
            onChange={(e) => onUpdateSettings({ ...settings, replayCount: Number(e.target.value) as 1 | 2 })}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </label>

        <p>Units</p>
        <div className="chips">
          {allUnits.map((unit) => (
            <button
              key={unit}
              className={settings.units.includes(unit) ? 'chip active' : 'chip'}
              onClick={() => onToggleChoice('units', unit)}
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
              onClick={() => onToggleChoice('levels', level)}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="actions">
          <button onClick={onStartSession}>Start session</button>
          <button onClick={onBack}>Back</button>
        </div>
      </Card>
    </main>
  );
}
