import { useState, useEffect, useMemo } from 'react';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import MonsterFormModal from '../../components/admin/MonsterFormModal';
import { useOverlaySync } from '../../hooks/useOverlaySync';
import { confirm } from '../../components/common/ConfirmDialog';
import { showToast } from '../../utils/toast';
import {
  apiAdminListMonsters,
  apiAdminGetEnrichedMonster,
  apiAdminBulkDelete,
  apiAdminPublishMonster,
} from '../../services/api';
import type { MonsterAdmin, MonsterEnriched } from '../../types';
import { nameOf } from '../../utils/nameOf';
import styles from './AdminMonstersPage.module.css';
import Tooltip from '../../components/common/Tooltip';

const PAGE_SIZE = 12;

export default function AdminMonstersPage() {
  useOverlaySync();

  const [monsters, setMonsters] = useState<MonsterAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [searchName, setSearchName] = useState('');
  const [filterPending, setFilterPending] = useState<'' | 'true' | 'false'>('');
  const [page, setPage] = useState(1);

  const [formTarget, setFormTarget] = useState<MonsterEnriched | null | undefined>(undefined);
  // undefined = modal closed, null = create mode, MonsterEnriched = edit mode

  const fetchMonsters = async () => {
    setLoading(true);
    try {
      const res = await apiAdminListMonsters();
      if (res.ok) setMonsters(await res.json());
      else showToast.error('Failed to load monsters.');
    } catch {
      showToast.error('Failed to load monsters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMonsters(); }, []);

  const filtered = useMemo(() => monsters.filter(m => {
    if (searchName && !m.name.toLowerCase().includes(searchName.toLowerCase())) return false;
    if (filterPending === 'true' && !m.pending) return false;
    if (filterPending === 'false' && m.pending) return false;
    return true;
  }), [monsters, searchName, filterPending]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageMonsters = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const toggleSelect = (id: number) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSelectAll = () => {
    const pageIds = pageMonsters.map(m => m.id);
    const allSelected = pageIds.every(id => selected.has(id));
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) pageIds.forEach(id => next.delete(id));
      else pageIds.forEach(id => next.add(id));
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    const ok = await confirm({
      title: `Delete ${selected.size} monster${selected.size > 1 ? 's' : ''}?`,
      message: 'This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
    if (!ok) return;
    try {
      const res = await apiAdminBulkDelete([...selected]);
      if (res.ok) {
        showToast.success(`${selected.size} monster${selected.size > 1 ? 's' : ''} deleted.`);
        setSelected(new Set());
        fetchMonsters();
      } else {
        showToast.error('Delete failed.');
      }
    } catch {
      showToast.error('Delete failed.');
    }
  };

  const openCreate = () => setFormTarget(null);

  const openEdit = async (id: number) => {
    setLoading(true);
    try {
      const res = await apiAdminGetEnrichedMonster(id);
      if (res.ok) setFormTarget(await res.json());
      else showToast.error('Failed to load monster details.');
    } catch {
      showToast.error('Failed to load monster details.');
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => setFormTarget(undefined);

  const handlePublish = async (id: number) => {
    const ok = await confirm({
      title: 'Publish character?',
      confirmText: 'Publish',
      cancelText: 'Cancel',
    });
    if (!ok) return;
    try {
      const res = await apiAdminPublishMonster(id);
      if (res.ok) {
        showToast.success('Character published.');
        fetchMonsters();
      } else {
        showToast.error('Publish failed.');
      }
    } catch {
      showToast.error('Publish failed.');
    }
  };

  const onSaved = () => {
    closeForm();
    fetchMonsters();
  };

  const pageIds = pageMonsters.map(m => m.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selected.has(id));

  return (
    <>
      <LoadingOverlay visible={loading} />

      <main className={styles.page}>
        <div className={styles.toolbar}>
          <h2 className={styles.title}>Admin — Monsters</h2>
          <div className={styles.toolbarActions}>
            {selected.size > 0 && (
              <button className={`btn ${styles.btnDanger} border`} onClick={handleBulkDelete}>
                Delete selected ({selected.size})
              </button>
            )}
          </div>
        </div>

        <div className={styles.filters}>
          <input
            className="border"
            placeholder="Search by name…"
            value={searchName}
            onChange={e => { setSearchName(e.target.value); resetPage(); }}
          />
          <select
            className="border"
            value={filterPending}
            onChange={e => { setFilterPending(e.target.value as '' | 'true' | 'false'); resetPage(); }}
          >
            <option value="">All Status</option>
            <option value="false">Published</option>
            <option value="true">Pending</option>
          </select>
          <label className={styles.selectAllLabel}>
            <input
              type="checkbox"
              checked={allPageSelected}
              onChange={toggleSelectAll}
            />
            Select page
          </label>
        </div>

        {!loading && filtered.length === 0 && (
          <p className={styles.empty}>No monsters found.</p>
        )}

        <div className={styles.grid}>
          {pageMonsters.map(m => (
            <div
              key={m.id}
              className={`${styles.card} border${selected.has(m.id) ? ` ${styles.cardSelected}` : ''}`}
            >
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={`border ${styles.customCheckbox}`}
                  checked={selected.has(m.id)}
                  onChange={() => toggleSelect(m.id)}
                />
              </label>

              {m.pending && <span className={styles.pendingBadge}>Pending</span>}

              <div className={styles.cardImage}>
                {m.picture
                  ? <img src={m.picture} alt={m.name} />
                  : <span className={styles.noImage}>No image</span>
                }
                <div className={styles.cardActions}>
                  <Tooltip content="Edit" placement="bottom">
                    <button
                      className={`btn border ${styles.iconBtn}`}
                      onClick={() => openEdit(m.id)}
                    >
                      <i className="fas fa-pen" />
                    </button>
                  </Tooltip>
                  {m.pending && (
                    <Tooltip content="Publish" placement="bottom">
                      <button
                        className={`btn border ${styles.iconBtn} ${styles.publishBtn}`}
                        onClick={() => handlePublish(m.id)}
                      >
                        <i className="fas fa-check" />
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>

              <div className={styles.cardBody}>
                <span className={styles.cardName}>{m.name}</span>
                <span className={styles.cardMeta}>{nameOf(m.element)} · {nameOf(m.category)}</span>
                <span className={styles.cardMeta}>{m.humanoid ? 'Humanoid' : 'Non-humanoid'}</span>
                {m.userAtCreation && (
                  <span className={styles.cardMeta}>Created by: <strong>{m.userAtCreation}</strong></span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.pagination}>
          <button className="btn border" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
          <span>{page} / {totalPages}</span>
          <button className="btn border" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>→</button>
        </div>
      </main>

      <Tooltip content="New Monster" placement="left">
        <button className={`btn border ${styles.fab}`} onClick={openCreate}>
          +
        </button>
      </Tooltip>

      {formTarget !== undefined && (
        <MonsterFormModal
          monster={formTarget}
          onClose={closeForm}
          onSaved={onSaved}
        />
      )}
    </>
  );
}
