import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import { socialAccountsApi } from '../../api/socialAccounts';
import { subscriptionsApi } from '../../api/subscriptions';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Send,
  Share2,
  Sparkles,
} from 'lucide-react';
import { SocialPlatformIcon, SocialPlatformBadge, getPlatformBrandColor } from '../../components/shared/SocialPlatformIcon';

export const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();

  const { data: postsRes, isLoading: loadingPosts } = useQuery({
    queryKey: ['posts', activeWorkspace?.id],
    queryFn: () => postsApi.list({ per_page: 5 }),
    enabled: !!activeWorkspace,
  });

  const { data: accountsRes, isLoading: loadingAccounts } = useQuery({
    queryKey: ['socialAccounts', activeWorkspace?.id],
    queryFn: () => socialAccountsApi.list(),
    enabled: !!activeWorkspace,
  });

  const { data: usageRes, isLoading: loadingUsage } = useQuery({
    queryKey: ['usage', activeWorkspace?.id],
    queryFn: () => subscriptionsApi.getUsage(),
    enabled: !!activeWorkspace,
  });

  const posts = postsRes?.data?.data || [];
  const accounts = accountsRes?.data || [];
  const usage = usageRes?.data?.usage;
  const subscription = usageRes?.data?.subscription;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-xs text-slate-400">
            Current workspace:{' '}
            <span className="text-indigo-400 font-semibold">
              {activeWorkspace?.name}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Sparkles className="w-4 h-4 text-purple-400" />}
            onClick={() => navigate('/dashboard/ai')}
          >
            AI Assistant
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/dashboard/posts/create')}
          >
            Create Post
          </Button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Posts Published</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          {loadingUsage ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className="text-2xl font-bold text-white">{usage?.posts_published || 0}</p>
          )}
        </Card>

        <Card hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Posts Created</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          {loadingUsage ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className="text-2xl font-bold text-white">{usage?.posts_created || 0}</p>
          )}
        </Card>

        <Card hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Social Accounts</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          {loadingAccounts ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className="text-2xl font-bold text-white">{accounts.length}</p>
          )}
        </Card>

        <Card hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">AI Generations</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          {loadingUsage ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className="text-2xl font-bold text-white">{usage?.ai_generations || 0}</p>
          )}
        </Card>
      </div>

      {/* Main Grid: Recent Posts & Account Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-400" />
              Recent Posts
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/posts')}>
              View All
            </Button>
          </div>

          {loadingPosts ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-6 h-6" />}
              title="Your calendar is empty"
              description="Create your first social media post to start automated publishing."
              actionLabel="Create First Post"
              onAction={() => navigate('/dashboard/posts/create')}
            />
          ) : (
            <div className="space-y-3">
              {posts.map((post) => {
                const postPlatforms = Array.from(
                  new Set([
                    ...(post.variants?.map((v) => v.platform) || []),
                    ...(post.targets?.map((t) => t.social_account?.platform).filter(Boolean) as string[] || []),
                  ])
                );

                return (
                  <Card key={post.id} className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge
                          variant={
                            post.status === 'published'
                              ? 'success'
                              : post.status === 'scheduled'
                              ? 'info'
                              : 'default'
                          }
                        >
                          {post.status}
                        </Badge>

                        {/* Social Platform Badges */}
                        {postPlatforms.map((platform) => (
                          <SocialPlatformBadge key={platform} platform={platform} size="xs" />
                        ))}

                        {post.scheduled_at && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(post.scheduled_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-200 truncate">
                        {post.title || post.content}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/posts/${post.id}`)}>
                      Details
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Cards: Connected Accounts & Subscription Tier */}
        <div className="space-y-6">
          {/* Social Accounts Status */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Social Accounts</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/social-accounts')}>
                Manage
              </Button>
            </div>
            {loadingAccounts ? (
              <Skeleton className="h-24 w-full" />
            ) : accounts.length === 0 ? (
              <p className="text-xs text-slate-400">No social accounts connected yet.</p>
            ) : (
              <div className="space-y-2.5">
                {accounts.map((acc) => {
                  const brand = getPlatformBrandColor(acc.platform);

                  return (
                    <div key={acc.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${brand.bg} flex items-center justify-center text-white shadow-sm shrink-0`}>
                          <SocialPlatformIcon platform={acc.platform} className="w-3 h-3" />
                        </div>
                        <span className="font-medium text-slate-200 truncate max-w-[140px]">{acc.name}</span>
                      </div>
                      <Badge variant={acc.connection_status === 'connected' ? 'success' : 'error'}>
                        {acc.connection_status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Current Subscription Plan */}
          <Card className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/30 border-indigo-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-indigo-400">Active Plan</span>
              <Badge variant="purple">{subscription?.plan?.name || 'Free Tier'}</Badge>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Upgrade your plan to unlock more connected social channels and higher AI generation limits.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-indigo-400 border-indigo-500/30 hover:bg-indigo-600/10"
              onClick={() => navigate('/dashboard/billing')}
            >
              Upgrade Subscription
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
