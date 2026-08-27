import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  CreditCard,
  FolderOpen,
  LayoutDashboard,
  Send,
  Settings,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const sections = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Publishing',
      items: [
        { label: 'Posts', path: '/dashboard/posts', icon: Send },
        { label: 'Calendar', path: '/dashboard/calendar', icon: Calendar },
      ],
    },
    {
      title: 'Content',
      items: [
        { label: 'AI Assistant', path: '/dashboard/ai', icon: Sparkles },
        { label: 'Media Library', path: '/dashboard/media', icon: FolderOpen },
      ],
    },
    {
      title: 'Social',
      items: [
        { label: 'Social Accounts', path: '/dashboard/social-accounts', icon: Share2 },
      ],
    },
    {
      title: 'Insights',
      items: [
        { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'Workspace',
      items: [
        { label: 'Team', path: '/dashboard/team', icon: Users },
        { label: 'Settings', path: '/dashboard/settings', icon: Settings },
        { label: 'Billing', path: '/dashboard/billing', icon: CreditCard },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/80 flex flex-col h-full overflow-y-auto">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
          <Share2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">Social W3Lead</h1>
          <p className="text-[10px] font-medium text-indigo-400 uppercase tracking-widest">SaaS Dashboard</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-3 space-y-6">
        {sections.map((sec, idx) => (
          <div key={idx}>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {sec.title}
            </div>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/dashboard'}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/25 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};
