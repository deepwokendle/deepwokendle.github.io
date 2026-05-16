import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/sidebar/Sidebar';
import type { LeaderboardEntry, MonthlyEntry } from '../types';
import { apiFetchLeaderboard, apiFetchMonthlyLeaderboard } from '../services/api';
import styles from './LeaderboardPage.module.css';

type Tab = 'alltime' | 'monthly';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function placeClass(place: number, mod: Record<string, string>) {
  if (place === 1) return `${mod.place} ${mod.place1}`;
  if (place === 2) return `${mod.place} ${mod.place2}`;
  if (place === 3) return `${mod.place} ${mod.place3}`;
  return mod.place;
}

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('alltime');
  const [allTime, setAllTime] = useState<LeaderboardEntry[]>([]);
  const [monthly, setMonthly] = useState<MonthlyEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const goToGame = () => navigate('/');

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [r1, r2] = await Promise.all([apiFetchLeaderboard(), apiFetchMonthlyLeaderboard()]);
        if (r1.ok) setAllTime(await r1.json());
        if (r2.ok) setMonthly(await r2.json());
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const now = new Date();
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Header onHamburgerClick={() => setSidebarOpen(o => !o)} />
      <div style={{ display: 'flex', flex: '1 1 0', minHeight: 0, position: 'relative' }}>
        <Sidebar
          open={sidebarOpen}
          onNormalMode={goToGame}
          onInfiniteMode={goToGame}
          onSuggestNpc={goToGame}
          onLeaderboard={() => { setSidebarOpen(false); }}
          onMonsterIndex={() => { setSidebarOpen(false); navigate('/monsters'); }}
          onAdminMonsters={() => { setSidebarOpen(false); navigate('/admin/monsters'); }}
        />
        <main className={styles.page}>
          <h1 className={styles.title}>Leaderboard</h1>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab}${tab === 'alltime' ? ` ${styles.tabActive}` : ''}`}
              onClick={() => setTab('alltime')}
            >
              All Time
            </button>
            <button
              className={`${styles.tab}${tab === 'monthly' ? ` ${styles.tabActive}` : ''}`}
              onClick={() => setTab('monthly')}
            >
              Monthly
            </button>
          </div>

          {tab === 'monthly' && (
            <p className={styles.subtitle}>Correct daily guesses — {monthLabel}</p>
          )}
          {tab === 'alltime' && (
            <p className={styles.subtitle}>Ranked by highest streak ever.</p>
          )}

          {loading ? (
            <p className={styles.loading}>Loading…</p>
          ) : tab === 'alltime' ? (
            allTime.length === 0 ? (
              <p className={styles.empty}>No entries yet.</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player</th>
                      <th style={{ textAlign: 'right' }}>Max Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTime.map(e => (
                      <tr key={e.username}>
                        <td className={placeClass(e.place, styles as unknown as Record<string, string>)}>
                          {e.place}
                        </td>
                        <td>{e.username}</td>
                        <td className={styles.score}>{e.maxStreak}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            monthly.length === 0 ? (
              <p className={styles.empty}>No entries for this month yet.</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player</th>
                      <th style={{ textAlign: 'right' }}>Correct Guesses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthly.map(e => (
                      <tr key={e.username}>
                        <td className={placeClass(e.place, styles as unknown as Record<string, string>)}>
                          {e.place}
                        </td>
                        <td>{e.username}</td>
                        <td className={styles.score}>{e.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}
