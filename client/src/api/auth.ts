import api from './api';

// Description: Login user with email and password
// Endpoint: POST /api/auth/login
// Request: { email: string, password: string }
// Response: { success: boolean, message: string, accessToken: string, refreshToken: string, user: object }
export const login = async (email: string, password: string) => {
  console.log('Auth API: Login attempt for:', email);
  try {
    const response = await api.post('/api/auth/login', { email, password });
    console.log('Auth API: Login successful');
    return response.data;
  } catch (error) {
    console.error('Auth API: Login failed:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Register new user
// Endpoint: POST /api/auth/register
// Request: { email: string, password: string, username: string }
// Response: { success: boolean, message: string, accessToken: string, user: object }
export const register = async (email: string, password: string, username: string) => {
  console.log('Auth API: Register attempt for:', email);
  try {
    const response = await api.post('/api/auth/register', { email, password, username });
    console.log('Auth API: Registration successful');
    return response.data;
  } catch (error) {
    console.error('Auth API: Registration failed:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get current user information
// Endpoint: GET /api/auth/me
// Request: {}
// Response: { success: boolean, user: object }
export const getCurrentUser = async () => {
  console.log('Users API: Fetching current user');
  try {
    const response = await api.get('/api/auth/me');
    console.log('Users API: Current user fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Users API: Failed to fetch current user:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Logout user
// Endpoint: POST /api/auth/logout
// Request: {}
// Response: { success: boolean, message: string }
export const logout = async () => {
  console.log('Auth API: Logout attempt');
  try {
    const response = await api.post('/api/auth/logout');
    console.log('Auth API: Logout successful');
    return response.data;
  } catch (error) {
    console.error('Auth API: Logout failed:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};