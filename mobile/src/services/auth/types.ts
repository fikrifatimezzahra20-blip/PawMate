export type UserRole = 'owner' | 'walker';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  profile_photo_url?: string | null;
  created_at?: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  walker_id?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface GetMeResponse {
  user: User;
}
