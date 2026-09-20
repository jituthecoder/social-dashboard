import React, { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import { socialAccountsApi } from '../../api/socialAccounts';
import { mediaApi } from '../../api/media';
import { aiApi } from '../../api/ai';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  ArrowLeft,
  Calendar,
  Check,
  Send,
  Sparkles,
  Rocket,
  Upload,
  Film,
  X,
  Youtube,
  Linkedin,
  AlertCircle
} from 'lucide-react';
import { SocialPlatformIcon, getPlatformBrandColor } from '../../components/shared/SocialPlatformIcon';

interface UploadedMediaItem {
  id: number;
  url: string;
  mime_type: string;
  original_name: string;
  size: number;
}

export const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);
  const [variantLinkedIn, setVariantLinkedIn] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

  // Media upload state
  const [mediaItems, setMediaItems] = useState<UploadedMediaItem[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // YouTube Specific Settings
  const [youtubeTitle, setYoutubeTitle] = useState('');
  const [youtubeCategory, setYoutubeCategory] = useState('28'); // Science & Tech default
  const [youtubePrivacy, setYoutubePrivacy] = useState<'public' | 'unlisted' | 'private'>('public');
  const [youtubeMadeForKids, setYoutubeMadeForKids] = useState(false);

  // Feedback banner
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: accountsRes } = useQuery({
    queryKey: ['socialAccounts', activeWorkspace?.id],
    queryFn: () => socialAccountsApi.list(),
    enabled: !!activeWorkspace,
  });

  const accounts = accountsRes?.data || [];
  const selectedAccounts = accounts.filter((a) => selectedAccountIds.includes(a.id));
  const isYouTubeSelected = selectedAccounts.some((a) => a.platform === 'youtube');
  const isLinkedInSelected = selectedAccounts.some((a) => a.platform === 'linkedin');
  const isFacebookSelected = selectedAccounts.some((a) => a.platform === 'facebook' || a.platform === 'meta');
  const isInstagramSelected = selectedAccounts.some((a) => a.platform === 'instagram');

  const hasVideoAttached = mediaItems.some((m) => m.mime_type.startsWith('video/'));


  const toggleAccount = (id: number) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    setMediaError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await mediaApi.upload(file);
        if (res.success && res.data) {
          setMediaItems((prev) => [...prev, {
            id: res.data.id,
            url: res.data.url,
            mime_type: res.data.mime_type,
            original_name: res.data.original_name,
            size: res.data.size,
          }]);
        }
      }
    } catch (err: any) {
      setMediaError(err?.response?.data?.message || 'Failed to upload media.');
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeMedia = (id: number) => {
    setMediaItems((prev) => prev.filter((m) => m.id !== id));
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
    mutationFn: async (action: 'publish_now' | 'schedule' | 'draft') => {
      // Validate YouTube requirement:
      if (isYouTubeSelected && !hasVideoAttached) {
        throw new Error('YouTube publishing requires an attached video file (.mp4, .mov).');
      }

      const variants: any[] = [];

      if (isLinkedInSelected && variantLinkedIn.trim()) {
        variants.push({
          platform: 'linkedin',
          content: variantLinkedIn,
        });
      }

      if (isYouTubeSelected) {
        variants.push({
          platform: 'youtube',
          content: content,
          metadata: {
            title: youtubeTitle.trim() || title.trim() || 'Untitled Video',
            category_id: youtubeCategory,
            privacy_status: youtubePrivacy,
            made_for_kids: youtubeMadeForKids,
          },
        });
      }

      const payload: any = {
        title: title.trim() || undefined,
        content,
        is_scheduled: action === 'schedule',
        scheduled_at: action === 'schedule' && scheduledAt ? scheduledAt : undefined,
        publish_now: action === 'publish_now',
        social_account_ids: selectedAccountIds,
        variants: variants.length > 0 ? variants : undefined,
        media_ids: mediaItems.map((m) => m.id),
      };

      return postsApi.create(payload);
    },
    onSuccess: (_res, action) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      if (action === 'publish_now') {
        setActionFeedback({
          type: 'success',
          message: 'Post published successfully across selected channels!',
        });
        setTimeout(() => navigate('/dashboard/posts'), 1800);
      } else {
        navigate('/dashboard/posts');
      }
    },
    onError: (err: any) => {
      setActionFeedback({
        type: 'error',
        message: err.message || err?.response?.data?.message || 'Failed to process post.',
      });
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
          <h2 className="text-xl font-bold text-white tracking-tight">Create & Publish Post</h2>
          <p className="text-xs text-slate-400">Compose, attach media, and broadcast instantly or schedule</p>
        </div>
      </div>

      {actionFeedback && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
          }`}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{actionFeedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Composer & Media */}
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
              label="Post Title (Internal Reference / YouTube Default Title)"
              placeholder="e.g. Q3 Launch Announcement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Post Content / Caption *
              </label>
              <textarea
                rows={5}
                className="block w-full rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
                placeholder="What would you like to share? Write your text, tags, and announcement..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Supports multiple lines, links, and hashtags (#saas, #tech)</span>
                <span>{content.length} characters</span>
              </div>

              {isInstagramSelected && mediaItems.length === 0 && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Instagram requires at least one image or video attachment to publish.</span>
                </div>
              )}

              {isInstagramSelected && content.length > 2200 && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Instagram caption exceeds the maximum 2,200 character limit.</span>
                </div>
              )}

              {isLinkedInSelected && content.length > 3000 && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>LinkedIn post exceeds the maximum 3,000 character limit.</span>
                </div>
              )}

              {isFacebookSelected && content.length > 63000 && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Facebook post exceeds character limit.</span>
                </div>
              )}
            </div>
          </Card>



          {/* Media Uploader Box */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>Media Attachments</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Upload images (JPG, PNG, WebP) or video (MP4, MOV)
                </p>
              </div>
              <Badge variant="info">
                {mediaItems.length} {mediaItems.length === 1 ? 'file' : 'files'}
              </Badge>
            </div>

            {/* Drop / Select Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900/80"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.jpg,.jpeg,.png,.webp,.gif,.jfif,.avif,.heic,.mp4,.mov,.avi,.webm,.mkv"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-400">
                  {isUploadingMedia ? (
                    <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    {isUploadingMedia ? 'Uploading media...' : 'Click to select or drop images/video'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    LinkedIn & Facebook: Images & Videos | Instagram: Photos, Carousel & Reels | YouTube: Videos
                  </p>

                </div>
              </div>
            </div>

            {mediaError && (
              <p className="text-xs text-rose-400 font-medium">{mediaError}</p>
            )}

            {/* Uploaded Media Thumbnails */}
            {mediaItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {mediaItems.map((item) => {
                  const isVideo = item.mime_type.startsWith('video/');
                  return (
                    <div
                      key={item.id}
                      className="relative group rounded-lg overflow-hidden border border-slate-800 bg-slate-900 aspect-square flex flex-col items-center justify-center"
                    >
                      {isVideo ? (
                        <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                          <Film className="w-8 h-8 text-indigo-400" />
                          <span className="text-[10px] text-slate-300 font-medium truncate max-w-[90px]">
                            {item.original_name}
                          </span>
                          <span className="text-[9px] text-slate-500">
                            {(item.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.original_name}
                          className="w-full h-full object-cover"
                        />
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMedia(item.id);
                        }}
                        className="absolute top-1 right-1 p-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-full opacity-90 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* YouTube Specific Settings (Shown if YouTube is selected) */}
          {isYouTubeSelected && (
            <Card className="space-y-4 border-red-500/30 bg-gradient-to-r from-red-950/20 via-slate-900 to-slate-900">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-semibold text-white">YouTube Video Configuration</h3>
                <Badge variant="error">Required for YouTube</Badge>
              </div>

              {!hasVideoAttached && (
                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Please attach a video file (.mp4) in the media section above for YouTube.</span>
                </div>
              )}

              <div className="space-y-3">
                <Input
                  label="Video Title (Max 100 characters)"
                  placeholder="Defaults to post title if left empty"
                  value={youtubeTitle}
                  maxLength={100}
                  onChange={(e) => setYoutubeTitle(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Video Category
                    </label>
                    <select
                      value={youtubeCategory}
                      onChange={(e) => setYoutubeCategory(e.target.value)}
                      className="block w-full rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2.5 focus:outline-none focus:border-red-500"
                    >
                      <option value="28">Science & Technology</option>
                      <option value="22">People & Blogs</option>
                      <option value="27">Education</option>
                      <option value="24">Entertainment</option>
                      <option value="20">Gaming</option>
                      <option value="26">Howto & Style</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Visibility (Privacy)
                    </label>
                    <select
                      value={youtubePrivacy}
                      onChange={(e) => setYoutubePrivacy(e.target.value as any)}
                      className="block w-full rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2.5 focus:outline-none focus:border-red-500"
                    >
                      <option value="public">Public (Visible to everyone)</option>
                      <option value="unlisted">Unlisted (Anyone with link)</option>
                      <option value="private">Private (Only you)</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={youtubeMadeForKids}
                    onChange={(e) => setYoutubeMadeForKids(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-800 text-red-500 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300">Yes, it's made for kids (COPPA compliance)</span>
                </label>
              </div>
            </Card>
          )}

          {/* LinkedIn Specific Custom Variation */}
          {isLinkedInSelected && (
            <Card className="space-y-4 border-blue-500/20 bg-gradient-to-r from-blue-950/20 via-slate-900 to-slate-900">
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">LinkedIn Custom Caption (Optional)</h3>
              </div>
              <textarea
                rows={3}
                className="block w-full rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 p-3 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                placeholder="Leave blank to use the main content above, or write professional LinkedIn-specific text..."
                value={variantLinkedIn}
                onChange={(e) => setVariantLinkedIn(e.target.value)}
              />
            </Card>
          )}
        </div>

        {/* Right Column: Channels & Publishing Actions */}
        <div className="space-y-5">
          {/* Target Social Accounts */}
          <Card className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Select Target Channels</h3>
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
                  const isYt = acc.platform === 'youtube';

                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => toggleAccount(acc.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border text-xs font-medium transition-colors ${
                        isSelected
                          ? isYt
                            ? 'bg-red-600/10 border-red-500/50 text-white'
                            : 'bg-indigo-600/10 border-indigo-500/50 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-md ${getPlatformBrandColor(acc.platform).bg} flex items-center justify-center text-white shadow-sm shrink-0`}>
                          <SocialPlatformIcon platform={acc.platform} className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left">
                          <p className="capitalize font-semibold text-slate-200">{acc.platform}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{acc.name}</p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Instant & Scheduled Publishing */}
          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Publishing Actions</h3>

            {/* 1. Instant Publish Button */}
            <Button
              variant="primary"
              className="w-full bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 text-white font-semibold py-2.5"
              leftIcon={<Rocket className="w-4 h-4" />}
              disabled={!content.trim() || selectedAccountIds.length === 0 || (isYouTubeSelected && !hasVideoAttached)}
              isLoading={createPostMutation.isPending}
              onClick={() => createPostMutation.mutate('publish_now')}
            >
              Publish Now 🚀
            </Button>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-2 text-[10px] text-slate-500 uppercase tracking-wider absolute">
                or schedule
              </span>
            </div>

            {/* 2. Schedule Setting */}
            <Input
              type="datetime-local"
              label={`Schedule for (${activeWorkspace?.timezone || 'UTC'})`}
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />

            <div className="space-y-2 pt-1">
              <Button
                variant="secondary"
                className="w-full"
                leftIcon={<Calendar className="w-4 h-4" />}
                disabled={!content.trim() || !scheduledAt || selectedAccountIds.length === 0}
                isLoading={createPostMutation.isPending}
                onClick={() => createPostMutation.mutate('schedule')}
              >
                Schedule Post
              </Button>

              <Button
                variant="outline"
                className="w-full text-slate-400 hover:text-white"
                leftIcon={<Send className="w-3.5 h-3.5" />}
                disabled={!content.trim()}
                isLoading={createPostMutation.isPending}
                onClick={() => createPostMutation.mutate('draft')}
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
