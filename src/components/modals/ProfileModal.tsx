import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Award, Smartphone, Monitor, ShieldCheck, Sparkles, Check } from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const {
    isProfileOpen,
    setIsProfileOpen,
    userProfile,
    setUserProfile,
    phoneFrameMode,
    setPhoneFrameMode,
  } = useApp();

  const [statusInput, setStatusInput] = useState(userProfile.status);
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  if (!isProfileOpen) return null;

  const handleSaveStatus = () => {
    setUserProfile((prev) => ({ ...prev, status: statusInput }));
    setIsEditingStatus(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={() => setIsProfileOpen(false)}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-[#071330] border border-sky-500/30 rounded-3xl p-5 shadow-[0_10px_40px_rgba(22,119,255,0.35)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Identifiant NOVA Universel
          </span>
          <button
            onClick={() => setIsProfileOpen(false)}
            className="p-1.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/70 border border-sky-500/30 mb-4">
          <div className="relative">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.4)]"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-[#071330]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-white truncate font-brand">{userProfile.name}</h3>
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
            </div>
            <p className="text-xs text-sky-300/80 font-mono">{userProfile.handle}</p>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-300">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{userProfile.level}</span>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 mb-4">
          <span className="text-[11px] text-slate-400 block mb-1">Statut Cosmique</span>
          {isEditingStatus ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-sky-500/40 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleSaveStatus}
                className="p-1.5 bg-[#1677FF] rounded-xl text-white text-xs hover:bg-[#00F0FF] hover:text-slate-900 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingStatus(true)}
              className="text-xs text-slate-200 cursor-pointer hover:text-sky-300 transition-colors flex items-center justify-between"
            >
              <span className="italic">« {userProfile.status} »</span>
              <span className="text-[10px] text-sky-400 underline">Modifier</span>
            </div>
          )}
        </div>

        {/* Points & Stats */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-[#00F0FF] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-sm font-bold font-mono">
                {userProfile.universePoints.toLocaleString('fr-FR')}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Points Cosmiques</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-sm font-bold text-emerald-400 font-mono block mb-1">
              {userProfile.currency || 'FCFA'}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">
              {userProfile.country || 'Congo-Brazzaville'}
            </span>
          </div>
        </div>

        {/* Display Mode Toggle (Smartphone Android mockup vs Fullscreen) */}
        <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span className="text-xs text-slate-200">Cadre Smartphone Android</span>
            </div>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800">
              <button
                onClick={() => setPhoneFrameMode(true)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  phoneFrameMode ? 'bg-[#1677FF] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Actif
              </button>
              <button
                onClick={() => setPhoneFrameMode(false)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  !phoneFrameMode ? 'bg-[#1677FF] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Plein écran
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
