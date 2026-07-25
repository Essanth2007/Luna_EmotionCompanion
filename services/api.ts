import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Create Axios Instance
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request Interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add auth token if available
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError<ApiError>) => {
      // Handle common errors
      if (error.response) {
        switch (error.response.status) {
          case 401:
            // Unauthorized - redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            break;
          case 403:
            // Forbidden
            console.error('Access forbidden');
            break;
          case 404:
            // Not found
            console.error('Resource not found');
            break;
          case 500:
            // Server error
            console.error('Server error');
            break;
          default:
            console.error('An error occurred:', error.response.data?.message);
        }
      } else if (error.request) {
        // Network error
        console.error('Network error. Please check your connection.');
      } else {
        // Request setup error
        console.error('Request setup error:', error.message);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const api = createApiInstance();

// Helper function to handle API calls
export const handleApiCall = async <T>(
  apiCall: Promise<T>
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const response = await apiCall;
    return { data: response, error: null };
  } catch (error) {
    const errorMessage =
      error instanceof AxiosError
        ? (error.response?.data?.message as string) || error.message
        : 'An unexpected error occurred';
    return { data: null, error: errorMessage };
  }
};
