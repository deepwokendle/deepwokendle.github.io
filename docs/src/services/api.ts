export const getApiUrl = (): string => {
  const host = window.location.hostname;
  if (!host || host === 'localhost' || host === '127.0.0.1' || host === '192.168.1.184') {
    return 'https://localhost:7021/api';
  }
  return 'https://deepwokendle.onrender.com/api';
};

let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void): void => {
  unauthorizedHandler = handler;
};

const withAuth = (init: RequestInit = {}): RequestInit => {
  const token = localStorage.getItem('token');
  if (!token) return init;
  const headers = new Headers(init.headers as HeadersInit | undefined);
  headers.set('Authorization', `Bearer ${token}`);
  return { ...init, headers };
};

export const apiFetch = async (path: string, init: RequestInit = {}): Promise<Response> => {
  const response = await fetch(getApiUrl() + path, withAuth(init));
  if (response.status === 401) unauthorizedHandler?.();
  return response;
};

export const apiLogin = (username: string, password: string) =>
  apiFetch('/Auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Username: username, Password: password }),
  });

export const apiRegister = (username: string, password: string) =>
  apiFetch('/Auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Username: username, Password: password }),
  });

// Bypasses the unauthorized handler so a background refresh doesn't trigger the logout dialog
export const apiRefreshToken = (currentToken: string): Promise<Response> =>
  fetch(getApiUrl() + '/Auth/refresh', {
    method: 'POST',
    headers: { Authorization: `Bearer ${currentToken}` },
  });

export const apiFetchAllMonsters = () => apiFetch('/Monsters/getMonsters');
export const apiFetchDailyMonster = () => apiFetch('/Monsters/daily-monster');
export const apiFetchInfiniteMonster = () => apiFetch('/Monsters/infinite-monster');
export const apiCreateMonster = (formData: FormData) =>
  apiFetch('/Monsters/createMonster', { method: 'POST', body: formData });

export const apiFetchStreak = () => apiFetch('/Attempts/get-streak');
export const apiInsertAttempt = (payload: object) =>
  apiFetch('/Attempts/insert-attempt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
export const apiGuessDailyMonster = (monsterId: number, amountsGuessed: number) =>
  apiFetch('/Attempts/guess-daily', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ monsterId, amountsGuessed }),
  });

export const apiFetchGuessedMonsters = () => apiFetch('/Attempts/guessed-monsters');
export const apiFetchMonsterStats = (monsterId: number) => apiFetch(`/Attempts/monster-stats/${monsterId}`);
export const apiFetchLeaderboard = () => apiFetch('/Leaderboard/get-leaderboard');
export const apiFetchMonthlyLeaderboard = () => apiFetch('/Leaderboard/get-monthly');
export const apiFetchDailyLeaderboard = () => apiFetch('/Leaderboard/get-daily');
export const apiFetchElements = () => apiFetch('/Elements/getElements');
export const apiFetchCategories = () => apiFetch('/Categories/getCategories');
export const apiFetchLoots = () => apiFetch('/Loots/getLoots');
export const apiFetchLocations = () => apiFetch('/Locations/getLocations');
export const apiFetchPlayerLoots = () => apiFetch('/Loots/player-options');
export const apiFetchPlayerLocations = () => apiFetch('/Locations/player-options');
export const apiPlayerCreateLoot = (name: string) =>
  apiFetch('/Loots/player-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
export const apiPlayerCreateLocation = (name: string) =>
  apiFetch('/Locations/player-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
export const apiAdminCreateLoot = (name: string) =>
  apiFetch('/Loots/admin-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
export const apiAdminDeleteLoot = (id: number) =>
  apiFetch(`/Loots/admin-delete/${id}`, { method: 'DELETE' });
export const apiAdminCreateLocation = (name: string) =>
  apiFetch('/Locations/admin-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
export const apiAdminDeleteLocation = (id: number) =>
  apiFetch(`/Locations/admin-delete/${id}`, { method: 'DELETE' });

// Admin
export const apiAdminListMonsters = () => apiFetch('/Monsters/admin-list');
export const apiAdminGetEnrichedMonster = (id: number) => apiFetch(`/Monsters/${id}/enriched`);
export const apiAdminCreateMonster = (payload: object) =>
  apiFetch('/Monsters/admin-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
export const apiAdminUpdateMonster = (id: number, payload: object) =>
  apiFetch(`/Monsters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
export const apiAdminDeleteMonster = (id: number) =>
  apiFetch(`/Monsters/${id}`, { method: 'DELETE' });
export const apiAdminPublishMonster = (id: number) =>
  apiFetch(`/Monsters/${id}/publish`, { method: 'PATCH' });

export const apiAdminBulkDelete = (ids: number[]) =>
  apiFetch('/Monsters/bulk', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ids),
  });
export const apiUploadImage = (file: File) => {
  const form = new FormData();
  form.append('image', file);
  return apiFetch('/Monsters/upload-image', { method: 'POST', body: form });
};

export const apiReportChatMessage = (externalId: string) =>
  apiFetch(`/Chat/report/${externalId}`, { method: 'POST' });

export const apiGetChatMessages = (skip: number, take: number) =>
  apiFetch(`/Chat/messages?skip=${skip}&take=${take}`);

// Monster Suggestions
export const apiFetchMonsterSuggestions = (page: number, pageSize: number, sort: string, search = '') =>
  apiFetch(`/Monsters/suggestions?page=${page}&pageSize=${pageSize}&sort=${encodeURIComponent(sort)}&search=${encodeURIComponent(search)}`);

export const apiVoteMonsterSuggestion = (id: number, vote: number) =>
  apiFetch(`/Monsters/${id}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vote }),
  });

export const apiReportMonsterSuggestion = (id: number) =>
  apiFetch(`/Monsters/${id}/report`, { method: 'POST' });

export const apiFetchMyMonsterSuggestions = () =>
  apiFetch('/Monsters/my-suggestions');

export const apiGetMySuggestionEnriched = (id: number) =>
  apiFetch(`/Monsters/${id}/my-suggestion-enriched`);

export const apiCreateMySuggestion = (payload: object) =>
  apiFetch('/Monsters/my-suggestion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const apiUpdateMySuggestion = (id: number, payload: object) =>
  apiFetch(`/Monsters/${id}/my-suggestion`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const apiDeleteMySuggestion = (id: number) =>
  apiFetch(`/Monsters/${id}/my-suggestion`, { method: 'DELETE' });
