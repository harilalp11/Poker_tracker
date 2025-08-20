import api from './api';

export interface Player {
  _id: string;
  name: string;
  alias?: string;
  tags: string[];
  notes: string;
  handsPlayed: number;
  lastSeen: string;
  venue: string;
  profitAgainst: number;
  winRateAgainst: number;
  playingStyle: {
    vpip: number;
    pfr: number;
    aggression: number;
    tightness: 'tight' | 'loose' | 'balanced';
    aggression_level: 'passive' | 'aggressive' | 'balanced';
  };
}

// Description: Get all players in database
// Endpoint: GET /api/players
// Request: {}
// Response: { players: Player[] }
export const getPlayers = async () => {
  console.log('Fetching players from API');
  try {
    const response = await api.get('/api/players');
    return response.data;
  } catch (error) {
    console.error('Error fetching players:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Add or update player
// Endpoint: POST /api/players
// Request: { name: string, alias?: string, tags: string[], notes: string, venue: string }
// Response: { player: Player }
export const addPlayer = async (data: Partial<Player>) => {
  console.log('Adding/updating player:', data);
  try {
    const response = await api.post('/api/players', data);
    return response.data;
  } catch (error) {
    console.error('Error adding player:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Delete player
// Endpoint: DELETE /api/players/:id
// Request: {}
// Response: { success: boolean }
export const deletePlayer = async (id: string) => {
  console.log(`Deleting player ${id}`);
  try {
    const response = await api.delete(`/api/players/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting player:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
}