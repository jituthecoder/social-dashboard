import { apiClient } from './client';
import { ApiResponse, SocialAccount } from '../types';

export interface OAuthConnectResponse {
  platform: string;
  state: string;
  redirect_url: string;
}

export const socialAccountsApi = {
  list: async () => {
    const response = await apiClient.get<ApiResponse<SocialAccount[]>>('/social-accounts');
    return response.data;
  },

  get: async (id: number) => {
    const response = await apiClient.get<ApiResponse<SocialAccount>>(`/social-accounts/${id}`);
    return response.data;
  },

  disconnect: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/social-accounts/${id}`);
    return response.data;
  },

  initiateConnect: async (platform: string) => {
    const response = await apiClient.get<ApiResponse<OAuthConnectResponse>>(`/social/${platform}/connect`);
    return response.data;
  },
};
