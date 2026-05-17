import { useState, useEffect, useMemo } from 'react';
import GuessRow from '../components/game/GuessRow';
import { useOverlaySync } from '../hooks/useOverlaySync';
import { useMonsters } from '../hooks/useMonsters';
import { useAuth } from '../context/AuthContext';
import { apiFetchGuessedMonsters, apiFetchMonsterStats } from '../services/api';
import { showToast } from '../utils/toast';
import type { Monster, GuessRecord } from '../types';
import { nameOf } from '../utils/nameOf';

interface MonsterStats {
  correctCount: number;
  incorrectCount: number;
}

const PAGE_SIZE = 10;

function buildPreviewRecord(m: Monster): GuessRecord {
  return {
    monster: m,
    fields: [
      { field: 'name', display: m.name, result: 'correct' },
      { field: 'gives', display: m.gives.length > 0 ? m.gives.join(', ') : '-', result: 'correct' },
      { field: 'element', display: nameOf(m.element), result: 'correct' },
      { field: 'category', display: nameOf(m.category), result: 'correct' },
      { field: 'locations', display: m.locations.length > 0 ? m.locations.join(', ') : '-', result: 'correct' },
      { field: 'humanoid', display: m.humanoid ? '✓' : 'X', result: 'correct' },
    ],
    attemptNumber: 0,
  };
}

export default function MonsterIndexPage() {
  const { monsters, loadMonsters, isLoadingMonsters } = useMonsters();
  const { isLoggedIn } = useAuth();

  useOverlaySync();

  const [guessedIds, setGuessedIds] = useState<Set<number>>(new Set());
  const [searchName, setSearchName] = useState('');
  const [filterElement, setFilterElement] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);
  const [previewMonster, setPreviewMonster] = useState<Monster | null>(null);
  const [previewStats, setPreviewStats] = useState<MonsterStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => { loadMonsters(); }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const answerKey = `deepwokendle_${today}_answer`;
    const todayAnswer = localStorage.getItem(answerKey);
    const localIds: Set<number> = todayAnswer
      ? new Set([parseInt(todayAnswer, 10)])
      : new Set();

    if (isLoggedIn) {
      apiFetchGuessedMonsters()
        .then(async res => {
          if (res.ok) {
            const ids: number[] = await res.json();
            setGuessedIds(new Set([...ids, ...localIds]));
          } else {
            setGuessedIds(localIds);
          }
        })
        .catch(() => setGuessedIds(localIds));
    } else {
      setGuessedIds(localIds);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!previewMonster || !isLoggedIn) {
      setPreviewStats(null);
      return;
    }
    setStatsLoading(true);
    apiFetchMonsterStats(previewMonster.id)
      .then(async res => { if (res.ok) setPreviewStats(await res.json()); })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [previewMonster, isLoggedIn]);

  const elements = useMemo(
    () => [...new Set((monsters ?? []).map(m => nameOf(m.element)))].sort(),
    [monsters],
  );
  const categories = useMemo(
    () => [...new Set((monsters ?? []).map(m => nameOf(m.category)))].sort(),
    [monsters],
  );

  const filtered = useMemo(() => {
    if (!monsters) return [];
    return monsters.filter(m => {
      if (searchName && !m.name.toLowerCase().includes(searchName.toLowerCase())) return false;
      if (filterElement && nameOf(m.element) !== filterElement) return false;
      if (filterCategory && nameOf(m.category) !== filterCategory) return false;
      return true;
    });
  }, [monsters, searchName, filterElement, filterCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageMonsters = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const handleCardClick = (monster: Monster) => {
    if (!guessedIds.has(monster.id)) {
      showToast.info(isLoggedIn ? 'Guess this character in Normal or Infinite mode to unlock it here!' : 'Login and guess this character in Normal/Infinite mode to unlock it here!');
      return;
    }
    setPreviewMonster(monster);
  };

  return (
    <>
      <main id="monster-index">
        <div className="monster-filters">
          <input
            type="text"
            className='border'
            placeholder="Search by name..."
            value={searchName}
            onChange={e => { setSearchName(e.target.value); resetPage(); }}
          />
          <select className='border' value={filterElement} onChange={e => { setFilterElement(e.target.value); resetPage(); }}>
            <option value="">All Elements</option>
            {elements.map(el => <option key={el} value={el}>{el}</option>)}
          </select>
          <select className='border' value={filterCategory} onChange={e => { setFilterCategory(e.target.value); resetPage(); }}>
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {isLoadingMonsters ? (
          <div className="monster-grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="monster-card skeleton-pulse skeleton-monster-card border" />
            ))}
          </div>
        ) : (
          <>
            {filtered.length === 0 && (
              <p className="monster-index-empty">No monsters found.</p>
            )}
            <div className="monster-grid">
              {pageMonsters.map(monster => {
                const unlocked = guessedIds.has(monster.id);
                return (
                  <div
                    key={monster.id}
                    className={`monster-card border${unlocked ? ' unlocked' : ' locked'}`}
                    onClick={() => handleCardClick(monster)}
                    role="button"
                    tabIndex={0}
                    aria-label={unlocked ? `View ${monster.name}` : `${monster.name} – locked`}
                  >
                    {unlocked
                      ? <img src={monster.picture} alt={monster.name} className="monster-card-img" />
                      : <div className="monster-card-locked"><span className="question-mark">?</span></div>
                    }
                    <div className="monster-card-bottom">
                      <span className="monster-card-name">{monster.name}</span>
                      {unlocked && monster.userAtCreation && (
                        <span className="monster-card-creator">by {monster.userAtCreation}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="monster-pagination">
              <button
                className="btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >←</button>
              <span className="monster-pagination-info">{page} / {totalPages}</span>
              <button
                className="btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >→</button>
            </div>
          </>
        )}
      </main>

      {previewMonster && (
        <div className="modal-overlay show" onClick={() => setPreviewMonster(null)}>
          <div className="monster-preview-modal border" onClick={e => e.stopPropagation()}>
            <button className="monster-preview-close" onClick={() => setPreviewMonster(null)}>✕</button>
            <h3 className="monster-preview-title">{previewMonster.name}</h3>
            {previewMonster.userAtCreation && (
              <p className="monster-preview-creator">Created by: {previewMonster.userAtCreation}</p>
            )}
            <div
              className="rowsContainer"
              style={{ maxHeight: 'none', marginBottom: 0, overflowY: 'visible', overflowX: 'auto' }}
            >
              <div className="headerContainer">
                <div className="columns">
                  {['Picture', 'Name', 'Gives', 'Element', 'Category', 'Locations', 'Humanoid'].map(col => (
                    <div key={col} className="column">
                      <div className="column-title">{col}</div>
                    </div>
                  ))}
                </div>
              </div>
              <GuessRow record={buildPreviewRecord(previewMonster)} instant />
            </div>
            {isLoggedIn && (
              <div className="monster-preview-stats">
                {statsLoading ? (
                  <span className="monster-preview-stat-loading">Loading stats…</span>
                ) : previewStats ? (
                  <>
                    <span className="monster-preview-stat monster-preview-stat--correct">
                      Guessed Correctly: {previewStats.correctCount}
                    </span>
                    <span className="monster-preview-stat monster-preview-stat--incorrect">
                      Guessed Incorrectly: {previewStats.incorrectCount}
                    </span>
                  </>
                ) : null}
              </div>
            )}
            <div className="modal-buttons" style={{ justifyContent: 'center' }}>
              <button className="btn border" onClick={() => setPreviewMonster(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
