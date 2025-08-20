import api from './api';

export interface AnalyticsData {
  overview: {
    totalHands: number;
    totalProfit: number;
    winRate: number;
    hourlyRate: number;
    totalSessions: number;
    avgSessionLength: number;
  };
  preflopStats: {
    vpip: number;
    pfr: number;
    threeBet: number;
    stealAttempts: number;
  };
  postflopStats: {
    cBetFlop: number;
    cBetTurn: number;
    aggressionFactor: number;
    wtsd: number;
    wsd: number;
  };
  positionStats: {
    position: string;
    hands: number;
    profit: number;
    vpip: number;
    pfr: number;
  }[];
  performanceChart: {
    date: string;
    profit: number;
    hands: number;
  }[];
}

export interface WinRateStats {
  totalHands: number;
  wonHands: number;
  winRate: number;
}

export interface VPIPStats {
  totalHands: number;
  vpipHands: number;
  vpipRate: number;
}

export interface PFRStats {
  totalHands: number;
  pfrHands: number;
  pfrRate: number;
}

// Description: Get comprehensive analytics data
// Endpoint: GET /api/statistics/analytics
// Request: { dateFrom?: string, dateTo?: string, stakes?: string }
// Response: { success: boolean, analytics: AnalyticsData }
export const getAnalytics = async (filters?: { dateFrom?: string; dateTo?: string; stakes?: string }) => {
  console.log('Analytics API: Starting getAnalytics request');
  console.log('Analytics API: Fetching analytics data with filters:', filters);
  console.log('Analytics API: Request timestamp:', new Date().toISOString());
  
  try {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.stakes) params.append('stakes', filters.stakes);

    const queryString = params.toString();
    const url = `/api/statistics/analytics${queryString ? `?${queryString}` : ''}`;

    console.log('Analytics API: Making request to URL:', url);
    const response = await api.get(url);
    console.log('Analytics API: Response received:', response.status);
    console.log('Analytics API: Response data preview:', {
      success: response.data.success,
      hasAnalytics: !!response.data.analytics,
      hourlyRate: response.data.analytics?.overview?.hourlyRate
    });
    console.log('Analytics API: Full response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Analytics API: Error occurred:', error);
    console.error('Analytics API: Error message:', error.message);
    console.error('Analytics API: Error response:', error?.response?.data);
    console.error('Analytics API: Error status:', error?.response?.status);
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Get win rate statistics
// Endpoint: GET /api/statistics/win-rate
// Request: {}
// Response: { success: boolean, data: WinRateStats }
export const getWinRateStats = async () => {
  console.log('Fetching win rate statistics');
  try {
    const response = await api.get('/api/statistics/win-rate');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Get VPIP statistics
// Endpoint: GET /api/statistics/vpip
// Request: {}
// Response: { success: boolean, data: VPIPStats }
export const getVPIPStats = async () => {
  console.log('Fetching VPIP statistics');
  try {
    const response = await api.get('/api/statistics/vpip');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Get PFR statistics
// Endpoint: GET /api/statistics/pfr
// Request: {}
// Response: { success: boolean, data: PFRStats }
export const getPFRStats = async () => {
  console.log('Fetching PFR statistics');
  try {
    const response = await api.get('/api/statistics/pfr');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}