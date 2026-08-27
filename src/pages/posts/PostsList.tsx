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
import { Calendar, Clock, Plus, Trash2, Edit3, Search } from 'lucide-react';

export const PostsList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [platformFilter, setPlatformFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const { data: postsRes, isLoading } = useQuery({
    queryKey: ['posts', activeWorkspace?.id, statusFilter, platformFilter, page],
    queryFn: () =>
      postsApi.list({
        status: statusFilter || undefined,
        platform: platformFilter || undefined,
        page,
      }),
    enabled: !!activeWorkspace,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => postsApi.delete(id),
    onSuccess: () => {
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

                  {post.variants && post.variants.map((v) => (
                    <span
                      key={v.id}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {v.platform}
                    </span>
                  ))}

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
                  onClick={() => deleteMutation.mutate(post.id)}
                  isLoading={deleteMutation.isPending}
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
