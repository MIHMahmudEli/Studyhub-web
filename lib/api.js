import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
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
