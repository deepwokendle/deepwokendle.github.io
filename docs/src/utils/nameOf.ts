/** Extracts a display name from either a plain string or a {name} object
 *  (ASP.NET navigation properties serialize as full objects). */
export const nameOf = (val: unknown): string => {
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object' && 'name' in val)
    return String((val as { name: unknown }).name);
  return String(val ?? '');
};
