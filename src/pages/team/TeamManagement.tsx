import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspacesApi } from '../../api/workspaces';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { UserPlus, Shield, Trash2 } from 'lucide-react';

export const TeamManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'owner' | 'admin' | 'editor' | 'viewer'>('editor');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: workspaceRes, isLoading } = useQuery({
    queryKey: ['workspaceDetails', activeWorkspace?.id],
    queryFn: () => workspacesApi.get(activeWorkspace!.id),
    enabled: !!activeWorkspace,
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      workspacesApi.addMember(activeWorkspace!.id, {
        email: inviteEmail,
        role: inviteRole,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaceDetails'] });
      setIsModalOpen(false);
      setInviteEmail('');
      setErrorMsg(null);
    },
    onError: (err: unknown) => {
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        setErrorMsg(res?.data?.message || 'Failed to invite team member.');
      } else {
        setErrorMsg('An unexpected error occurred.');
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: number) => workspacesApi.removeMember(activeWorkspace!.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaceDetails'] });
    },
  });

  const members = workspaceRes?.data?.users || [];
  const currentUserRole = activeWorkspace?.pivot?.role || 'editor';
  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Team Members</h2>
          <p className="text-xs text-slate-400">
            Manage workspace roles and collaborate on social publishing
          </p>
        </div>
        {canManage && (
          <Button
            variant="primary"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Invite Member
          </Button>
        )}
      </div>

      {/* Members List */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Workspace Members ({members.length})
          </h3>
          <Badge variant="purple">Your Role: {currentUserRole}</Badge>
        </div>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="divide-y divide-slate-800">
            {members.map((m) => {
              const role = m.pivot?.role || 'editor';
              return (
                <div key={m.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400 border border-slate-700">
                      {m.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{m.name}</h4>
                      <p className="text-[11px] text-slate-400">{m.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        role === 'owner'
                          ? 'purple'
                          : role === 'admin'
                          ? 'info'
                          : role === 'editor'
                          ? 'success'
                          : 'default'
                      }
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {role}
                    </Badge>

                    {canManage && role !== 'owner' && (
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        isLoading={removeMutation.isPending && removeMutation.variables === m.id}
                        onClick={() => removeMutation.mutate(m.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal to Invite Member */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Invite Team Member">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            inviteMutation.mutate();
          }}
          className="space-y-4"
        >
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
              {errorMsg}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@w3lead.in"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <Select
            label="Workspace Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
            options={[
              { value: 'admin', label: 'Admin (Full Access)' },
              { value: 'editor', label: 'Editor (Create & Edit Posts)' },
              { value: 'viewer', label: 'Viewer (Read Only)' },
            ]}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={inviteMutation.isPending}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
