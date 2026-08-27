import React from 'react';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { UserDropdown } from './UserDropdown';
import { Bell, HelpCircle, Menu } from 'lucide-react';

interface TopbarProps {
  onToggleMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileMenu }) => {
  return (
    <header className="h-16 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <WorkspaceSwitcher />
      </div>

      <div className="flex items-center gap-3">
        <a
          href="https://social.w3lead.in"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Documentation</span>
        </a>

        <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
        </button>

        <div className="h-5 w-px bg-slate-800" />

        <UserDropdown />
      </div>
    </header>
  );
};
