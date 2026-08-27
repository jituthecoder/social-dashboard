import { apiClient } from './client';
import { ApiResponse } from '../types';

export const aiApi = {
  generate: async (prompt: string) => {
    const response = await apiClient.post<ApiResponse<{ id: number; content: string; model: string; tokens: number }>>('/ai/generate', { prompt });
    return response.data;
  },

  rewrite: async (content: string, tone = 'professional') => {
    const response = await apiClient.post<ApiResponse<{ id: number; content: string; tone: string }>>('/ai/rewrite', { content, tone });
    return response.data;
  },

  variant: async (content: string, platform: string) => {
    const response = await apiClient.post<ApiResponse<{ id: number; platform: string; content: string }>>('/ai/variant', { content, platform });
    return response.data;
  },

  hashtags: async (content: string, count = 5) => {
    const response = await apiClient.post<ApiResponse<{ hashtags: string[] }>>('/ai/hashtags', { content, count });
    return response.data;
  },

  ideas: async (topic: string, count = 5) => {
    const response = await apiClient.post<ApiResponse<{ ideas: string[] }>>('/ai/ideas', { topic, count });
    return response.data;
  },
};
