import { useEffect } from 'react';
import { Grid } from 'gridjs-react';
import 'gridjs/dist/theme/mermaid.min.css';
import type { LeaderboardEntry } from '../../types';
import { apiFetchLeaderboard } from '../../services/api';
import { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LeaderboardModal({ open, onClose }: Props) {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetchLeaderboard();
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const json: LeaderboardEntry[] = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  if (!open) return null;

  const gridData = data.map(e => [e.place, e.username, e.maxStreak]);

  return (
    <div className="modal-overlay show" id="leaderboardModal">
      <div className="modal border leaderboard">
        <p className="title">Leaderboard</p>
        <div className="modal-content">
          {loading ? (
            <p style={{ color: 'white', textAlign: 'center' }}>Loading...</p>
          ) : (
            <div id="leaderboardGrid">
              <Grid
                columns={[
                  { id: 'place', name: 'Position' },
                  { id: 'user', name: 'User' },
                  { id: 'maxStreak', name: 'Max Streak' },
                ]}
                data={gridData}
                sort
                search
                pagination={{ limit: 15 }}
                style={{
                  table: { 'border-collapse': 'collapse' },
                  td: { 'text-align': 'center', background: 'var(--button-background)', color: 'white' },
                  th: { 'background-color': 'white', color: 'var(--text-color)' },
                }}
              />
            </div>
          )}
        </div>
        <div className="modal-buttons">
          <button className="border" onClick={load}>Reload</button>
          <button className="border" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
