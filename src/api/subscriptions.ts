import { apiClient } from './client';
import { ApiResponse, Subscription, SubscriptionPlan, UsageSummary } from '../types';

export interface UsageResponseData {
  subscription: Subscription | null;
  usage: UsageSummary;
}

export interface CreateOrderPayload {
  plan_id: number;
  billing_cycle?: 'monthly' | 'yearly';
}

export interface CreateOrderResponse {
  order_id: string;
  razorpay_key: string;
  amount: number;
  currency: string;
  plan: {
    id: number;
    name: string;
    slug: string;
  };
  billing_cycle: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
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

  createOrder: async (payload: CreateOrderPayload) => {
    const response = await apiClient.post<ApiResponse<CreateOrderResponse>>('/payments/razorpay/create-order', payload);
    return response.data;
  },

  verifyPayment: async (payload: VerifyPaymentPayload) => {
    const response = await apiClient.post<ApiResponse<UsageResponseData>>('/payments/razorpay/verify', payload);
    return response.data;
  },
};
