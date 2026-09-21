import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Calendar, Clock, Plus, Trash2, Edit3, Search, Rocket, ExternalLink } from 'lucide-react';
import { SocialPlatformBadge } from '../../components/shared/SocialPlatformIcon';


const getLiveUrl = (v: any) => {
  if (v?.metadata?.external_url) return v.metadata.external_url;
  if (v?.platform === 'linkedin' && v?.metadata?.external_id) {
    return `https://www.linkedin.com/feed/update/${v.metadata.external_id}/`;
  }
  if (v?.platform === 'youtube' && v?.metadata?.external_id) {
    return `https://www.youtube.com/watch?v=${v.metadata.external_id}`;
  }
  if ((v?.platform === 'facebook' || v?.platform === 'meta') && v?.metadata?.external_id) {
    return `https://facebook.com/${v.metadata.external_id}`;
  }
  if (v?.platform === 'instagram' && v?.metadata?.shortcode) {
    return `https://instagram.com/p/${v.metadata.shortcode}/`;
  }
  if ((v?.platform === 'twitter' || v?.platform === 'x') && v?.metadata?.external_id) {
    return `https://x.com/i/status/${v.metadata.external_id}`;
  }
  return null;
};


export const PostsList: React.FC = () => {
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [platformFilter, setPlatformFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [publishingId, setPublishingId] = useState<number | null>(null);

  const { data: postsRes, isLoading } = useQuery({
    queryKey: ['posts', activeWorkspace?.id, statusFilter, platformFilter, page],
    queryFn: () =>
      postsApi.list({
        status: statusFilter || undefined,
        platform: platformFilter || undefined,
        page,
      }),
    enabled: !!activeWorkspace,
    refetchInterval: (query) => {
      const list = query.state.data?.data?.data || [];
      const isAnyPublishing = list.some((p: any) => p.status === 'publishing');
      return isAnyPublishing ? 3000 : false;
    },
  });

  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [deletingTargetId, setDeletingTargetId] = useState<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      setDeletingPostId(id);
      return postsApi.delete(id);
    },
    onSettled: () => {
      setDeletingPostId(null);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const deleteTargetMutation = useMutation({
    mutationFn: async ({ postId, targetId }: { postId: number; targetId: number }) => {
      setDeletingTargetId(targetId);
      return postsApi.deleteTarget(postId, targetId);
    },
    onSettled: () => {
      setDeletingTargetId(null);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleDeletePlatform = (postId: number, targetId: number, platform: string) => {
    const isConfirm = window.confirm(
      `Are you sure you want to delete this post from ${platform.toUpperCase()} only?\n\nIt will remain published and live on your other platforms.`
    );
    if (isConfirm) {
      deleteTargetMutation.mutate({ postId, targetId });
    }
  };

  const publishMutation = useMutation({
    mutationFn: async (id: number) => {
      setPublishingId(id);
      return postsApi.publish(id);
    },
    onSettled: () => {
      setPublishingId(null);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const paginatedData = postsRes?.data;
  const rawPosts = paginatedData?.data || [];

  const posts = rawPosts.filter(
    (p) =>
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Posts & Publishing</h2>
          <p className="text-xs text-slate-400">Manage drafts, scheduled posts, and publishing history</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/dashboard/posts/create')}
        >
          Create New Post
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search posts..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-40">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'draft', label: 'Draft' },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'publishing', label: 'Publishing' },
                { value: 'published', label: 'Published' },
                { value: 'failed', label: 'Failed' },
              ]}
            />
          </div>

          <div className="w-full md:w-40">
            <Select
              value={platformFilter}
              onChange={(e) => {
                setPlatformFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Platforms' },
                { value: 'linkedin', label: 'LinkedIn' },
                { value: 'meta', label: 'Facebook / Meta' },
                { value: 'instagram', label: 'Instagram' },
                { value: 'x', label: 'X (Twitter)' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Posts List / Skeleton / Empty State */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-6 h-6" />}
          title="No posts found"
          description="Create your first post or adjust your search filters."
          actionLabel="Create Post"
          onAction={() => navigate('/dashboard/posts/create')}
        />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} hoverEffect className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={
                      post.status === 'published'
                        ? 'success'
                        : post.status === 'scheduled'
                        ? 'info'
                        : post.status === 'failed'
                        ? 'error'
                        : 'default'
                    }
                  >
                    {post.status}
                  </Badge>

                  {post.variants && post.variants.map((v) => {
                    const liveUrl = getLiveUrl(v);
                    const target = post.targets?.find(
                      (t) =>
                        t.social_account_id === v.social_account_id ||
                        (t.social_account && t.social_account.platform === v.platform)
                    );
                    const isTargetDeleting = target && deletingTargetId === target.id;

                    return (
                      <div
                        key={v.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-850 border border-slate-700/60 text-xs transition-all duration-200 ease-out hover:border-slate-500/70 hover:scale-[1.02] hover:shadow-sm"
                      >
                        <SocialPlatformBadge platform={v.platform} size="xs" />
                        {liveUrl && (
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 hover:text-sky-300 hover:shadow-xs active:scale-95 transition-all duration-150"
                            title={`View live on ${v.platform}`}
                          >
                            View Live <ExternalLink className="w-2.5 h-2.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </a>
                        )}
                        {target && (
                          <button
                            type="button"
                            onClick={() => handleDeletePlatform(post.id, target.id, v.platform)}
                            disabled={isTargetDeleting}
                            className="group p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 active:scale-90 transition-all duration-150 ml-0.5 cursor-pointer"
                            title={`Delete only from ${v.platform}`}
                          >
                            {isTargetDeleting ? (
                              <span className="w-2.5 h-2.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin inline-block" />
                            ) : (
                              <Trash2 className="w-2.5 h-2.5 transition-transform duration-150 group-hover:scale-110 group-hover:rotate-6" />
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {(!post.variants || post.variants.length === 0) && post.targets && post.targets.map((t) => {
                    if (!t.social_account) return null;
                    const isTargetDeleting = deletingTargetId === t.id;
                    return (
                      <div
                        key={t.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-850 border border-slate-700/60 text-xs transition-all duration-200 ease-out hover:border-slate-500/70 hover:scale-[1.02] hover:shadow-sm"
                      >
                        <SocialPlatformBadge platform={t.social_account.platform} size="xs" />
                        <button
                          type="button"
                          onClick={() => handleDeletePlatform(post.id, t.id, t.social_account!.platform)}
                          disabled={isTargetDeleting}
                          className="group p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 active:scale-90 transition-all duration-150 ml-0.5 cursor-pointer"
                          title={`Delete only from ${t.social_account.platform}`}
                        >
                          {isTargetDeleting ? (
                            <span className="w-2.5 h-2.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin inline-block" />
                          ) : (
                            <Trash2 className="w-2.5 h-2.5 transition-transform duration-150 group-hover:scale-110 group-hover:rotate-6" />
                          )}
                        </button>
                      </div>
                    );
                  })}

                  {post.scheduled_at && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      Scheduled: {new Date(post.scheduled_at).toLocaleString()}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-white truncate">
                  {post.title || 'Untitled Post'}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">{post.content}</p>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                {post.status !== 'published' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    leftIcon={<Rocket className="w-3.5 h-3.5" />}
                    onClick={() => publishMutation.mutate(post.id)}
                    isLoading={publishingId === post.id}
                  >
                    Publish Now
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  onClick={() => navigate(`/dashboard/posts/${post.id}`)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this post from the database and all connected platforms?')) {
                      deleteMutation.mutate(post.id);
                    }
                  }}
                  isLoading={deletingPostId === post.id}
                  disabled={deletingPostId !== null}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {paginatedData && paginatedData.last_page > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Page {paginatedData.current_page} of {paginatedData.last_page} ({paginatedData.total} posts)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= paginatedData.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
