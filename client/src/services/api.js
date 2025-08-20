import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log(`API: Making request to URL: ${config.url}`);
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`API: Adding authorization header to request for URL: ${config.url}`);
      console.log(`API: Token preview: ${token.substring(0, 50)}...`);
    }
    
    return config;
  },
  (error) => {
    console.error('API: Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common responses and errors
api.interceptors.response.use(
  (response) => {
    console.log(`API: Successful response for URL: ${response.config.url} Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('API: Response interceptor error:', error);
    
    // Handle 401 unauthorized errors
    if (error.response?.status === 401) {
      console.log('API: Unauthorized access, clearing token and redirecting to login');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('API: Network error - no response received');
      return Promise.reject(new Error('Network error - please check your connection'));
    }
    
    // Handle other HTTP errors
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
    console.error(`API: HTTP error ${error.response.status}: ${errorMessage}`);
    
    return Promise.reject(error);
  }
);

export default api;