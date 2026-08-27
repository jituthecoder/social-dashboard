import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CreditCard, LogOut, Settings, User } from 'lucide-react';

export const UserDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-500/50 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
          {initials}
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
          onClick={() => setIsOpen(false)}
        >
          <div className="px-3 py-2 border-b border-slate-800 mb-1">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>

          <div className="space-y-0.5">
            <button
              onClick={() => navigate('/dashboard/settings/profile')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <User className="w-4 h-4 text-slate-400" />
              Profile Settings
            </button>
            <button
              onClick={() => navigate('/dashboard/settings/security')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Security Settings
            </button>
            <button
              onClick={() => navigate('/dashboard/billing')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <CreditCard className="w-4 h-4 text-slate-400" />
              Subscription & Billing
            </button>
          </div>

          <div className="border-t border-slate-800 mt-1 pt-1">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
