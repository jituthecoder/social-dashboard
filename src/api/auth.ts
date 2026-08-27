import { apiClient } from './client';
import { ApiResponse, User, Workspace } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  workspace_name?: string;
  timezone?: string;
}

export interface AuthResponseData {
  user: User;
  token?: string;
  current_workspace?: Workspace;
}

export const authApi = {
  login: async (payload: LoginPayload) => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
    return response.data;
  },

  register: async (payload: RegisterPayload) => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', payload);
    return response.data;
  },

  me: async () => {
    const response = await apiClient.get<ApiResponse<AuthResponseData>>('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post<ApiResponse<null>>('/auth/forgot-password', { email });
    return response.data;
  },
};
