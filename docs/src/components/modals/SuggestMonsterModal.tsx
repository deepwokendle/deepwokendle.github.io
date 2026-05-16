import { useState, useEffect } from 'react';
import Tooltip from '../common/Tooltip';
import Select from 'react-select';
import Swal from 'sweetalert2';
import type { SelectOption } from '../../types';
import {
  apiFetchElements,
  apiFetchCategories,
  apiFetchLoots,
  apiFetchLocations,
  apiCreateMonster,
} from '../../services/api';

interface Props {
  open: boolean;
  onClose: () => void;
}

const darkSelectStyles = {
  control: (base: any) => ({ ...base, background: 'var(--container-background)', borderColor: 'transparent' }),
  menu: (base: any) => ({ ...base, background: 'var(--button-background)', color: 'white' }),
  option: (base: any, state: any) => ({
    ...base,
    background: state.isFocused ? 'var(--container-background)' : 'var(--button-background)',
    color: state.isFocused ? 'var(--text-color)' : 'white',
  }),
  multiValue: (base: any) => ({ ...base, background: 'var(--button-background)' }),
  multiValueLabel: (base: any) => ({ ...base, color: 'white' }),
  singleValue: (base: any) => ({ ...base, color: 'black' }),
};

export default function SuggestMonsterModal({ open, onClose }: Props) {
  const [name, setName] = useState('');
  const [humanoid, setHumanoid] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [elementOptions, setElementOptions] = useState<SelectOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [locationOptions, setLocationOptions] = useState<SelectOption[]>([]);
  const [lootOptions, setLootOptions] = useState<SelectOption[]>([]);
  const [selectedElement, setSelectedElement] = useState<SelectOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SelectOption | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<SelectOption[]>([]);
  const [selectedLoots, setSelectedLoots] = useState<SelectOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open || loaded) return;
    const loadAll = async () => {
      const [elRes, catRes, lootRes, locRes] = await Promise.all([
        apiFetchElements(), apiFetchCategories(), apiFetchLoots(), apiFetchLocations(),
      ]);
      const toOptions = (arr: any[]) => arr.map((e: any) => ({ value: e.id, label: e.name })).sort((a, b) => a.label.localeCompare(b.label));
      if (elRes.ok) setElementOptions(toOptions(await elRes.json()));
      if (catRes.ok) setCategoryOptions(toOptions(await catRes.json()));
      if (lootRes.ok) setLootOptions(toOptions(await lootRes.json()));
      if (locRes.ok) setLocationOptions(toOptions(await locRes.json()));
      setLoaded(true);
    };
    loadAll();
  }, [open, loaded]);

  const handleSubmit = async () => {
    if (submitting) return;
    if (!file) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please select a valid image.' });
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append('Name', name);
    formData.append('Humanoid', String(humanoid));
    formData.append('ElementId', String(selectedElement?.value ?? ''));
    formData.append('CategoryId', String(selectedCategory?.value ?? ''));
    selectedLocations.forEach(l => formData.append('LocationsId', String(l.value)));
    selectedLoots.forEach(l => formData.append('LootsId', String(l.value)));
    formData.append('File', file);

    try {
      const res = await apiCreateMonster(formData);
      if (res.status === 401) {
        Swal.fire({ icon: 'warning', title: 'Login required', text: 'Login before suggesting a monster!', confirmButtonText: 'Ok' });
        return;
      }
      if (!res.ok) throw new Error('Submission failed');
      Swal.fire({ title: 'Success', text: 'Suggestion confirmed successfully.', icon: 'success', confirmButtonText: 'Nice!' });
      setName(''); setHumanoid(false); setFile(null);
      setSelectedElement(null); setSelectedCategory(null);
      setSelectedLocations([]); setSelectedLoots([]);
      onClose();
    } catch {
      Swal.fire({ icon: 'error', title: 'Monster suggestion failed.', text: 'Check if you correctly filled the fields.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay show" id="suggestMonsterModal">
      <div className="modal border" style={{ maxWidth: '350px', minHeight: '400px' }}>
        <p className="title">Suggest An NPC!</p>
        <div className="suggestContainer">
          <div className="monsterNameHumanoidContainer">
            <input className="modalInput border" type="text" placeholder="Npc Name" value={name} onChange={e => setName(e.target.value)} />
            <Tooltip content="Humanoid?">
              <input className="modalInput border" type="checkbox" checked={humanoid} onChange={e => setHumanoid(e.target.checked)} style={{ width: '9%', padding: '5px' }} />
            </Tooltip>
          </div>
          <input
            className="modalInput border"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            style={{ backgroundColor: 'var(--container-background)' }}
            onChange={e => setFile(e.target.files?.[0] ?? null)}
          />
          <Select options={elementOptions} value={selectedElement} onChange={v => setSelectedElement(v)} placeholder="Element" isClearable styles={darkSelectStyles} />
          <Select options={categoryOptions} value={selectedCategory} onChange={v => setSelectedCategory(v)} placeholder="Category" isClearable styles={darkSelectStyles} />
          <Select options={locationOptions} value={selectedLocations} onChange={v => setSelectedLocations(v as SelectOption[])} placeholder="Locations" isMulti isClearable styles={darkSelectStyles} />
          <Select options={lootOptions} value={selectedLoots} onChange={v => setSelectedLoots(v as SelectOption[])} placeholder="Loots" isMulti isClearable styles={darkSelectStyles} />
        </div>
        <div className="modal-buttons">
          <button className="border" onClick={handleSubmit} disabled={submitting}>Suggest!</button>
          <button className="border" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
