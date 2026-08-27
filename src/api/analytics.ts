import { apiClient } from './client';
import { AnalyticsSummary, ApiResponse } from '../types';

export const analyticsApi = {
  getSummary: async (days = 30) => {
    const response = await apiClient.get<ApiResponse<AnalyticsSummary>>('/analytics', { params: { days } });
    return response.data;
  },
};
