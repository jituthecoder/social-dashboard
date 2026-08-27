import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './components/shared/AuthLayout';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';

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

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

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
