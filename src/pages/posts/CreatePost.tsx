import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import { socialAccountsApi } from '../../api/socialAccounts';
import { aiApi } from '../../api/ai';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Calendar, Check, Send, Sparkles } from 'lucide-react';

export const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);
  const [variantLinkedIn, setVariantLinkedIn] = useState('');
  const [variantX, setVariantX] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

  const { data: accountsRes } = useQuery({
    queryKey: ['socialAccounts', activeWorkspace?.id],
    queryFn: () => socialAccountsApi.list(),
    enabled: !!activeWorkspace,
  });

  const accounts = accountsRes?.data || [];

  const toggleAccount = (id: number) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const aiGenerateMutation = useMutation({
    mutationFn: (prompt: string) => aiApi.generate(prompt),
    onSuccess: (res) => {
      if (res.success && res.data?.content) {
        setContent(res.data.content);
        setAiPrompt('');
      }
    },
  });

  const createPostMutation = useMutation({
    mutationFn: (isScheduled: boolean) => {
      const variants = [];
      if (variantLinkedIn.trim()) {
        variants.push({ platform: 'linkedin', content: variantLinkedIn });
      }
      if (variantX.trim()) {
        variants.push({ platform: 'x', content: variantX });
      }

      return postsApi.create({
        title: title.trim() || undefined,
        content,
        is_scheduled: isScheduled,
        scheduled_at: isScheduled && scheduledAt ? scheduledAt : undefined,
        social_account_ids: selectedAccountIds,
        variants: variants.length > 0 ? variants : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate('/dashboard/posts');
    },
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/dashboard/posts')}
        >
          Back
        </Button>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Create Post</h2>
          <p className="text-xs text-slate-400">Compose and schedule content across platforms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Main Composer */}
        <div className="lg:col-span-2 space-y-5">
          {/* AI Generator Helper Box */}
          <Card className="bg-gradient-to-r from-purple-950/30 via-slate-900 to-indigo-950/30 border-purple-500/20">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-purple-400">
              <Sparkles className="w-4 h-4" />
              <span>AI Content Assistant</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Describe your post topic (e.g. 3 tips for SaaS growth)..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <Button
                variant="primary"
                size="sm"
                className="bg-purple-600 hover:bg-purple-500 shadow-purple-600/20 whitespace-nowrap"
                isLoading={aiGenerateMutation.isPending}
                onClick={() => aiPrompt && aiGenerateMutation.mutate(aiPrompt)}
              >
                Generate
              </Button>
            </div>
          </Card>

          {/* Core Content Editor */}
          <Card className="space-y-4">
            <Input
              label="Post Title (Internal Reference)"
              placeholder="e.g. Q3 Launch Announcement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Original Post Content *
              </label>
              <textarea
                rows={5}
                className="block w-full rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
                placeholder="What would you like to share?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <p className="text-[11px] text-slate-500 text-right">
                {content.length} characters
              </p>
            </div>
          </Card>

          {/* Platform Specific Variations */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Platform Variations (Optional)</h3>
              <Badge variant="purple">Multi-Channel</Badge>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  LinkedIn Specific Version
                </label>
                <textarea
                  rows={3}
                  className="block w-full rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 p-3 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Professional text with industry hashtags..."
                  value={variantLinkedIn}
                  onChange={(e) => setVariantLinkedIn(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  X (Twitter) Short Version
                </label>
                <textarea
                  rows={2}
                  className="block w-full rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 p-3 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Concise 280-character version..."
                  value={variantX}
                  onChange={(e) => setVariantX(e.target.value)}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Channels & Scheduling Settings */}
        <div className="space-y-5">
          {/* Target Social Accounts */}
          <Card className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Target Channels</h3>
            {accounts.length === 0 ? (
              <p className="text-xs text-slate-400">
                No connected channels found.{' '}
                <button
                  onClick={() => navigate('/dashboard/social-accounts')}
                  className="text-indigo-400 underline font-medium"
                >
                  Connect accounts
                </button>
              </p>
            ) : (
              <div className="space-y-2">
                {accounts.map((acc) => {
                  const isSelected = selectedAccountIds.includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => toggleAccount(acc.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-indigo-600/10 border-indigo-500/40 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="capitalize">{acc.platform}</span>
                        <span className="text-slate-500">({acc.name})</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Schedule Setting */}
          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Schedule Publishing</h3>
            <Input
              type="datetime-local"
              label={`Date & Time (${activeWorkspace?.timezone || 'UTC'})`}
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />

            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                className="w-full"
                leftIcon={<Calendar className="w-4 h-4" />}
                disabled={!content.trim() || !scheduledAt}
                isLoading={createPostMutation.isPending}
                onClick={() => createPostMutation.mutate(true)}
              >
                Schedule Post
              </Button>

              <Button
                variant="secondary"
                className="w-full"
                leftIcon={<Send className="w-4 h-4" />}
                disabled={!content.trim()}
                isLoading={createPostMutation.isPending}
                onClick={() => createPostMutation.mutate(false)}
              >
                Save as Draft
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
