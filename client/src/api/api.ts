import axios from 'axios';

const api = axios.create({
  baseURL: '/',
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
  config: any;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      // Update the authorization header with the new token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('API: Updated queued request authorization header with new token');
      }
      resolve(config);
    }
  });

  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    
    // Check for invalid tokens before sending
    if (token && (token.length < 50 || token.includes('test') || token === 'expired_test_token')) {
      console.log('API: Detected invalid token, clearing storage');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(new Error('Invalid token detected'));
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API: Adding authorization header to request for URL:', config.url);
      console.log('API: Token preview:', token.substring(0, 50) + '...');
    } else {
      console.log('API: No access token found for request to:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('API: Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log('API: Successful response for URL:', response.config.url, 'Status:', response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.log('API: Response interceptor - Error status:', error.response?.status);
    console.log('API: Response interceptor - Error data:', error.response?.data);
    console.log('API: Response interceptor - Original request URL:', originalRequest?.url);
    console.log('API: Response interceptor - Request retry flag:', originalRequest?._retry);

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        console.log('API: Token refresh already in progress, queuing request for URL:', originalRequest?.url);
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        }).then((config) => {
          console.log('API: Retrying queued request after refresh for URL:', config.url);
          return api(config);
        }).catch((err) => {
          console.error('API: Queued request failed after refresh:', err);
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken || refreshToken.length < 50 || refreshToken.includes('test')) {
        console.log('API: No valid refresh token available, clearing tokens and redirecting to login');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        processQueue(error, null);
        isRefreshing = false;
        // Trigger storage event to notify AuthContext
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'accessToken',
          newValue: null,
          oldValue: localStorage.getItem('accessToken')
        }));
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        console.log('API: Token expired or invalid, attempting refresh...');
        console.log('API: Current access token before refresh:', localStorage.getItem('accessToken')?.substring(0, 50) + '...');
        console.log('API: Timestamp before refresh attempt:', new Date().toISOString());
        console.log('API: Current refresh token before refresh:', localStorage.getItem('refreshToken')?.substring(0, 50) + '...');
        console.log('API: Sending refresh token request at:', new Date().toISOString());

        // FIXED: Use a fresh axios instance to avoid circular interceptor calls
        const refreshResponse = await axios.post('/api/auth/refresh', {
          refreshToken
        });

        console.log('API: Token refresh response received at:', new Date().toISOString());
        console.log('API: Token refresh response status:', refreshResponse.status);
        console.log('API: Token refresh response data keys:', Object.keys(refreshResponse.data));
        console.log('API: Token refresh response received:', {
          status: refreshResponse.status,
          accessToken: !!refreshResponse.data.accessToken,
          refreshToken: !!refreshResponse.data.refreshToken,
          accessTokenPreview: refreshResponse.data.accessToken?.substring(0, 50) + '...',
          refreshTokenPreview: refreshResponse.data.refreshToken?.substring(0, 50) + '...'
        });

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        if (!accessToken || !newRefreshToken) {
          console.error('API: Token refresh response missing tokens');
          console.error('API: Response data:', refreshResponse.data);
          throw new Error('Token refresh response missing tokens');
        }

        // Validate new tokens before storing
        if (accessToken.length < 50 || accessToken.includes('test') || 
            newRefreshToken.length < 50 || newRefreshToken.includes('test')) {
          console.error('API: Received invalid tokens from refresh');
          throw new Error('Invalid tokens received from refresh');
        }

        console.log('API: Storing new access token at:', new Date().toISOString());
        console.log('API: New access token preview:', accessToken?.substring(0, 50) + '...');
        localStorage.setItem('accessToken', accessToken);

        console.log('API: Storing new refresh token');
        console.log('API: New refresh token preview:', newRefreshToken?.substring(0, 50) + '...');
        localStorage.setItem('refreshToken', newRefreshToken);

        console.log('API: Verifying stored access token:', localStorage.getItem('accessToken')?.substring(0, 50) + '...');
        console.log('API: Verifying stored refresh token:', localStorage.getItem('refreshToken')?.substring(0, 50) + '...');

        // FIXED: Trigger storage event BEFORE processing queue to ensure AuthContext updates first
        console.log('API: Triggering storage event to notify AuthContext of token refresh');
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'accessToken',
          newValue: accessToken,
          oldValue: null
        }));

        // Small delay to allow AuthContext to process the new token
        await new Promise(resolve => setTimeout(resolve, 100));

        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        console.log('API: Updated original request authorization header with new token');
        console.log('API: New authorization header preview:', originalRequest.headers.Authorization?.substring(0, 20) + '...');

        // Process the queue with the new token
        processQueue(null, accessToken);

        console.log('API: Retrying original request with new token at:', new Date().toISOString());
        console.log('API: Original request URL:', originalRequest.url);
        console.log('API: Original request method:', originalRequest.method);

        const retryResponse = await api(originalRequest);
        console.log('API: Original request retry successful for URL:', originalRequest.url);
        return retryResponse;
      } catch (refreshError) {
        console.error('API: Token refresh failed:', refreshError);
        console.error('API: Refresh error response:', refreshError.response?.data);
        console.error('API: Refresh error status:', refreshError.response?.status);
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        console.log('API: Redirecting to login due to refresh failure');
        // Trigger storage event to notify AuthContext
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'accessToken',
          newValue: null,
          oldValue: localStorage.getItem('accessToken')
        }));
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        console.log('API: Token refresh process completed, isRefreshing set to false');
      }
    }

    console.log('API: Non-401 error or already retried, rejecting:', error.response?.status);
    return Promise.reject(error);
  }
);

export default api;