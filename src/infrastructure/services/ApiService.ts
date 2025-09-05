import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

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
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  permissions?: string[];
}

// Special response for login errors that may require password reset
export interface LoginErrorResponse {
  error: string;
  requiresPasswordReset?: boolean;
  devMode?: boolean;
  resetUrl?: string;
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
      withCredentials: true, // Important for HTTP-only cookies
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any request transformation here
        // For example, add auth headers if needed (though we use cookies)
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
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
        // Transform successful responses
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        // Handle common error scenarios
        console.error('API Response Error:', error);

        if (error.response?.status === 401) {
          // Unauthorized - redirect to login or emit event
          console.warn('Unauthorized access - session may have expired');
          // You can emit a custom event here for logout
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

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
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
        } as any; // Type assertion to allow extra properties
      }
      return {
        success: false,
        error: 'An unexpected error occurred during login',
      };
    }
  }

  async signup(userData: SignupData): Promise<ApiResponse<SessionUser>> {
    return this.post<SessionUser>('/auth/signup', userData);
  }

  async logout(): Promise<ApiResponse<{ ok: boolean }>> {
    return this.post<{ ok: boolean }>('/auth/logout');
  }

  async getCurrentUser(): Promise<ApiResponse<SessionUser>> {
    return this.get<SessionUser>('/auth/me');
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
