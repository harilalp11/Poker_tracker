import api from './api';

export interface Session {
  _id: string;
  userId: string;
  date: string;
  venue: string;
  stakes: string;
  gameType: string;
  tableSize: string;
  buyIn: number;
  cashOut: number;
  profit: number;
  duration: number;
  handsPlayed: number;
  vpip: number;
  pfr: number;
  status: 'active' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hand {
  _id: string;
  sessionId: string;
  userId: string;
  handNumber: number;
  position: string;
  holeCards: string[];
  communityCards: {
    flop: string[];
    turn: string | null;
    river: string | null;
  };
  actions: any[];
  result: number;
  tags: string[];
  importance: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Description: Get all sessions for the current user
// Endpoint: GET /api/sessions
// Request: {}
// Response: { success: boolean, sessions: Session[] }
export const getSessions = async () => {
  console.log('Getting all sessions');
  try {
    const response = await api.get('/api/sessions');
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create a new session
// Endpoint: POST /api/sessions
// Request: { date: string, venue: string, stakes: string, gameType: string, tableSize: string, buyIn: number, notes?: string }
// Response: { success: boolean, session: Session }
export const createSession = async (sessionData: any) => {
  console.log('=== SESSION API CALL DEBUG START ===')
  console.log('sessions.ts: createSession called with data:', JSON.stringify(sessionData, null, 2));
  console.log('sessions.ts: Session data keys:', Object.keys(sessionData));
  console.log('sessions.ts: Date field verification:', {
    hasDate: sessionData.hasOwnProperty('date'),
    dateValue: sessionData.date,
    dateType: typeof sessionData.date,
    dateIsString: typeof sessionData.date === 'string',
    dateLength: sessionData.date?.length,
    dateFormat: sessionData.date
  });
  console.log('sessions.ts: API call timestamp:', new Date().toISOString());

  // Validate required fields before making API call
  if (!sessionData.date) {
    console.error('sessions.ts: VALIDATION ERROR - Missing date field');
    throw new Error('Date is required');
  }

  if (!sessionData.venue) {
    console.error('sessions.ts: VALIDATION ERROR - Missing venue field');
    throw new Error('Venue is required');
  }

  if (!sessionData.stakes) {
    console.error('sessions.ts: VALIDATION ERROR - Missing stakes field');
    throw new Error('Stakes is required');
  }

  if (!sessionData.gameType) {
    console.error('sessions.ts: VALIDATION ERROR - Missing gameType field');
    throw new Error('Game type is required');
  }

  if (!sessionData.tableSize) {
    console.error('sessions.ts: VALIDATION ERROR - Missing tableSize field');
    throw new Error('Table size is required');
  }

  if (sessionData.buyIn === undefined || sessionData.buyIn === null) {
    console.error('sessions.ts: VALIDATION ERROR - Missing buyIn field');
    throw new Error('Buy-in amount is required');
  }

  if (typeof sessionData.buyIn !== 'number' || sessionData.buyIn < 0) {
    console.error('sessions.ts: VALIDATION ERROR - Invalid buyIn value:', sessionData.buyIn);
    throw new Error('Buy-in must be a valid positive number');
  }

  console.log('sessions.ts: All required fields validated successfully');

  try {
    console.log('sessions.ts: Making POST request to /api/sessions');
    console.log('sessions.ts: Request payload being sent:', JSON.stringify(sessionData, null, 2));

    const response = await api.post('/api/sessions', sessionData);

    console.log('sessions.ts: API response received successfully');
    console.log('sessions.ts: Response status:', response.status);
    console.log('sessions.ts: Response data:', JSON.stringify(response.data, null, 2));
    console.log('=== SESSION API CALL DEBUG SUCCESS ===');

    return response.data;
  } catch (error) {
    console.error('=== SESSION API CALL DEBUG ERROR ===');
    console.error('sessions.ts: API call failed');
    console.error('sessions.ts: Error object:', error);
    console.error('sessions.ts: Error message:', error.message);
    console.error('sessions.ts: Error response status:', error?.response?.status);
    console.error('sessions.ts: Error response data:', error?.response?.data);
    console.error('sessions.ts: Full error response:', JSON.stringify(error?.response, null, 2));
    console.error('=== SESSION API CALL DEBUG ERROR END ===');

    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get a single session by ID
// Endpoint: GET /api/sessions/:id
// Request: {}
// Response: { success: boolean, session: Session }
export const getSessionById = async (sessionId: string) => {
  console.log('Getting session by ID:', sessionId);
  try {
    const response = await api.get(`/api/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: End a session (mark as completed)
// Endpoint: PUT /api/sessions/:id/end
// Request: {}
// Response: { success: boolean, session: Session }
export const endSession = async (sessionId: string) => {
  console.log('Ending session:', sessionId);
  try {
    const response = await api.put(`/api/sessions/${sessionId}/end`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get all hands for a session
// Endpoint: GET /api/sessions/:id/hands
// Request: {}
// Response: { success: boolean, hands: Hand[] }
export const getHandsBySession = async (sessionId: string) => {
  console.log('Getting hands for session:', sessionId);
  try {
    const response = await api.get(`/api/sessions/${sessionId}/hands`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create a new hand for a session
// Endpoint: POST /api/sessions/:id/hands
// Request: { position: string, holeCards: string[], communityCards: object, actions: any[], result: number, tags: string[], importance: number, notes?: string }
// Response: { success: boolean, hand: Hand }
export const createHand = async (sessionId: string, handData: any) => {
  console.log('=== HAND CREATION API DEBUG START ===')
  console.log('API createHand: ENTRY POINT - Hand creation requested')
  console.log('API createHand: Session ID:', sessionId)
  console.log('API createHand: Hand data:', JSON.stringify(handData, null, 2))
  console.log('API createHand: Current timestamp:', new Date().toISOString())
  console.log('API createHand: Current access token exists:', !!localStorage.getItem('accessToken'))
  console.log('API createHand: Current refresh token exists:', !!localStorage.getItem('refreshToken'))
  console.log('API createHand: Access token preview:', localStorage.getItem('accessToken')?.substring(0, 50) + '...')
  console.log('API createHand: Stack trace to see WHO called this function:')
  console.trace('API createHand: Call stack trace')

  console.log('Creating hand for session:', sessionId, 'with data:', handData);
  try {
    console.log('API createHand: About to make POST request to /api/sessions/' + sessionId + '/hands')
    console.log('API createHand: Request payload:', JSON.stringify(handData, null, 2))

    const response = await api.post(`/api/sessions/${sessionId}/hands`, handData);

    console.log('API createHand: SUCCESS - Hand created via API call')
    console.log('API createHand: Response status:', response.status)
    console.log('API createHand: Response data:', JSON.stringify(response.data, null, 2))
    console.log('=== HAND CREATION API DEBUG SUCCESS ===')
    return response.data;
  } catch (error) {
    console.error('=== HAND CREATION API DEBUG ERROR ===')
    console.error('API createHand: ERROR - Failed to create hand')
    console.error('API createHand: Error object:', error)
    console.error('API createHand: Error message:', error.message)
    console.error('API createHand: Error response status:', error?.response?.status)
    console.error('API createHand: Error response data:', error?.response?.data)
    console.error('API createHand: Error response headers:', error?.response?.headers)
    console.error('API createHand: Full error response:', JSON.stringify(error?.response, null, 2))
    console.error('API createHand: Is this a network error?', !error?.response)
    console.error('API createHand: Error config:', error?.config)
    console.error('=== HAND CREATION API DEBUG ERROR END ===')
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete a hand
// Endpoint: DELETE /api/sessions/:sessionId/hands/:handId
// Request: {}
// Response: { success: boolean, message: string }
export const deleteHand = async (sessionId: string, handId: string) => {
  console.log('Deleting hand:', handId, 'from session:', sessionId);
  try {
    const response = await api.delete(`/api/sessions/${sessionId}/hands/${handId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};