import { useState, useEffect } from 'react';
import { useOverlaySync } from '../hooks/useOverlaySync';
import type { LeaderboardEntry, MonthlyEntry } from '../types';
import { apiFetchLeaderboard, apiFetchMonthlyLeaderboard, apiFetchDailyLeaderboard } from '../services/api';
import styles from './LeaderboardPage.module.css';

type Tab = 'alltime' | 'monthly' | 'daily';

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

function fmt(ms: number): string {
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  const hms = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return d > 0 ? `${d}d ${hms}` : hms;
}

function useLeaderboardCountdowns() {
  const [daily, setDaily] = useState('');
  const [monthly, setMonthly] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const ms = now.getTime();
      setDaily(fmt(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1) - ms));
      setMonthly(fmt(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1) - ms));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return { daily, monthly };
}

export default function LeaderboardPage() {
  useOverlaySync();

  const [tab, setTab] = useState<Tab>('alltime');
  const [allTime, setAllTime] = useState<LeaderboardEntry[]>([]);
  const [monthly, setMonthly] = useState<MonthlyEntry[]>([]);
  const [daily, setDaily] = useState<MonthlyEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const countdowns = useLeaderboardCountdowns();

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [r1, r2, r3] = await Promise.all([
          apiFetchLeaderboard(),
          apiFetchMonthlyLeaderboard(),
          apiFetchDailyLeaderboard(),
        ]);
        if (r1.ok) setAllTime(await r1.json());
        if (r2.ok) setMonthly(await r2.json());
        if (r3.ok) setDaily(await r3.json());
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const now = new Date();
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  return (
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
        <button
          className={`${styles.tab}${tab === 'daily' ? ` ${styles.tabActive}` : ''}`}
          onClick={() => setTab('daily')}
        >
          Daily
        </button>
      </div>

      {tab === 'alltime' && <p className={styles.subtitle}>Ranked by highest streak ever.</p>}
      {tab === 'monthly' && (
        <p className={styles.subtitle}>
          Infinite mode correct guesses - {monthLabel} - resets in{' '}
          <span className={styles.countdown}>{countdowns.monthly}</span>
        </p>
      )}
      {tab === 'daily' && (
        <p className={styles.subtitle}>
          Infinite mode correct guesses today - resets in{' '}
          <span className={styles.countdown}>{countdowns.daily}</span>
        </p>
      )}

      {loading ? (
        <p className={styles.loading}>Loading…</p>
      ) : tab === 'daily' ? (
        daily.length === 0 ? (
          <p className={styles.empty}>No entries for today yet.</p>
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
                {daily.map(e => (
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
  );
}
