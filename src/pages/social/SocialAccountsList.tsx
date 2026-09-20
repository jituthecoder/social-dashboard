import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialAccountsApi } from '../../api/socialAccounts';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Link2, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { SocialPlatformIcon, getPlatformBrandColor } from '../../components/shared/SocialPlatformIcon';

export const SocialAccountsList: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();

  const { data: accountsRes, isLoading } = useQuery({
    queryKey: ['socialAccounts', activeWorkspace?.id],
    queryFn: () => socialAccountsApi.list(),
    enabled: !!activeWorkspace,
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: number) => socialAccountsApi.disconnect(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialAccounts'] });
    },
  });

  const connectMutation = useMutation({
    mutationFn: (platform: string) => socialAccountsApi.initiateConnect(platform),
    onSuccess: (res) => {
      if (res.success && res.data?.redirect_url) {
        window.location.href = res.data.redirect_url;
      }
    },
  });

  const accounts = accountsRes?.data || [];

  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-[#0A66C2]' },
    { id: 'facebook', name: 'Facebook Page', color: 'bg-[#1877F2]' },
    { id: 'instagram', name: 'Instagram Business', color: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]' },
    { id: 'twitter', name: 'X (Twitter)', color: 'bg-black border border-slate-700' },
    { id: 'youtube', name: 'YouTube', color: 'bg-[#FF0000]' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Social Accounts</h2>
        <p className="text-xs text-slate-400">
          Connect your social channels to schedule and publish content automatically
        </p>
      </div>

      {/* Available Connections Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {platforms.map((p) => {
          const isConnected = accounts.some(
            (a) =>
              (a.platform === p.id ||
                ((p.id === 'twitter' || p.id === 'x') && (a.platform === 'twitter' || a.platform === 'x')) ||
                (p.id === 'facebook' && a.platform === 'meta')) &&
              a.connection_status === 'connected'
          );

          return (
            <Card key={p.id} hoverEffect className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl ${p.color} flex items-center justify-center text-white shadow-md`}>
                  <SocialPlatformIcon platform={p.id} className="w-5 h-5" />
                </div>
                {isConnected ? (
                  <Badge variant="success">Connected</Badge>
                ) : (
                  <Badge variant="default">Not Connected</Badge>
                )}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">{p.name}</h4>
                <p className="text-[11px] text-slate-400">OAuth API Integration</p>
              </div>
              <Button
                variant={isConnected ? 'outline' : 'primary'}
                size="sm"
                className="w-full"
                leftIcon={<Link2 className="w-3.5 h-3.5" />}
                isLoading={connectMutation.isPending && connectMutation.variables === p.id}
                onClick={() => connectMutation.mutate(p.id)}
              >
                {isConnected ? 'Reconnect' : 'Connect Account'}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Connected Accounts Table */}
      <Card className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Connected Accounts ({accounts.length})</h3>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : accounts.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-white">No accounts connected yet</p>
            <p className="text-[11px] text-slate-400">
              Click "Connect Account" above to authorize your social channels.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {accounts.map((acc) => {
              const brand = getPlatformBrandColor(acc.platform);

              return (
                <div key={acc.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${brand.bg} flex items-center justify-center text-white shadow-sm shrink-0`}>
                      <SocialPlatformIcon platform={acc.platform} className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{acc.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        @{acc.username || acc.platform_account_id} • {acc.account_type}
                      </p>
                    </div>
                  </div>


                <div className="flex items-center gap-3">
                  <Badge variant={acc.connection_status === 'connected' ? 'success' : 'error'}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {acc.connection_status}
                  </Badge>

                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    isLoading={disconnectMutation.isPending && disconnectMutation.variables === acc.id}
                    onClick={() => disconnectMutation.mutate(acc.id)}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </Card>
    </div>
  );
};
