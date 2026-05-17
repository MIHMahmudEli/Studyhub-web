import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to manage the access token in memory
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

// Request Interceptor: Attach the access token to every request
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 errors and auto-refresh
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to get a new access token using the refresh_token cookie
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const { access_token } = response.data;

        setAccessToken(access_token);
        
        // Update the original request header and retry
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, the user is truly logged out
        setAccessToken(null);
        return Promise.reject(refreshError);
      }
    }

    const raw = error.response?.data?.message;
    // class-validator returns an array of messages — pick the first, keep it short
    const message = Array.isArray(raw) ? raw[0] : (raw || 'Something went wrong');
    const status = error.response?.status;

    const customError = new Error(message);
    customError.status = status;
    customError.data = error.response?.data;

    return Promise.reject(customError);
  }
);

export const apiRequest = async (endpoint, options = {}) => {
  const { method = 'GET', body, ...customOptions } = options;
  
  return api({
    url: endpoint,
    method,
    data: body,
    ...customOptions,
  });
};

export default api;
