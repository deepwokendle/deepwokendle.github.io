import { useState, useEffect, useRef } from 'react';
import Select, { type SingleValue } from 'react-select';
import type { MonsterEnriched, NamedOption } from '../../types';
import {
  apiFetchElements, apiFetchCategories, apiFetchPlayerLoots, apiFetchPlayerLocations,
  apiUploadImage, apiCreateMySuggestion, apiUpdateMySuggestion,
  apiPlayerCreateLoot, apiPlayerCreateLocation,
} from '../../services/api';
import { showToast } from '../../utils/toast';
import ImageCropModal from '../admin/ImageCropModal';
import styles from '../../pages/admin/AdminMonstersPage.module.css';
import modalStyles from './SuggestionFormModal.module.css';

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

interface SelectOpt { value: number; label: string; }

const toOpts = (items: NamedOption[]): SelectOpt[] =>
  items.map(i => ({ value: i.id, label: i.name }));

const findOpt = (opts: SelectOpt[], id: number): SelectOpt | null =>
  opts.find(o => o.value === id) ?? null;

const selectStyles = {
  control: (base: any) => ({
    ...base,
    background: 'var(--container-background)',
    borderColor: 'transparent',
    boxShadow: 'none',
    cursor: 'pointer',
    '&:hover': { borderColor: 'transparent' },
  }),
  menu: (base: any) => ({
    ...base,
    background: 'var(--background)',
    zIndex: 300,
  }),
  option: (base: any, state: any) => ({
    ...base,
    background: state.isFocused ? 'var(--container-background)' : 'transparent',
    color: 'white',
    opacity: state.isFocused ? 1 : 0.75,
    cursor: 'pointer',
  }),
  singleValue: (base: any) => ({ ...base, color: 'white' }),
  placeholder: (base: any) => ({ ...base, color: 'white', opacity: 0.4 }),
  input: (base: any) => ({ ...base, color: 'white' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base: any) => ({ ...base, color: 'rgba(216,215,202,0.5)', padding: '0 6px' }),
};

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

export default function SuggestionFormModal({ monster, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [elements, setElements] = useState<NamedOption[]>([]);
  const [categories, setCategories] = useState<NamedOption[]>([]);
  const [locations, setLocations] = useState<NamedOption[]>([]);
  const [loots, setLoots] = useState<NamedOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [addingLoot, setAddingLoot] = useState(false);
  const [lootDraft, setLootDraft] = useState('');
  const [addingLocation, setAddingLocation] = useState(false);
  const [locationDraft, setLocationDraft] = useState('');

  const isEdit = monster !== null;
  const elementOpts = toOpts(elements);
  const categoryOpts = toOpts(categories);

  useEffect(() => {
    Promise.all([
      apiFetchElements().then(r => r.json()),
      apiFetchCategories().then(r => r.json()),
      apiFetchPlayerLocations().then(r => r.json()),
      apiFetchPlayerLoots().then(r => r.json()),
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
    e.target.value = '';
    setCropSrc(URL.createObjectURL(f));
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

  const toggleMulti = (id: number, field: 'locationIds' | 'lootIds') =>
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(id) ? prev[field].filter(x => x !== id) : [...prev[field], id],
    }));

  const commitLoot = async () => {
    const name = lootDraft.trim();
    setAddingLoot(false);
    setLootDraft('');
    if (!name) return;
    try {
      const res = await apiPlayerCreateLoot(name);
      if (!res.ok) { showToast.error('Failed to create loot.'); return; }
      const newLoot: NamedOption = await res.json();
      setLoots(prev => [...prev, newLoot]);
      setForm(prev => ({ ...prev, lootIds: [...prev.lootIds, newLoot.id] }));
    } catch {
      showToast.error('Failed to create loot.');
    }
  };

  const commitLocation = async () => {
    const name = locationDraft.trim();
    setAddingLocation(false);
    setLocationDraft('');
    if (!name) return;
    try {
      const res = await apiPlayerCreateLocation(name);
      if (!res.ok) { showToast.error('Failed to create location.'); return; }
      const newLoc: NamedOption = await res.json();
      setLocations(prev => [...prev, newLoc]);
      setForm(prev => ({ ...prev, locationIds: [...prev.locationIds, newLoc.id] }));
    } catch {
      showToast.error('Failed to create location.');
    }
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
        ? await apiUpdateMySuggestion(monster!.id, payload)
        : await apiCreateMySuggestion(payload);

      if (!res.ok) {
        showToast.error((await res.text()) || 'Save failed.');
        return;
      }
      showToast.success(isEdit ? 'Suggestion updated!' : 'Suggestion submitted!');
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
        <div className={`modal border ${styles.formModal}`} onClick={e => e.stopPropagation()}>
          <h2>{isEdit ? `Edit: ${monster!.name}` : 'Suggest a Monster'}</h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.topRow}>
              <div className={styles.imageUpload} onClick={() => fileRef.current?.click()}>
                {previewUrl
                  ? <img src={previewUrl} alt="preview" className={styles.imagePreviewFull} />
                  : <span className={styles.noImagePlaceholder}>No Image</span>
                }
                <div className={styles.imageOverlay}>
                  <span>{previewUrl ? 'Change Image' : 'Upload Image'}</span>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              </div>

              <div className={styles.coreFields}>
                <div className={styles.formRow}>
                  <label>Name</label>
                  <input
                    className={`border ${modalStyles.nameInput}`}
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Monster name"
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Humanoid</label>
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={form.humanoid} onChange={e => setForm(p => ({ ...p, humanoid: e.target.checked }))} />
                    <span className={styles.toggleSlider} />
                  </label>
                </div>
                <div className={styles.formRow}>
                  <label>Element</label>
                  <Select
                    className="border nameInput"
                    classNamePrefix="gs"
                    options={elementOpts}
                    value={findOpt(elementOpts, form.elementId)}
                    onChange={(opt: SingleValue<SelectOpt>) => setForm(p => ({ ...p, elementId: opt?.value ?? 0 }))}
                    placeholder="Select element…"
                    isSearchable={false}
                    styles={selectStyles}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formRow}>
              <label>Category</label>
              <Select
                className="border nameInput"
                classNamePrefix="gs"
                options={categoryOpts}
                value={findOpt(categoryOpts, form.categoryId)}
                onChange={(opt: SingleValue<SelectOpt>) => setForm(p => ({ ...p, categoryId: opt?.value ?? 0 }))}
                placeholder="Select category…"
                isSearchable={false}
                styles={selectStyles}
              />
            </div>

            <div className={styles.formRow}>
              <label>Locations</label>
              <div className={styles.chipGroup}>
                {locations.map(loc => (
                  <button
                    key={loc.id}
                    type="button"
                    className={`${styles.chip}${form.locationIds.includes(loc.id) ? ` ${styles.chipActive}` : ''}`}
                    onClick={() => toggleMulti(loc.id, 'locationIds')}
                  >
                    {loc.name}
                  </button>
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

            <div className={styles.formRow}>
              <label>Loots</label>
              <div className={styles.chipGroup}>
                {loots.map(loot => (
                  <button
                    key={loot.id}
                    type="button"
                    className={`${styles.chip}${form.lootIds.includes(loot.id) ? ` ${styles.chipActive}` : ''}`}
                    onClick={() => toggleMulti(loot.id, 'lootIds')}
                  >
                    {loot.name}
                  </button>
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
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Submit'}
              </button>
              <button type="button" className="btn" onClick={onClose} disabled={saving}>Cancel</button>
            </div>
          </form>
        </div>
      </div>

      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
          aspect={1}
        />
      )}
    </>
  );
}
