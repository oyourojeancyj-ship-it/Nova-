import React from 'react';
import { useApp } from '../../context/AppContext';
import { NovaLogo } from '../common/NovaLogo';
import { Bell, Search, Sparkles } from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    unreadCount,
    setIsSearchOpen,
    setIsNotificationsOpen,
    setIsProfileOpen,
    userProfile,
    setActiveSection,
    activeSection,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 w-full px-4 pt-3 pb-2.5 bg-[#030817]/85 backdrop-blur-xl border-b border-sky-500/10 transition-all">
      <div className="flex items-center justify-between gap-3">
        {/* NOVA Crystalline Logo */}
        <NovaLogo
          size="md"
          showText={true}
          subtitle="Univers Quotidien"
          onClick={() => setActiveSection('home')}
        />

        {/* Action icons: Search, Notifications, Profile */}
        <div className="flex items-center gap-2">
          {/* Quick AI Trigger if not in AI section */}
          {activeSection !== 'ai' && (
            <button
              onClick={() => setActiveSection('ai')}
              className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-cyan-300 bg-sky-500/10 border border-sky-400/25 hover:bg-sky-500/20 active:scale-95 transition-all shadow-[0_0_10px_rgba(22,119,255,0.2)]"
              title="Ouvrir l’Assistant NOVA"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00F0FF] animate-pulse" />
              <span>IA</span>
            </button>
          )}

          {/* Search Trigger Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/50 hover:border-sky-500/40 active:scale-90 transition-all"
            aria-label="Rechercher dans l'univers NOVA"
          >
            <Search className="w-4 h-4 text-sky-400" />
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/50 hover:border-sky-500/40 active:scale-90 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-sky-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#1677FF] text-[10px] font-bold text-white shadow-[0_0_8px_#1677FF] animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="relative ml-0.5 rounded-full p-0.5 ring-2 ring-sky-500/30 hover:ring-[#1677FF] active:scale-95 transition-all group"
            aria-label="Mon Profil"
          >
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#030817]" />
          </button>
        </div>
      </div>
    </header>
  );
};
