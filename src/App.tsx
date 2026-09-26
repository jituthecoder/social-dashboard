import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

import { DashboardHome } from './pages/dashboard/DashboardHome';
import { PostsList } from './pages/posts/PostsList';
import { CreatePost } from './pages/posts/CreatePost';
import { CalendarView } from './pages/calendar/CalendarView';
import { SocialAccountsList } from './pages/social/SocialAccountsList';
import { MediaLibrary } from './pages/media/MediaLibrary';
import { AIAssistant } from './pages/ai/AIAssistant';
import { AnalyticsOverview } from './pages/analytics/AnalyticsOverview';
import { TeamManagement } from './pages/team/TeamManagement';
import { ProfileSettings } from './pages/settings/ProfileSettings';
import { SecuritySettings } from './pages/settings/SecuritySettings';
import { BillingOverview } from './pages/billing/BillingOverview';

const ExternalRedirect: React.FC<{ path: string }> = ({ path }) => {
  React.useEffect(() => {
    const marketingUrl = (import.meta.env.VITE_MARKETING_URL || 'https://a4autopost.com').replace(/\/+$/, '');
    window.location.replace(`${marketingUrl}${path}`);
  }, [path]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-xs text-slate-400 font-medium">Redirecting to A4 AutoPost...</p>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect Guest Auth Routes to Official Marketing Website */}
        <Route path="/login" element={<ExternalRedirect path="/login" />} />
        <Route path="/register" element={<ExternalRedirect path="/signup" />} />
        <Route path="/forgot-password" element={<ExternalRedirect path="/login" />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/dashboard/posts" element={<PostsList />} />
            <Route path="/dashboard/posts/create" element={<CreatePost />} />
            <Route path="/dashboard/posts/:id" element={<CreatePost />} />
            <Route path="/dashboard/calendar" element={<CalendarView />} />
            <Route path="/dashboard/social-accounts" element={<SocialAccountsList />} />
            <Route path="/dashboard/media" element={<MediaLibrary />} />
            <Route path="/dashboard/ai" element={<AIAssistant />} />
            <Route path="/dashboard/analytics" element={<AnalyticsOverview />} />
            <Route path="/dashboard/team" element={<TeamManagement />} />
            <Route path="/dashboard/settings" element={<ProfileSettings />} />
            <Route path="/dashboard/settings/profile" element={<ProfileSettings />} />
            <Route path="/dashboard/settings/security" element={<SecuritySettings />} />
            <Route path="/dashboard/billing" element={<BillingOverview />} />
          </Route>
        </Route>

        {/* Redirect Root to Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
