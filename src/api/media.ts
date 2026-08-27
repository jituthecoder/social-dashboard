import { apiClient } from './client';
import { ApiResponse, Media, PaginatedResponse } from '../types';

export const mediaApi = {
  list: async (page = 1) => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Media>>>('/media', { params: { page } });
    return response.data;
  },

  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<Media>>('/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/media/${id}`);
    return response.data;
  },
};
