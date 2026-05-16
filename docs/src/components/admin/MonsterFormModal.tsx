import { useState, useEffect, useRef } from 'react';
import type { MonsterEnriched, NamedOption } from '../../types';
import {
  apiFetchElements, apiFetchCategories, apiFetchLoots, apiFetchLocations,
  apiUploadImage, apiAdminCreateMonster, apiAdminUpdateMonster,
  apiAdminCreateLoot, apiAdminDeleteLoot, apiAdminCreateLocation, apiAdminDeleteLocation,
} from '../../services/api';
import { showToast } from '../../utils/toast';
import { confirm } from '../common/ConfirmDialog';
import ImageCropModal from './ImageCropModal';
import styles from '../../pages/admin/AdminMonstersPage.module.css';

interface Props {
  monster: MonsterEnriched | null; // null = create mode
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  name: string;
  humanoid: boolean;
  elementId: number;
  categoryId: number;
  locationIds: number[];
  lootIds: number[];
  pictureUrl: string;
  file: File | null;
}

const emptyForm = (): FormState => ({
  name: '',
  humanoid: false,
  elementId: 0,
  categoryId: 0,
  locationIds: [],
  lootIds: [],
  pictureUrl: '',
  file: null,
});

export default function MonsterFormModal({ monster, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [elements, setElements] = useState<NamedOption[]>([]);
  const [categories, setCategories] = useState<NamedOption[]>([]);
  const [locations, setLocations] = useState<NamedOption[]>([]);
  const [loots, setLoots] = useState<NamedOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const [addingLoot, setAddingLoot] = useState(false);
  const [lootDraft, setLootDraft] = useState('');
  const [addingLocation, setAddingLocation] = useState(false);
  const [locationDraft, setLocationDraft] = useState('');

  // Crop state: null = closed, string = source image URL pending crop
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const isEdit = monster !== null;

  useEffect(() => {
    Promise.all([
      apiFetchElements().then(r => r.json()),
      apiFetchCategories().then(r => r.json()),
      apiFetchLocations().then(r => r.json()),
      apiFetchLoots().then(r => r.json()),
    ]).then(([el, cat, loc, loot]) => {
      setElements(el);
      setCategories(cat);
      setLocations(loc);
      setLoots(loot);
    }).catch(() => showToast.error('Failed to load form options.'));
  }, []);

  useEffect(() => {
    if (monster) {
      setForm({
        name: monster.name,
        humanoid: monster.humanoid,
        elementId: monster.elementId,
        categoryId: monster.categoryId,
        locationIds: monster.locationPool.map(l => l.locationId),
        lootIds: monster.lootPool.map(l => l.lootId),
        pictureUrl: monster.picture,
        file: null,
      });
      setPreviewUrl(monster.picture);
    } else {
      setForm(emptyForm());
      setPreviewUrl('');
    }
  }, [monster]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    // Reset input so the same file can be re-selected after cancel
    e.target.value = '';
    const objectUrl = URL.createObjectURL(f);
    setCropSrc(objectUrl);
  };

  const handleCropConfirm = (croppedFile: File, croppedPreview: string) => {
    setForm(prev => ({ ...prev, file: croppedFile }));
    setPreviewUrl(croppedPreview);
    setCropSrc(null);
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const commitLoot = async () => {
    const name = lootDraft.trim();
    setAddingLoot(false);
    setLootDraft('');
    if (!name) return;
    try {
      const res = await apiAdminCreateLoot(name);
      if (!res.ok) { showToast.error('Failed to create loot.'); return; }
      const newLoot: NamedOption = await res.json();
      setLoots(prev => [...prev, newLoot]);
      setForm(prev => ({ ...prev, lootIds: [...prev.lootIds, newLoot.id] }));
    } catch {
      showToast.error('Failed to create loot.');
    }
  };

  const deleteLoot = async (id: number, name: string) => {
    const ok = await confirm({ title: `Delete loot "${name}"?`, confirmText: 'Delete', cancelText: 'Cancel', danger: true });
    if (!ok) return;
    try {
      const res = await apiAdminDeleteLoot(id);
      if (!res.ok) { showToast.error('The loot is already linked to a monster or another entity.'); return; }
      setLoots(prev => prev.filter(l => l.id !== id));
      setForm(prev => ({ ...prev, lootIds: prev.lootIds.filter(x => x !== id) }));
    } catch {
      showToast.error('The loot is already linked to a monster or another entity.');
    }
  };

  const commitLocation = async () => {
    const name = locationDraft.trim();
    setAddingLocation(false);
    setLocationDraft('');
    if (!name) return;
    try {
      const res = await apiAdminCreateLocation(name);
      if (!res.ok) { showToast.error('Failed to create location.'); return; }
      const newLoc: NamedOption = await res.json();
      setLocations(prev => [...prev, newLoc]);
      setForm(prev => ({ ...prev, locationIds: [...prev.locationIds, newLoc.id] }));
    } catch {
      showToast.error('Failed to create location.');
    }
  };

  const deleteLocation = async (id: number, name: string) => {
    const ok = await confirm({ title: `Delete location "${name}"?`, confirmText: 'Delete', cancelText: 'Cancel', danger: true });
    if (!ok) return;
    try {
      const res = await apiAdminDeleteLocation(id);
      if (!res.ok) { showToast.error('The location is already linked to a monster or another entity.'); return; }
      setLocations(prev => prev.filter(l => l.id !== id));
      setForm(prev => ({ ...prev, locationIds: prev.locationIds.filter(x => x !== id) }));
    } catch {
      showToast.error('The location is already linked to a monster or another entity.');
    }
  };

  const toggleMulti = (id: number, field: 'locationIds' | 'lootIds') => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter(x => x !== id)
        : [...prev[field], id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast.error('Name is required.'); return; }
    if (!form.elementId) { showToast.error('Element is required.'); return; }
    if (!form.categoryId) { showToast.error('Category is required.'); return; }

    setSaving(true);
    try {
      let pictureUrl = form.pictureUrl;

      if (form.file) {
        const uploadRes = await apiUploadImage(form.file);
        if (!uploadRes.ok) { showToast.error('Image upload failed.'); return; }
        const { url } = await uploadRes.json();
        pictureUrl = url;
      }

      if (!pictureUrl && !isEdit) { showToast.error('Image is required.'); return; }

      const payload = {
        name: form.name,
        picture: pictureUrl,
        humanoid: form.humanoid,
        elementId: form.elementId,
        categoryId: form.categoryId,
        locationsId: form.locationIds,
        lootsId: form.lootIds,
      };

      const res = isEdit
        ? await apiAdminUpdateMonster(monster!.id, payload)
        : await apiAdminCreateMonster(payload);

      if (!res.ok) {
        const msg = await res.text();
        showToast.error(msg || 'Save failed.');
        return;
      }

      showToast.success(isEdit ? 'Monster updated!' : 'Monster created!');
      onSaved();
    } catch {
      showToast.error('Unexpected error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="modal-overlay show" onClick={onClose}>
        <div
          className={`modal border ${styles.formModal}`}
          onClick={e => e.stopPropagation()}
        >
          <h2>{isEdit ? `Edit: ${monster!.name}` : 'New Monster'}</h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Top row: image + core fields */}
            <div className={styles.topRow}>
              <div className={styles.imageUpload} onClick={() => fileRef.current?.click()}>
                {previewUrl
                  ? <img src={previewUrl} alt="preview" className={styles.imagePreviewFull} />
                  : <span className={styles.noImagePlaceholder}>No Image</span>
                }
                <div className={styles.imageOverlay}>
                  <span>{previewUrl ? 'Change Image' : 'Upload Image'}</span>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>

              <div className={styles.coreFields}>
                <div className={styles.formRow}>
                  <label>Name</label>
                  <input
                    className="border"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Monster name"
                  />
                </div>

                <div className={styles.formRow}>
                  <label>Humanoid</label>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={form.humanoid}
                      onChange={e => setForm(p => ({ ...p, humanoid: e.target.checked }))}
                    />
                    <span className={styles.toggleSlider} />
                  </label>
                </div>

                <div className={styles.formRow}>
                  <label>Element</label>
                  <select
                    className="border"
                    value={form.elementId}
                    onChange={e => setForm(p => ({ ...p, elementId: Number(e.target.value) }))}
                  >
                    <option value={0}>Select element…</option>
                    {elements.map(el => (
                      <option key={el.id} value={el.id}>{el.name}</option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            {/* Category */}
            <div className={styles.formRow}>
              <label>Category</label>
              <select
                className="border"
                value={form.categoryId}
                onChange={e => setForm(p => ({ ...p, categoryId: Number(e.target.value) }))}
              >
                <option value={0}>Select category…</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Locations */}
            <div className={styles.formRow}>
              <label>Locations</label>
              <div className={styles.chipGroup}>
                {locations.map(loc => (
                  <div key={loc.id} className={styles.chipWrapper}>
                    <button
                      type="button"
                      className={`${styles.chip}${form.locationIds.includes(loc.id) ? ` ${styles.chipActive}` : ''}`}
                      onClick={() => toggleMulti(loc.id, 'locationIds')}
                    >
                      {loc.name}
                    </button>
                    <button
                      type="button"
                      className={styles.chipDeleteBtn}
                      onClick={e => { e.stopPropagation(); deleteLocation(loc.id, loc.name); }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {addingLocation ? (
                  <input
                    className={`${styles.chip} ${styles.chipInput}`}
                    autoFocus
                    value={locationDraft}
                    onChange={e => setLocationDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); commitLocation(); }
                      if (e.key === 'Escape') { setAddingLocation(false); setLocationDraft(''); }
                    }}
                    onBlur={commitLocation}
                    placeholder="New location…"
                  />
                ) : (
                  <button
                    type="button"
                    className={`${styles.chip} ${styles.chipAdd}`}
                    onClick={() => setAddingLocation(true)}
                  >
                    +
                  </button>
                )}
              </div>
            </div>

            {/* Loots */}
            <div className={styles.formRow}>
              <label>Loots</label>
              <div className={styles.chipGroup}>
                {loots.map(loot => (
                  <div key={loot.id} className={styles.chipWrapper}>
                    <button
                      type="button"
                      className={`${styles.chip}${form.lootIds.includes(loot.id) ? ` ${styles.chipActive}` : ''}`}
                      onClick={() => toggleMulti(loot.id, 'lootIds')}
                    >
                      {loot.name}
                    </button>
                    <button
                      type="button"
                      className={styles.chipDeleteBtn}
                      onClick={e => { e.stopPropagation(); deleteLoot(loot.id, loot.name); }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {addingLoot ? (
                  <input
                    className={`${styles.chip} ${styles.chipInput}`}
                    autoFocus
                    value={lootDraft}
                    onChange={e => setLootDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); commitLoot(); }
                      if (e.key === 'Escape') { setAddingLoot(false); setLootDraft(''); }
                    }}
                    onBlur={commitLoot}
                    placeholder="New loot…"
                  />
                ) : (
                  <button
                    type="button"
                    className={`${styles.chip} ${styles.chipAdd}`}
                    onClick={() => setAddingLoot(true)}
                  >
                    +
                  </button>
                )}
              </div>
            </div>

            <div className="modal-buttons">
              <button type="button" className="btn" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}
