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

// Helper to manage the refresh token in localStorage (safely checking SSR)
export const setRefreshToken = (token) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('refresh_token', token);
    } else {
      localStorage.removeItem('refresh_token');
    }
  }
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token');
  }
  return null;
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

// ─── Refresh-token mutex ─────────────────────────────────────────────────────
// When multiple requests 401 at the same time (e.g. Promise.all in the admin
// dashboard), only ONE refresh is performed. Every other 401'd request waits
// for the single refresh to finish, then retries with the fresh access token.
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function onTokenRefreshFailed(err) {
  refreshSubscribers.forEach((cb) => cb(null, err));
  refreshSubscribers = [];
}

// Response Interceptor: Handle 401 errors and auto-refresh
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Define auth endpoints that shouldn't trigger automatic refresh
    const isAuthRoute = originalRequest?.url && (
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/register') ||
      originalRequest.url.includes('/auth/verify-email') ||
      originalRequest.url.includes('/auth/forgot-password') ||
      originalRequest.url.includes('/auth/reset-password')
    );

    // If the error is 401, we haven't retried yet, and it is NOT an auth route
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken, err) => {
            if (err) return reject(err);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      // This is the first 401 — perform the actual refresh
      isRefreshing = true;

      try {
        const localRefreshToken = getRefreshToken();
        const headers = {};
        if (localRefreshToken) {
          headers['Authorization'] = `Bearer ${localRefreshToken}`;
        }

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: localRefreshToken },
          { withCredentials: true, headers }
        );
        const { access_token, refresh_token } = response.data;

        setAccessToken(access_token);
        if (refresh_token) {
          setRefreshToken(refresh_token);
        }

        // Notify all queued requests with the new token
        onTokenRefreshed(access_token);

        // Retry the original (first) request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, the user is truly logged out
        setAccessToken(null);
        setRefreshToken(null);
        onTokenRefreshFailed(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const raw = error.response?.data?.message;
    // class-validator returns an array of messages — pick the first, keep it short
    let message = Array.isArray(raw) ? raw[0] : (raw || 'Something went wrong');
    const status = error.response?.status;

    // Provide user-friendly general error message for invalid credentials
    if (status === 401 && originalRequest?.url?.includes('/auth/login')) {
      message = 'Email or password is incorrect';
    }

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

// Proactively refresh the access token using the stored refresh token.
// Call this directly instead of letting /auth/me fail with 401 first.
export const refreshTokens = async () => {
  const localRefreshToken = getRefreshToken();
  if (!localRefreshToken) throw new Error('No refresh token available');

  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    { refresh_token: localRefreshToken },
    {
      withCredentials: true,
      headers: { Authorization: `Bearer ${localRefreshToken}` },
    }
  );

  const { access_token, refresh_token } = response.data;
  setAccessToken(access_token);
  if (refresh_token) setRefreshToken(refresh_token);
  return { access_token, refresh_token };
};

export default api;
