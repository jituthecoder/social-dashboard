import React, { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Building2, Check, ChevronDown, Plus } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { workspacesApi } from '../../api/workspaces';

export const WorkspaceSwitcher: React.FC = () => {
  const { workspaces, activeWorkspace, switchWorkspace, refreshWorkspaces } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    setIsCreating(true);
    try {
      const res = await workspacesApi.create({ name: newWorkspaceName });
      if (res.success && res.data) {
        await refreshWorkspaces();
        switchWorkspace(res.data.id);
        setNewWorkspaceName('');
        setIsModalOpen(false);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors text-left"
        >
          <div className="w-7 h-7 rounded-md bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-[120px] max-w-[180px]">
            <p className="text-xs font-semibold text-white truncate">
              {activeWorkspace ? activeWorkspace.name : 'Select Workspace'}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
              {activeWorkspace?.pivot?.role || 'Workspace'}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        {isOpen && (
          <div
            className="absolute left-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
            onClick={() => setIsOpen(false)}
          >
            <div className="px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Workspaces ({workspaces.length})
            </div>
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => switchWorkspace(ws.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeWorkspace?.id === ws.id
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  {activeWorkspace?.id === ws.id && <Check className="w-4 h-4 text-indigo-400" />}
                </button>
              ))}
            </div>
            <div className="border-t border-slate-800 mt-1.5 pt-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-indigo-400 hover:bg-indigo-600/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create New Workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Creating New Workspace */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Workspace">
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <Input
            label="Workspace Name"
            placeholder="e.g. Acme Marketing Team"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Create Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
