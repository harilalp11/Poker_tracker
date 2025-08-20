import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log(`API: Adding authorization header to request for URL: ${config.url}`);
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`API: Token preview: ${token.substring(0, 50)}...`);
    }
    return config;
  },
  (error) => {
    console.error('API: Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common responses
api.interceptors.response.use(
  (response) => {
    console.log(`API: Successful response for URL: ${response.config.url} Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('API: Response interceptor error:', error);
    
    // Handle 401 unauthorized responses
    if (error.response?.status === 401) {
      console.log('API: Unauthorized response, clearing auth data');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;