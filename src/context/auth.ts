// Main authentication context and hooks
export * from './AuthContext';
export { default as AuthContext } from './AuthContext';

// API Service
export { apiService, ApiService } from '../infrastructure/services/ApiService';
export type {
  ApiResponse,
  LoginCredentials,
  SignupData,
  SessionUser,
  LoginErrorResponse
} from '../infrastructure/services/ApiService';

// Auth guard components
export * from '../components/auth/AuthGuards';

// Auth guard hooks
export * from '../hooks/useAuthGuards';

// Auth form components
export { LoginForm } from '../components/auth/LoginForm';
