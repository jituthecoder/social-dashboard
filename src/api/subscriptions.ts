import { apiClient } from './client';
import { ApiResponse, Subscription, SubscriptionPlan, UsageSummary } from '../types';

export interface UsageResponseData {
  subscription: Subscription | null;
  usage: UsageSummary;
}

export const subscriptionsApi = {
  getPlans: async () => {
    const response = await apiClient.get<ApiResponse<SubscriptionPlan[]>>('/subscription/plans');
    return response.data;
  },

  getUsage: async () => {
    const response = await apiClient.get<ApiResponse<UsageResponseData>>('/subscription/usage');
    return response.data;
  },
};
