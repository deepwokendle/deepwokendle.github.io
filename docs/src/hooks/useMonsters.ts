import { useState, useCallback, useRef } from 'react';
import type { Monster } from '../types';
import { apiFetchAllMonsters } from '../services/api';

let cachedMonsters: Monster[] | null = null;

export function useMonsters() {
  const [monsters, setMonsters] = useState<Monster[] | null>(cachedMonsters);
  const [isLoadingMonsters, setIsLoadingMonsters] = useState(false);
  const loadingRef = useRef(false);

  const loadMonsters = useCallback(async (): Promise<Monster[]> => {
    if (cachedMonsters) return cachedMonsters;
    if (loadingRef.current) {
      await new Promise<void>(resolve => {
        const check = setInterval(() => {
          if (cachedMonsters) { clearInterval(check); resolve(); }
        }, 100);
      });
      return cachedMonsters!;
    }

    loadingRef.current = true;
    setIsLoadingMonsters(true);
    try {
      const res = await apiFetchAllMonsters();
      if (!res.ok) throw new Error('Failed to fetch monsters');
      const data = await res.json();
      const mapped: Monster[] = data.map((m: any) => ({
        id: m.id,
        name: m.name,
        picture: m.picture,
        humanoid: m.humanoid,
        mainHabitat: m.mainHabitat,
        element: m.element?.name ?? 'Unknown',
        category: m.category?.name ?? 'Unknown',
        gives: m.lootPool?.map((l: any) => l.lootName) ?? [],
        locations: m.locationPool?.map((loc: any) => loc.name) ?? [],
        userAtCreation: m.userAtCreation ?? undefined,
      }));
      cachedMonsters = mapped;
      setMonsters(mapped);
      return mapped;
    } finally {
      loadingRef.current = false;
      setIsLoadingMonsters(false);
    }
  }, []);

  return { monsters, loadMonsters, isLoadingMonsters };
}
