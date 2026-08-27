import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '../../api/ai';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Copy, Sparkles } from 'lucide-react';

export const AIAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'rewrite' | 'hashtags' | 'ideas'>('generate');

  const [prompt, setPrompt] = useState('');
  const [rewriteContent, setRewriteContent] = useState('');
  const [tone, setTone] = useState('professional');
  const [hashtagContent, setHashtagContent] = useState('');
  const [topic, setTopic] = useState('');

  const [resultOutput, setResultOutput] = useState<string | string[]>('');
  const [copied, setCopied] = useState(false);

  const generateMutation = useMutation({
    mutationFn: (p: string) => aiApi.generate(p),
    onSuccess: (res) => {
      if (res.data?.content) setResultOutput(res.data.content);
    },
  });

  const rewriteMutation = useMutation({
    mutationFn: () => aiApi.rewrite(rewriteContent, tone),
    onSuccess: (res) => {
      if (res.data?.content) setResultOutput(res.data.content);
    },
  });

  const hashtagsMutation = useMutation({
    mutationFn: () => aiApi.hashtags(hashtagContent, 8),
    onSuccess: (res) => {
      if (res.data?.hashtags) setResultOutput(res.data.hashtags);
    },
  });

  const ideasMutation = useMutation({
    mutationFn: () => aiApi.ideas(topic, 5),
    onSuccess: (res) => {
      if (res.data?.ideas) setResultOutput(res.data.ideas);
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          AI Content Studio
        </h2>
        <p className="text-xs text-slate-400">
          Generate posts, rewrite captions, create hashtags, and brainstorm content ideas powered by Laravel AI API
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        {[
          { id: 'generate', label: 'Generate Post' },
          { id: 'rewrite', label: 'Rewrite Content' },
          { id: 'hashtags', label: 'Hashtag Generator' },
          { id: 'ideas', label: 'Content Ideas' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as typeof activeTab);
              setResultOutput('');
            }}
            className={`pb-3 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Form Box */}
        <Card className="space-y-4">
          {activeTab === 'generate' && (
            <div className="space-y-4">
              <Input
                label="Prompt / Topic Description"
                placeholder="e.g. Write a 2-sentence post introducing our new analytics feature for SaaS teams."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button
                variant="primary"
                className="w-full bg-purple-600 hover:bg-purple-500 shadow-purple-600/20"
                isLoading={generateMutation.isPending}
                disabled={!prompt.trim()}
                onClick={() => generateMutation.mutate(prompt)}
              >
                Generate Post Draft
              </Button>
            </div>
          )}

          {activeTab === 'rewrite' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">Existing Content</label>
                <textarea
                  rows={4}
                  className="block w-full rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 p-3 focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Paste existing text to rewrite..."
                  value={rewriteContent}
                  onChange={(e) => setRewriteContent(e.target.value)}
                />
              </div>

              <Select
                label="Select Target Tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                options={[
                  { value: 'professional', label: 'Professional' },
                  { value: 'casual', label: 'Casual & Friendly' },
                  { value: 'witty', label: 'Witty & Engaging' },
                  { value: 'inspiring', label: 'Inspiring & Motivational' },
                ]}
              />

              <Button
                variant="primary"
                className="w-full bg-purple-600 hover:bg-purple-500"
                isLoading={rewriteMutation.isPending}
                disabled={!rewriteContent.trim()}
                onClick={() => rewriteMutation.mutate()}
              >
                Rewrite Content
              </Button>
            </div>
          )}

          {activeTab === 'hashtags' && (
            <div className="space-y-4">
              <Input
                label="Post Text or Keyword"
                placeholder="e.g. AI Social Media Automation"
                value={hashtagContent}
                onChange={(e) => setHashtagContent(e.target.value)}
              />
              <Button
                variant="primary"
                className="w-full bg-purple-600 hover:bg-purple-500"
                isLoading={hashtagsMutation.isPending}
                disabled={!hashtagContent.trim()}
                onClick={() => hashtagsMutation.mutate()}
              >
                Generate Hashtags
              </Button>
            </div>
          )}

          {activeTab === 'ideas' && (
            <div className="space-y-4">
              <Input
                label="Niche or Industry Topic"
                placeholder="e.g. Remote Work, B2B SaaS, E-commerce"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <Button
                variant="primary"
                className="w-full bg-purple-600 hover:bg-purple-500"
                isLoading={ideasMutation.isPending}
                disabled={!topic.trim()}
                onClick={() => ideasMutation.mutate()}
              >
                Generate Content Ideas
              </Button>
            </div>
          )}
        </Card>

        {/* Right Output Box */}
        <Card className="space-y-4 bg-slate-900/90 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Generated Result</h3>
              {resultOutput && typeof resultOutput === 'string' && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                  onClick={() => copyToClipboard(resultOutput)}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              )}
            </div>

            {!resultOutput ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                Fill in the form and click generate to see AI output.
              </div>
            ) : Array.isArray(resultOutput) ? (
              <div className="space-y-2">
                {resultOutput.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-200 flex items-center justify-between"
                  >
                    <span>{item}</span>
                    <button
                      onClick={() => copyToClipboard(item)}
                      className="text-indigo-400 hover:text-white text-[11px] font-medium"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {resultOutput}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Powered by Laravel AI Engine</span>
            <Badge variant="purple">Quota Tracked</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};
