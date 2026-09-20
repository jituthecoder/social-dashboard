export interface User {
  id: number;
  name: string;
  email: string;
  status: string;
  email_verified_at?: string | null;
  last_login_at?: string | null;
  pivot?: {
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    status: string;
  };
  created_at: string;
  updated_at: string;
  workspaces?: Workspace[];
}

export interface Workspace {
  id: number;
  name: string;
  slug: string;
  owner_id: number;
  status: string;
  timezone: string;
  settings?: Record<string, unknown>;
  pivot?: {
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    status: string;
  };
  users?: User[];
  subscription?: Subscription;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: number;
  workspace_id: number;
  user_id: number;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: string;
  user?: User;
  created_at: string;
}

export interface SocialAccount {
  id: number;
  workspace_id: number;
  platform: 'linkedin' | 'facebook' | 'meta' | 'instagram' | 'x' | 'twitter' | 'tiktok' | 'youtube';
  platform_account_id: string;

  name: string;
  username?: string | null;
  account_type: string;
  avatar_url?: string | null;
  connection_status: 'connected' | 'expired' | 'disconnected';
  created_at: string;
}

export interface PostVariant {
  id: number;
  post_id: number;
  social_account_id?: number | null;
  platform: string;
  content: string;
  hashtags?: string[];
  metadata?: Record<string, unknown>;
  status: string;
  scheduled_at?: string | null;
  published_at?: string | null;
}

export interface PostTarget {
  id: number;
  post_id: number;
  social_account_id: number;
  status: string;
  social_account?: SocialAccount;
}

export interface Media {
  id: number;
  workspace_id: number;
  user_id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  path: string;
  url: string;
  processing_status: 'pending' | 'processing' | 'ready' | 'failed';
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Post {
  id: number;
  workspace_id: number;
  user_id: number;
  title?: string | null;
  content: string;
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'partially_failed' | 'failed' | 'cancelled';
  scheduled_at?: string | null;
  published_at?: string | null;
  settings?: Record<string, unknown>;
  user?: User;
  variants?: PostVariant[];
  targets?: PostTarget[];
  media?: Media[];
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  price_monthly: number;
  price_yearly: number;
  features?: Record<string, unknown>;
  limits?: {
    social_accounts?: number;
    posts_published?: number;
    ai_generations?: number;
  };
  status: string;
}

export interface Subscription {
  id: number;
  workspace_id: number;
  subscription_plan_id: number;
  status: string;
  trial_ends_at?: string | null;
  ends_at?: string | null;
  plan?: SubscriptionPlan;
}

export interface UsageSummary {
  period: string;
  ai_generations: number;
  posts_created: number;
  posts_published: number;
  social_accounts: number;
  storage_bytes: number;
}

export interface AnalyticsSummary {
  period_days: number;
  totals: {
    impressions: number;
    reach: number;
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    followers: number;
  };
  platforms: Array<{
    platform: string;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
  }>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
