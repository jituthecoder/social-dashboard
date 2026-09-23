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
import { SocialPlatformIcon } from '../shared/SocialPlatformIcon';

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
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-start">
        <img
          src="/logo.png"
          alt="A4 AutoPost"
          className="h-9 w-auto max-w-full object-contain"
        />
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

      {/* Official Brand Social Links */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="px-1 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Official Socials</span>
          <span className="text-[9px] text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Follow Us
          </span>
        </div>
        <div className="flex items-center justify-between gap-1">
          <a
            href="https://www.instagram.com/a4autopost/"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow A4 AutoPost on Instagram"
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-pink-400 hover:border-pink-500/40 hover:bg-pink-500/10 transition-all duration-200"
          >
            <SocialPlatformIcon platform="instagram" className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61594349112657"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow A4 AutoPost on Facebook"
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all duration-200"
          >
            <SocialPlatformIcon platform="facebook" className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://www.linkedin.com/company/145224167/"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow A4 AutoPost on LinkedIn"
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-sky-400 hover:border-sky-500/40 hover:bg-sky-500/10 transition-all duration-200"
          >
            <SocialPlatformIcon platform="linkedin" className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://x.com/a4autopost"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow @a4autopost on X (Twitter)"
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800 transition-all duration-200"
          >
            <SocialPlatformIcon platform="x" className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </aside>
  );
};
