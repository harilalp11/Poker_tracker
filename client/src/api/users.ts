import api from './api';

export interface User {
  _id: string;
  email: string;
  username: string;
  totalProfit?: number;
  preferredStakes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  totalProfit?: number;
  preferredStakes?: string;
}

// Description: Get current authenticated user
// Endpoint: GET /api/auth/me
// Request: {}
// Response: { user: User }
export const getCurrentUser = async () => {
  console.log('Users API: Fetching current user');
  try {
    const response = await api.get('/api/auth/me');
    console.log('Users API: Current user fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Users API: Error fetching current user:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Create a new user
// Endpoint: POST /api/users
// Request: CreateUserRequest
// Response: { user: User }
export const createUser = async (userData: CreateUserRequest) => {
  console.log('Users API: Creating new user:', userData.email);
  try {
    const response = await api.post('/api/users', userData);
    console.log('Users API: User created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Users API: Error creating user:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Get user by ID
// Endpoint: GET /api/users/:id
// Request: {}
// Response: { user: User }
export const getUserById = async (id: string) => {
  console.log('Users API: Fetching user by ID:', id);
  try {
    const response = await api.get(`/api/users/${id}`);
    console.log('Users API: User fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Users API: Error fetching user:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
}