import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../api/analytics';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { BarChart3, Eye, Heart, MessageSquare, Share2, MousePointer, Users, TrendingUp } from 'lucide-react';

export const AnalyticsOverview: React.FC = () => {
  const { activeWorkspace } = useWorkspace();
  const [days, setDays] = useState<number>(30);

  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ['analytics', activeWorkspace?.id, days],
    queryFn: () => analyticsApi.getSummary(days),
    enabled: !!activeWorkspace,
  });

  const totals = analyticsRes?.data?.totals;
  const platforms = analyticsRes?.data?.platforms || [];

  const cards = [
    { title: 'Impressions', value: totals?.impressions || 0, icon: Eye, color: 'text-indigo-400' },
    { title: 'Reach', value: totals?.reach || 0, icon: TrendingUp, color: 'text-sky-400' },
    { title: 'Likes', value: totals?.likes || 0, icon: Heart, color: 'text-rose-400' },
    { title: 'Comments', value: totals?.comments || 0, icon: MessageSquare, color: 'text-amber-400' },
    { title: 'Shares', value: totals?.shares || 0, icon: Share2, color: 'text-purple-400' },
    { title: 'Link Clicks', value: totals?.clicks || 0, icon: MousePointer, color: 'text-emerald-400' },
    { title: 'Followers', value: totals?.followers || 0, icon: Users, color: 'text-teal-400' },
  ];

  const hasData = totals && Object.values(totals).some((v) => v > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Analytics & Insights</h2>
          <p className="text-xs text-slate-400">Track cross-channel performance and audience engagement</p>
        </div>
        <div className="w-44">
          <Select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            options={[
              { value: 7, label: 'Last 7 Days' },
              { value: 30, label: 'Last 30 Days' },
              { value: 90, label: 'Last 90 Days' },
            ]}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card key={i} hoverEffect>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">{c.title}</span>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-2xl font-bold text-white">{c.value.toLocaleString()}</p>
              )}
            </Card>
          );
        })}
      </div>

      {/* Platform Breakdown */}
      <Card className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Platform Breakdown</h3>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !hasData && platforms.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="w-6 h-6" />}
            title="No analytics data available yet"
            description="Analytics will appear automatically after your scheduled posts are published to social networks."
          />
        ) : (
          <div className="divide-y divide-slate-800">
            {platforms.map((p, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-white uppercase">{p.platform}</span>
                <div className="flex items-center gap-4 text-slate-400">
                  <span>{p.impressions} Impressions</span>
                  <span>{p.likes} Likes</span>
                  <span>{p.shares} Shares</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
