import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();

  const { data: postsRes, isLoading } = useQuery({
    queryKey: ['posts', activeWorkspace?.id, 'calendar'],
    queryFn: () => postsApi.list({ status: 'scheduled', per_page: 50 }),
    enabled: !!activeWorkspace,
  });

  const scheduledPosts = postsRes?.data?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Content Calendar</h2>
          <p className="text-xs text-slate-400">
            View scheduled posts in workspace timezone ({activeWorkspace?.timezone || 'UTC'})
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/dashboard/posts/create')}
        >
          Schedule Post
        </Button>
      </div>

      {/* Calendar Grid View */}
      <Card>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">
              Scheduled Posts ({scheduledPosts.length})
            </h3>
          </div>
          <Badge variant="info">{activeWorkspace?.timezone || 'UTC'}</Badge>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-xs animate-pulse">
            Loading scheduled calendar events...
          </div>
        ) : scheduledPosts.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-white mb-1">No scheduled posts</h4>
            <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
              Your content pipeline is empty. Create and schedule your social media posts to populate the calendar.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/posts/create')}
            >
              Schedule First Post
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {scheduledPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/dashboard/posts`)}
                className="p-4 hover:bg-slate-800/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.scheduled_at
                        ? new Date(post.scheduled_at).toLocaleString()
                        : 'Unscheduled'}
                    </span>
                    <Badge variant="info">Scheduled</Badge>
                  </div>
                  <p className="text-xs font-medium text-slate-200 line-clamp-1">
                    {post.title || post.content}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  View Post →
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
