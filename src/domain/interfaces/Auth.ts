
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface RequestResetData {
  email: string;
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'investor';
  permissions?: string[];
}

// Special response for login errors that may require password reset
export interface LoginErrorResponse {
  error: string;
  requiresPasswordReset?: boolean;
  devMode?: boolean;
  resetUrl?: string;
}
