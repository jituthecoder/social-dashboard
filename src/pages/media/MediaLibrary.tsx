import React, { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaApi } from '../../api/media';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { FileImage, Trash2, Upload } from 'lucide-react';

export const MediaLibrary: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();

  const { data: mediaRes, isLoading } = useQuery({
    queryKey: ['media', activeWorkspace?.id],
    queryFn: () => mediaApi.list(),
    enabled: !!activeWorkspace,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => mediaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });

  const mediaItems = mediaRes?.data?.data || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Media Library</h2>
          <p className="text-xs text-slate-400">Upload images and videos stored in AWS S3</p>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            className="hidden"
          />
          <Button
            variant="primary"
            leftIcon={<Upload className="w-4 h-4" />}
            isLoading={uploadMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Media File
          </Button>
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : mediaItems.length === 0 ? (
        <EmptyState
          icon={<FileImage className="w-6 h-6" />}
          title="No media files uploaded"
          description="Upload assets to attach them to your social media posts."
          actionLabel="Upload First File"
          onAction={() => fileInputRef.current?.click()}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mediaItems.map((item) => (
            <Card key={item.id} hoverEffect className="group relative space-y-2 p-3 overflow-hidden">
              <div className="h-32 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center relative">
                {item.mime_type.startsWith('image/') ? (
                  <img src={item.url} alt={item.original_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-xs text-slate-400 font-medium">Video File</div>
                )}
                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-white truncate">{item.original_name}</p>
                <p className="text-[10px] text-slate-400">
                  {formatSize(item.size)} • {item.mime_type.split('/')[1]?.toUpperCase()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
