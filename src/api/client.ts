// API client for communicating with the backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Public endpoints (no auth required)

export async function fetchScoreboard() {
  const data = await apiRequest<{ scores: any[] }>('/scoreboard');
  return data.scores;
}

export async function fetchGames() {
  const data = await apiRequest<{ games: any[] }>('/games');
  return data.games;
}

export async function fetchPlayers() {
  const data = await apiRequest<{ players: any[] }>('/players');
  return data.players;
}

export async function fetchPicks(playerId?: string, gameId?: string) {
  const params = new URLSearchParams();
  if (playerId) params.append('playerId', playerId);
  if (gameId) params.append('gameId', gameId);

  const endpoint = params.toString() ? `/picks?${params}` : '/picks';
  const data = await apiRequest<{ picks: any[] }>(endpoint);
  return data.picks;
}

// Admin endpoints (require auth in production)

export async function createPlayer(name: string, color?: string) {
  const data = await apiRequest<{ player: any }>('/players', {
    method: 'POST',
    body: JSON.stringify({ name, color }),
  });
  return data.player;
}

export async function updatePlayer(playerId: string, updates: { name?: string; color?: string }) {
  const data = await apiRequest<{ player: any }>(`/players/${playerId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return data.player;
}

export async function deletePlayer(playerId: string) {
  await apiRequest<{ success: boolean }>(`/players/${playerId}`, {
    method: 'DELETE',
  });
}

export async function createGame(game: {
  round: string;
  week: number;
  homeTeam: string;
  awayTeam: string;
}) {
  const data = await apiRequest<{ game: any }>('/games', {
    method: 'POST',
    body: JSON.stringify(game),
  });
  return data.game;
}

export async function updateGame(gameId: string, updates: any) {
  const data = await apiRequest<{ game: any }>(`/games/${gameId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return data.game;
}

export async function createPick(pick: {
  playerId: string;
  gameId: string;
  pickedTeam: string;
}) {
  const data = await apiRequest<{ pick: any }>('/picks', {
    method: 'POST',
    body: JSON.stringify(pick),
  });
  return data.pick;
}

export async function updatePick(pickId: string, updates: any) {
  const data = await apiRequest<{ pick: any }>(`/picks/${pickId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return data.pick;
}

