import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { workspacesApi } from '../api/workspaces';
import { Workspace } from '../types';
import { useAuth } from './AuthContext';

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  loadingWorkspaces: boolean;
  switchWorkspace: (workspaceId: number) => void;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState<boolean>(true);

  const fetchWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setLoadingWorkspaces(false);
      return;
    }

    try {
      const response = await workspacesApi.list();
      if (response.success && response.data) {
        setWorkspaces(response.data);

        const storedId = localStorage.getItem('active_workspace_id');
        let current = response.data.find((w) => w.id.toString() === storedId);

        if (!current && response.data.length > 0) {
          current = response.data[0];
        }

        if (current) {
          setActiveWorkspace(current);
          localStorage.setItem('active_workspace_id', current.id.toString());
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  const switchWorkspace = (workspaceId: number) => {
    const target = workspaces.find((w) => w.id === workspaceId);
    if (target) {
      setActiveWorkspace(target);
      localStorage.setItem('active_workspace_id', target.id.toString());
      // Invalidate all TanStack Query caches to force data refetching for the new workspace!
      queryClient.invalidateQueries();
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        loadingWorkspaces,
        switchWorkspace,
        refreshWorkspaces: fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
