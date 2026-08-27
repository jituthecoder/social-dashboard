import { apiClient } from './client';
import { ApiResponse, Workspace, WorkspaceMember } from '../types';

export interface CreateWorkspacePayload {
  name: string;
  timezone?: string;
  settings?: Record<string, unknown>;
}

export interface AddMemberPayload {
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
}

export const workspacesApi = {
  list: async () => {
    const response = await apiClient.get<ApiResponse<Workspace[]>>('/workspaces');
    return response.data;
  },

  get: async (id: number) => {
    const response = await apiClient.get<ApiResponse<Workspace>>(`/workspaces/${id}`);
    return response.data;
  },

  create: async (payload: CreateWorkspacePayload) => {
    const response = await apiClient.post<ApiResponse<Workspace>>('/workspaces', payload);
    return response.data;
  },

  update: async (id: number, payload: Partial<CreateWorkspacePayload>) => {
    const response = await apiClient.put<ApiResponse<Workspace>>(`/workspaces/${id}`, payload);
    return response.data;
  },

  addMember: async (workspaceId: number, payload: AddMemberPayload) => {
    const response = await apiClient.post<ApiResponse<WorkspaceMember>>(`/workspaces/${workspaceId}/members`, payload);
    return response.data;
  },

  removeMember: async (workspaceId: number, userId: number) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/workspaces/${workspaceId}/members/${userId}`);
    return response.data;
  },
};
