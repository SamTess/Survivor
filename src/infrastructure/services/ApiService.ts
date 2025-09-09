import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { SessionUser, LoginCredentials, SignupData, RequestResetData, ResetPasswordData, LoginErrorResponse } from '@/domain/interfaces';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiService {
  private client: AxiosInstance;

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        console.error('API Response Error:', error);

        if (error.response?.status === 401) {
          console.warn('Unauthorized access - session may have expired');
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }

        if (error.response?.status === 403) {
          console.warn('Forbidden - insufficient permissions');
        }

        if (error.response?.status && error.response.status >= 500) {
          console.error('Server error occurred');
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request<ApiResponse<T>>(config);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data;
        return {
          success: false,
          error: apiError?.error || error.message,
          message: apiError?.message,
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // Authentication specific methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<SessionUser>> {
    try {
      const response = await this.client.post<SessionUser>('/auth/login', credentials);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as LoginErrorResponse;
        return {
          success: false,
          error: errorData.error,
          // Pass through special fields for password reset handling
          ...(errorData.requiresPasswordReset && { requiresPasswordReset: errorData.requiresPasswordReset }),
          ...(errorData.devMode && { devMode: errorData.devMode }),
          ...(errorData.resetUrl && { resetUrl: errorData.resetUrl }),
        } as ApiResponse<SessionUser> & {
          requiresPasswordReset?: boolean;
          devMode?: boolean;
          resetUrl?: string;
        }; // Type assertion to allow extra properties
      }
      return {
        success: false,
        error: 'An unexpected error occurred during login',
      };
    }
  }

  async signup(userData: SignupData): Promise<ApiResponse<SessionUser>> {
    try {
      const response = await this.client.post<SessionUser>('/auth/signup', userData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as { error?: string } | undefined;
        return {
          success: false,
          error: apiError?.error || error.message,
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred during signup',
      };
    }
  }

  async logout(): Promise<ApiResponse<{ ok: boolean }>> {
    return this.post<{ ok: boolean }>('/auth/logout');
  }

  async getCurrentUser(): Promise<ApiResponse<SessionUser>> {
    try {
      const response = await this.client.get('/auth/me');
      const u = response.data as { id: number; name: string; email: string; role: string; permissions?: string[] };
      const role = (u?.role === 'ADMIN') ? 'admin' : 'user';
      return {
        success: true,
        data: { id: u.id, name: u.name, email: u.email, role, permissions: u.permissions },
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as { error?: string } | undefined;
        return { success: false, error: apiError?.error || error.message };
      }
      return { success: false, error: 'Failed to fetch current user' };
    }
  }

  async requestPasswordReset(data: RequestResetData): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>('/auth/request-reset', data);
  }

  async resetPassword(data: ResetPasswordData): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>('/auth/reset-password', data);
  }

  // Utility methods
  setAuthToken(token: string) {
    // Not needed for cookie-based auth, but kept for flexibility
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Get the axios instance for direct use if needed
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Create and export a default instance
export const apiService = new ApiService();

// Export the class for creating custom instances
export default ApiService;
