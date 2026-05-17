import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOverlaySync } from '../hooks/useOverlaySync';
import Tooltip from '../components/common/Tooltip';
import SuggestionFormModal from '../components/suggestions/SuggestionFormModal';
import { confirm } from '../components/common/ConfirmDialog';
import {
  apiFetchMonsterSuggestions,
  apiFetchMyMonsterSuggestions,
  apiVoteMonsterSuggestion,
  apiReportMonsterSuggestion,
  apiGetMySuggestionEnriched,
  apiDeleteMySuggestion,
  apiFetchSuggestionById,
} from '../services/api';
import { showToast } from '../utils/toast';
import type { MonsterEnriched, MonsterSuggestion } from '../types';
import styles from './SuggestionsPage.module.css';

type Sort = 'likes' | 'dislikes' | 'recent';
const PAGE_SIZE = 10;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'Now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

function voterTooltip(voters: string[], count: number, action: 'liked' | 'disliked'): string {
  if (count === 0) return action === 'liked' ? 'No likes yet' : 'No dislikes yet';
  const shown = voters.slice(0, 3);
  const rest = count - shown.length;
  const base = shown.join(', ');
  if (rest <= 0) return `${base} ${shown.length === 1 ? 'has' : 'have'} ${action} this`;
  return `${base} and ${rest} other${rest > 1 ? 's' : ''} have ${action} this`;
}

const SHARE_BASE = (id: number) =>
  `I just made an NPC suggestion for Deepwokendle. Come upvote it! https://www.deepwokendle.com/suggestions?suggestionId=${id}`;

const SHARE_TWITTER = (id: number) => `${SHARE_BASE(id)} #deepwoken #deepwokendle`;

export default function SuggestionsPage() {
  const { isLoggedIn, waitForLogin, openLoginModal, username } = useAuth();
  useOverlaySync();

  const [searchParams, setSearchParams] = useSearchParams();
  const pinnedId = searchParams.get('suggestionId') ? Number(searchParams.get('suggestionId')) : null;

  const [suggestions, setSuggestions] = useState<MonsterSuggestion[]>([]);
  const [pinnedSuggestion, setPinnedSuggestion] = useState<MonsterSuggestion | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<Sort>('likes');
  const [showMine, setShowMine] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [shareTarget, setShareTarget] = useState<MonsterSuggestion | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // undefined = closed, null = create mode, MonsterEnriched = edit mode
  const [formTarget, setFormTarget] = useState<MonsterEnriched | null | undefined>(undefined);
  const [formLoading, setFormLoading] = useState(false);

  const pinnedCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Fetch pinned suggestion from URL param
  useEffect(() => {
    if (!pinnedId || showMine) { setPinnedSuggestion(null); return; }
    apiFetchSuggestionById(pinnedId)
      .then(r => r.ok ? r.json() : null)
      .then((data: MonsterSuggestion | null) => setPinnedSuggestion(data))
      .catch(() => setPinnedSuggestion(null));
  }, [pinnedId, showMine]);

  // Auto-scroll to pinned card after it renders
  useEffect(() => {
    if (pinnedSuggestion && pinnedCardRef.current) {
      pinnedCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [pinnedSuggestion]);

  const fetchCommunity = useCallback(async (p: number, s: Sort, q: string) => {
    setLoading(true);
    try {
      const res = await apiFetchMonsterSuggestions(p, PAGE_SIZE, s, q);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.items ?? []);
        setTotal(data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMine = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetchMyMonsterSuggestions();
      if (res.ok) {
        const items: MonsterSuggestion[] = await res.json();
        setSuggestions(items ?? []);
        setTotal(items?.length ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showMine) fetchMine();
    else fetchCommunity(page, sort, debouncedSearch);
  }, [page, sort, showMine, debouncedSearch]);

  useEffect(() => {
    if (!showMine) setPage(1);
  }, [debouncedSearch]);

  const handleSort = (s: Sort) => {
    if (showMine || s === sort) return;
    setSort(s);
    setPage(1);
  };

  const requireLogin = async (): Promise<boolean> => {
    if (isLoggedIn) return true;
    try { openLoginModal(true); await waitForLogin(); return true; }
    catch { return false; }
  };

  const handleShowMine = async () => {
    if (!isLoggedIn) {
      try { openLoginModal(true); await waitForLogin(); }
      catch { return; }
    }
    setShowMine(true);
    setPage(1);
  };

  const handleVote = async (suggestion: MonsterSuggestion, vote: 1 | -1) => {
    if (!(await requireLogin())) {
      showToast.error('You must be logged in to vote!');
      return;
    }
    const newVote = suggestion.userVote === vote ? 0 : vote;
    const user = username ?? '';

    const applyVote = (s: MonsterSuggestion): MonsterSuggestion => s.id !== suggestion.id ? s : {
      ...s,
      likeCount:    s.likeCount    + (newVote === 1  ? 1 : 0) - (s.userVote === 1  ? 1 : 0),
      dislikeCount: s.dislikeCount + (newVote === -1 ? 1 : 0) - (s.userVote === -1 ? 1 : 0),
      userVote: newVote === 0 ? null : newVote,
      lastLikers:    newVote === 1     ? [...new Set([...s.lastLikers, user])].slice(0, 3)
                   : s.userVote === 1  ? s.lastLikers.filter(u => u !== user)
                                      : s.lastLikers,
      lastDislikers: newVote === -1    ? [...new Set([...s.lastDislikers, user])].slice(0, 3)
                   : s.userVote === -1 ? s.lastDislikers.filter(u => u !== user)
                                      : s.lastDislikers,
    };

    setSuggestions(prev => prev.map(applyVote));
    if (pinnedSuggestion?.id === suggestion.id) setPinnedSuggestion(prev => prev ? applyVote(prev) : prev);

    const res = await apiVoteMonsterSuggestion(suggestion.id, newVote);
    if (!res.ok) {
      showToast.error('Failed to vote.');
      if (showMine) fetchMine(); else fetchCommunity(page, sort, debouncedSearch);
    }
  };

  const handleReport = async (id: number) => {
    if (!(await requireLogin())) return;
    const ok = await confirm({ title: 'Report suggestion?', confirmText: 'Report', cancelText: 'Cancel', danger: true });
    if (!ok) return;
    const res = await apiReportMonsterSuggestion(id);
    if (res.ok) {
      showToast.success('Suggestion reported. It will be hidden after 5 reports from different users.');
    } else {
      showToast.error('Failed to report.');
    }
  };

  const handleOpenCreate = async () => {
    if (!(await requireLogin())) return;
    setFormTarget(null);
  };

  const handleOpenEdit = async (suggestion: MonsterSuggestion) => {
    setFormLoading(true);
    try {
      const res = await apiGetMySuggestionEnriched(suggestion.id);
      if (res.ok) {
        setFormTarget(await res.json());
      } else {
        showToast.error('Failed to load suggestion details.');
      }
    } catch {
      showToast.error('Failed to load suggestion details.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({ title: 'Delete suggestion?', message: 'This action cannot be undone.', confirmText: 'Delete', cancelText: 'Cancel', danger: true });
    if (!ok) return;
    const res = await apiDeleteMySuggestion(id);
    if (res.ok) {
      showToast.success('Suggestion deleted.');
      setSuggestions(prev => prev.filter(s => s.id !== id));
      setTotal(prev => prev - 1);
    } else {
      showToast.error('Failed to delete.');
    }
  };

  const handleFormSaved = () => {
    setFormTarget(undefined);
    if (showMine) fetchMine(); else fetchCommunity(page, sort, debouncedSearch);
  };

  const handleShare = (s: MonsterSuggestion) => setShareTarget(s);

  const handleCopy = async () => {
    if (!shareTarget) return;
    try {
      await navigator.clipboard.writeText(SHARE_BASE(shareTarget.id));
      showToast.success('Copied to clipboard!');
    } catch {
      showToast.error('Failed to copy.');
    }
  };

  const handleTwitter = () => {
    if (!shareTarget) return;
    const text = encodeURIComponent(SHARE_TWITTER(shareTarget.id));
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const displayedSuggestions = showMine && search.trim()
    ? suggestions.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.userAtCreation.toLowerCase().includes(search.toLowerCase()))
    : suggestions;

  // Deduplicate: remove the pinned item from the regular list so it doesn't appear twice
  const regularSuggestions = pinnedSuggestion && !showMine
    ? displayedSuggestions.filter(s => s.id !== pinnedSuggestion.id)
    : displayedSuggestions;

  const renderCard = (s: MonsterSuggestion, isPinned = false) => (
    <div
      key={s.id}
      ref={isPinned ? pinnedCardRef : undefined}
      className={`${styles.card} border`}
    >
      <div className={`${styles.cardImage} border`}>
        {s.picture
          ? <img src={s.picture} alt={s.name} />
          : <span className={styles.noImage}>No image</span>
        }
        {s.picture && (
          <button
            className={styles.eyeBtn}
            onClick={() => setLightboxUrl(s.picture)}
            aria-label="View full image"
          >
            <i className="fas fa-eye" />
          </button>
        )}
        {showMine && s.pending && (
          <div className={styles.cardOwnerActions}>
            <Tooltip content="Edit" placement="top">
              <button
                className={styles.cardOwnerBtn}
                onClick={() => handleOpenEdit(s)}
                disabled={formLoading}
              >
                <i className="fas fa-pen" />
              </button>
            </Tooltip>
            <Tooltip content="Delete" placement="top">
              <button
                className={`${styles.cardOwnerBtn} ${styles.cardOwnerBtnDelete}`}
                onClick={() => handleDelete(s.id)}
              >
                <i className="fas fa-trash" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardNameRow}>
          <h3 className={styles.cardName}>{s.name}</h3>
          {isPinned && <span className={styles.pinnedBadge}>Shared</span>}
          {showMine && !s.pending && (
            <span className={styles.publishedBadge}>Published</span>
          )}
          {s.updatedAt && (
            <Tooltip content={`Edited ${timeAgo(s.updatedAt)}`}>
              <span className={styles.editedBadge}>(edited)</span>
            </Tooltip>
          )}
          {s.createdAt && (
            <span className={styles.timeAgo}>{timeAgo(s.createdAt)}</span>
          )}
        </div>
        <div className={styles.cardMeta}>
          <strong>{s.element}</strong> · <strong>{s.category}</strong>
          {' '}· {s.humanoid ? 'Humanoid' : 'Non-humanoid'}
        </div>
        <div className={styles.cardMeta}>
          Submitted by <strong>{s.userAtCreation}</strong>
        </div>

        <div className={styles.cardTags}>
          {s.locations.map(loc => (
            <Tooltip key={loc} content="Location">
              <span className={styles.tag}>{loc}</span>
            </Tooltip>
          ))}
          {s.loots.map(l => (
            <Tooltip key={l} content="Loot">
              <span className={styles.tag}>{l}</span>
            </Tooltip>
          ))}
        </div>

        <div className={styles.cardFooter}>
          <Tooltip content={voterTooltip(s.lastLikers, s.likeCount, 'liked')}>
            <button
              className={`${styles.voteBtn}${s.userVote === 1 ? ` ${styles.likeActive}` : ''}`}
              onClick={() => handleVote(s, 1)}
            >
              <i className="fas fa-thumbs-up" /> {s.likeCount}
            </button>
          </Tooltip>
          <Tooltip content={voterTooltip(s.lastDislikers, s.dislikeCount, 'disliked')}>
            <button
              className={`${styles.voteBtn}${s.userVote === -1 ? ` ${styles.dislikeActive}` : ''}`}
              onClick={() => handleVote(s, -1)}
            >
              <i className="fas fa-thumbs-down" /> {s.dislikeCount}
            </button>
          </Tooltip>
          <div className={styles.shareReportRow}>
            <button className={styles.shareBtn} onClick={() => handleShare(s)}>
              <i className="fas fa-share-nodes" /> Share
            </button>
            <button className={styles.reportBtn} onClick={() => handleReport(s.id)}>
              <i className="fas fa-flag" /> Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <main className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Monster Suggestions</h1>
            <p className={styles.subtitle}>Community-submitted monsters waiting for a review. Vote for your favourites!</p>
          </div>
        </div>

        <div className={styles.searchWrap}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by name or creator…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch('')} aria-label="Clear search">✕</button>
          )}
        </div>

        <div className={styles.controls}>
          <span className={styles.sortLabel}>Sort:</span>
          {(['likes', 'dislikes', 'recent'] as Sort[]).map(s => (
            <button
              key={s}
              className={`${styles.sortBtn}${!showMine && sort === s ? ` ${styles.sortBtnActive}` : ''}`}
              onClick={() => { setShowMine(false); handleSort(s); }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <button
            className={`${styles.mineSortBtn}${showMine ? ` ${styles.mineSortBtnActive}` : ''}`}
            onClick={showMine ? () => { setShowMine(false); setPage(1); } : handleShowMine}
          >
            My Suggestions
          </button>
        </div>

        {loading ? (
          <div className={styles.list}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${styles.skeletonCard} skeleton-pulse border`} />
            ))}
          </div>
        ) : (
          <div className={styles.list}>
            {pinnedSuggestion && !showMine && renderCard(pinnedSuggestion, true)}
            {regularSuggestions.length === 0 && !pinnedSuggestion ? (
              <p className={styles.empty}>
                {showMine ? "You haven't submitted any monsters yet." : 'No suggestions found.'}
              </p>
            ) : (
              regularSuggestions.map(s => renderCard(s))
            )}
          </div>
        )}

        {!loading && !showMine && totalPages > 1 && (
          <div className={styles.pagination}>
            <button className="btn border" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
            <span className={styles.paginationInfo}>{page} / {totalPages}</span>
            <button className="btn border" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>→</button>
          </div>
        )}
      </main>

      <Tooltip content="Suggest an NPC!" placement="left">
        <button className={styles.fab} onClick={handleOpenCreate} aria-label="Suggest an NPC!">
          +
        </button>
      </Tooltip>

      {formTarget !== undefined && (
        <SuggestionFormModal
          monster={formTarget}
          onClose={() => setFormTarget(undefined)}
          onSaved={handleFormSaved}
        />
      )}

      {shareTarget && (
        <div className={styles.shareOverlay} onClick={() => setShareTarget(null)}>
          <div className={`${styles.shareModal} border`} onClick={e => e.stopPropagation()}>
            <p className={styles.shareTitle}>Share "{shareTarget.name}"</p>
            <p className={styles.shareText}>{SHARE_BASE(shareTarget.id)}</p>
            <div className={styles.shareActions}>
              <button className={styles.shareIconBtn} onClick={handleCopy}>
                <i className="far fa-copy" /> Copy
              </button>
              <button className={styles.shareIconBtn} onClick={handleTwitter}>
                <i className="fab fa-x-twitter" /> Post
              </button>
            </div>
            <button className={styles.shareClose} onClick={() => setShareTarget(null)}>Close</button>
          </div>
        </div>
      )}

      {lightboxUrl && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxUrl(null)}>
          <img className={styles.lightboxImg} src={lightboxUrl} alt="Full preview" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
