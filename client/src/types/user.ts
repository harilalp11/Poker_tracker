export interface User {
  _id: string;
  email: string;
  username: string;
  totalProfit: number;
  preferredStakes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser extends User {
  token?: string;
}

export interface UserProfile {
  _id: string;
  email: string;
  username: string;
  totalProfit: number;
  preferredStakes: string;
  totalSessions?: number;
  totalHands?: number;
  winRate?: number;
  hourlyRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  preferredStakes?: string;
}

export interface UserStats {
  totalSessions: number;
  totalHands: number;
  totalProfit: number;
  winRate: number;
  hourlyRate: number;
  avgSessionLength: number;
}