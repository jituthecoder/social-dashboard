import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  const marketingUrl = (import.meta.env.VITE_MARKETING_URL || 'https://a4autopost.com').replace(/\/+$/, '');

  useEffect(() => {
    if (!loading && !user) {
      window.location.replace(`${marketingUrl}/login`);
    }
  }, [loading, user, marketingUrl]);

  if (loading || !user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-medium">
          {loading ? 'Authenticating A4 AutoPost...' : 'Redirecting to login...'}
        </p>
      </div>
    );
  }

  return <Outlet />;
};
