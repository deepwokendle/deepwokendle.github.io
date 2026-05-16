import Select, { type SingleValue } from 'react-select';
import type { Monster, SelectOption } from '../../types';

interface Props {
  monsters: Monster[];
  value: SelectOption | null;
  onChange: (v: SelectOption | null) => void;
  disabled?: boolean;
}

const customStyles = {
  control: (base: any) => ({
    ...base,
    background: 'gainsboro',
    borderColor: 'transparent',
    minWidth: '200px',
  }),
  menu: (base: any) => ({
    ...base,
    background: 'radial-gradient(#18221a, #04100d)',
    zIndex: 100,
  }),
  option: (base: any, state: any) => ({
    ...base,
    background: state.isFocused ? 'rgba(255,255,255,0.12)' : 'transparent',
    color: 'white',
    cursor: 'pointer',
  }),
  singleValue: (base: any) => ({ ...base, color: 'black' }),
};

export default function GuessInput({ monsters, value, onChange, disabled = false }: Props) {
  const options: SelectOption[] = monsters
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(m => ({ value: m.id, label: m.name }));

  return (
    <Select
      className="border"
      classNamePrefix="gs"
      options={options}
      value={value}
      onChange={v => onChange(v as SingleValue<SelectOption>)}
      isClearable
      isSearchable
      placeholder="Character"
      isDisabled={disabled}
      styles={customStyles}
    />
  );
}
