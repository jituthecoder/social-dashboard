import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, LoginPayload, RegisterPayload } from '../api/auth';
import { User, Workspace } from '../types';

interface AuthContextType {
  user: User | null;
  currentWorkspace: Workspace | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      // Ingest token from URL parameter if passed from marketing website redirect
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      const urlWorkspaceId = urlParams.get('workspace_id');

      if (urlToken) {
        localStorage.setItem('auth_token', urlToken);
        if (urlWorkspaceId) {
          localStorage.setItem('active_workspace_id', urlWorkspaceId);
        }
        // Remove sensitive token query parameters from browser address bar
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await authApi.me();
      if (response.success && response.data.user) {
        setUser(response.data.user);
        if (response.data.current_workspace) {
          setCurrentWorkspace(response.data.current_workspace);
          if (!localStorage.getItem('active_workspace_id')) {
            localStorage.setItem('active_workspace_id', response.data.current_workspace.id.toString());
          }
        }
      }
    } catch {
      setUser(null);
      setCurrentWorkspace(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('active_workspace_id');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const res = await authApi.login(payload);
      if (res.success && res.data) {
        setUser(res.data.user);
        if (res.data.token) {
          localStorage.setItem('auth_token', res.data.token);
        }
        if (res.data.current_workspace) {
          setCurrentWorkspace(res.data.current_workspace);
          localStorage.setItem('active_workspace_id', res.data.current_workspace.id.toString());
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      const res = await authApi.register(payload);
      if (res.success && res.data) {
        setUser(res.data.user);
        if (res.data.token) {
          localStorage.setItem('auth_token', res.data.token);
        }
        if (res.data.current_workspace) {
          setCurrentWorkspace(res.data.current_workspace);
          localStorage.setItem('active_workspace_id', res.data.current_workspace.id.toString());
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      setCurrentWorkspace(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('active_workspace_id');
      const marketingUrl = import.meta.env.VITE_MARKETING_URL || 'https://a4autopost.com';
      window.location.href = `${marketingUrl}/login`;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentWorkspace,
        loading,
        login,
        register,
        logout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
