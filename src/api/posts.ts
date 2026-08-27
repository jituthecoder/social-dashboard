import { apiClient } from './client';
import { ApiResponse, PaginatedResponse, Post } from '../types';

export interface CreatePostPayload {
  title?: string;
  content: string;
  is_scheduled?: boolean;
  scheduled_at?: string;
  social_account_ids?: number[];
  variants?: Array<{
    platform: string;
    content?: string;
    hashtags?: string[];
    social_account_id?: number;
  }>;
  media_ids?: number[];
}

export interface PostFilters {
  status?: string;
  platform?: string;
  date?: string;
  scheduled_date?: string;
  page?: number;
  per_page?: number;
}

export const postsApi = {
  list: async (filters: PostFilters = {}) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Post>>>('/posts', { params: filters });
    return response.data;
  },

  get: async (id: number) => {
    const response = await apiClient.get<ApiResponse<Post>>(`/posts/${id}`);
    return response.data;
  },

  create: async (payload: CreatePostPayload) => {
    const response = await apiClient.post<ApiResponse<Post>>('/posts', payload);
    return response.data;
  },

  update: async (id: number, payload: Partial<CreatePostPayload>) => {
    const response = await apiClient.put<ApiResponse<Post>>(`/posts/${id}`, payload);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/posts/${id}`);
    return response.data;
  },
};
