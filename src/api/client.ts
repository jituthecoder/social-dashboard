import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Attach Token & Active Workspace Header
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else if (config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const workspaceId = localStorage.getItem('active_workspace_id');
  if (workspaceId) {
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('X-Workspace-Id', workspaceId);
    } else if (config.headers) {
      config.headers['X-Workspace-Id'] = workspaceId;
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Handle 401 Session Expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('active_workspace_id');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
