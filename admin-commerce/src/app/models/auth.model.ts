export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserInfo {
  id: string;
  email: string;
  role: 'admin' | 'customer';
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  user: UserInfo;
}
