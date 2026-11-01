import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCheck, Bell, Sparkles, GraduationCap, CloudSun, MessageCircle } from 'lucide-react';

export const NotificationModal: React.FC = () => {
  const {
    isNotificationsOpen,
    setIsNotificationsOpen,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    setActiveSection,
  } = useApp();

  if (!isNotificationsOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'school':
        return <GraduationCap className="w-4 h-4 text-emerald-400" />;
      case 'weather':
        return <CloudSun className="w-4 h-4 text-sky-400" />;
      case 'chat':
        return <MessageCircle className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#1677FF]" />;
    }
  };

  const handleNotificationClick = (item: { id: string; category: string }) => {
    markNotificationAsRead(item.id);
    if (item.category === 'school') setActiveSection('school');
    else if (item.category === 'weather') setActiveSection('weather');
    else if (item.category === 'chat') setActiveSection('chat');
    else if (item.category === 'system') setActiveSection('ai');
    setIsNotificationsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={() => setIsNotificationsOpen(false)}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-[#071330] border border-sky-500/30 rounded-3xl p-5 shadow-[0_10px_40px_rgba(22,119,255,0.35)]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/20 text-[#00F0FF]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-brand">Notifications</h3>
              <p className="text-xs text-slate-400">Flux d’alertes de votre univers</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearAllNotifications}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1 transition-colors"
              title="Tout marquer comme lu"
            >
              <CheckCheck className="w-4 h-4 text-sky-400" />
              <span className="text-[11px] hidden xs:inline">Tout lire</span>
            </button>
            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="p-1.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5 max-h-[55vh] overflow-y-auto no-scrollbar">
          {notifications.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400">Aucune notification pour le moment.</p>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                  item.read
                    ? 'bg-slate-900/40 border border-slate-800/60 opacity-75'
                    : 'bg-gradient-to-r from-sky-950/60 to-slate-900/80 border border-sky-500/30 shadow-[0_0_12px_rgba(22,119,255,0.15)]'
                } hover:border-sky-400/50`}
              >
                <div className="p-2 rounded-xl bg-slate-800/80 shrink-0 mt-0.5">
                  {getCategoryIcon(item.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                </div>

                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-[#00F0FF] shrink-0 mt-1.5 shadow-[0_0_6px_#00F0FF]" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
