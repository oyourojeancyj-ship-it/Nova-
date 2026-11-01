import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NovaLogo } from '../components/common/NovaLogo';
import {
  Search,
  Sparkles,
  Bot,
  CloudSun,
  Music2,
  GraduationCap,
  Calendar,
  FileText,
  Play,
  ArrowRight,
  TrendingUp,
  Clock,
  Compass,
  CheckCircle2,
  ChevronRight,
  Wind,
  Droplets,
  Flame,
} from 'lucide-react';

export const HomeSection: React.FC = () => {
  const {
    userProfile,
    setActiveSection,
    setIsSearchOpen,
    weatherData,
    shortsList,
    currentShortIndex,
    setCurrentShortIndex,
    playlist,
    currentTrackIndex,
    isPlayingMusic,
    togglePlayMusic,
    homeworkList,
    plannerTasks,
    notes,
    toggleHomework,
  } = useApp();

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const pendingHomework = homeworkList.filter((h) => !h.completed);
  const pendingTasks = plannerTasks.filter((t) => !t.completed);
  const currentTrack = playlist[currentTrackIndex];

  return (
    <div className="flex flex-col gap-5 px-4 pt-2 pb-6 animate-fade-in">
      {/* Hero Welcome & Logo Banner */}
      <div className="relative rounded-3xl p-5 overflow-hidden bg-gradient-to-br from-[#0c1a3b]/90 via-[#071330]/90 to-[#030817] border border-sky-500/20 shadow-[0_10px_30px_rgba(22,119,255,0.15)]">
        {/* Ambient background glows */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#1677FF]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#00F0FF]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-start">
          {/* NOVA Logo at top of Home */}
          <div className="mb-3">
            <NovaLogo size="lg" showText={true} subtitle="Votre Univers Quotidien" />
          </div>

          {/* Welcome Message */}
          <div className="mt-1">
            <h2 className="text-xl font-extrabold text-white tracking-tight font-brand">
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-200 to-white">{userProfile.name.split(' ')[0]}</span>
            </h2>
            <p className="text-xs text-sky-200/75 mt-0.5 leading-relaxed font-sans">
              Prêt à explorer votre journée ? 9 dimensions synchronisées en temps réel.
            </p>
          </div>

          {/* Cosmic Status Kicker */}
          <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/60 border border-sky-400/20 text-[11px] text-sky-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Niveau Cosmique : <strong>{userProfile.level}</strong></span>
          </div>
        </div>
      </div>

      {/* Interactive Futuristic Search Bar */}
      <div
        onClick={() => setIsSearchOpen(true)}
        className="group relative flex items-center justify-between p-3.5 rounded-2xl bg-[#091535]/70 border border-sky-500/20 hover:border-sky-400/50 cursor-pointer backdrop-blur-xl transition-all shadow-[0_4px_20px_rgba(3,8,23,0.5)] active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 group-hover:text-[#00F0FF] transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
            Rechercher un devoir, une note, un son, la météo...
          </span>
        </div>
        <kbd className="hidden xs:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-900/80 rounded border border-slate-700">
          ⌘K
        </kbd>
      </div>

      {/* Weather Preview Card */}
      <div
        onClick={() => setActiveSection('weather')}
        className="relative rounded-3xl p-4.5 bg-gradient-to-br from-[#0c224f]/70 via-[#071738]/80 to-[#030c22] border border-sky-400/25 hover:border-sky-400/50 cursor-pointer backdrop-blur-xl transition-all group shadow-[0_8px_25px_rgba(22,119,255,0.15)]"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-[#00F0FF]">
              <CloudSun className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white font-brand">NOVA MÉTÉO</span>
              <span className="text-[10px] text-sky-300/80 block">{weatherData.city}</span>
            </div>
          </div>
          <span className="text-[11px] text-sky-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            Détails <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-brand tracking-tight">
              {weatherData.temp}°C
            </span>
            <span className="text-xs text-sky-200 font-medium">{weatherData.condition}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <Droplets className="w-3 h-3 text-sky-400" />
              {weatherData.humidity}%
            </span>
            <span className="flex items-center gap-1">
              <Wind className="w-3 h-3 text-cyan-400" />
              {weatherData.wind} km/h
            </span>
          </div>
        </div>

        {/* 3-hour micro forecast strip */}
        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-sky-500/15">
          {weatherData.hourly.slice(0, 4).map((h, i) => (
            <div key={i} className="flex flex-col items-center p-1.5 rounded-xl bg-slate-900/40">
              <span className="text-[10px] text-slate-400">{h.time}</span>
              <span className="text-xs font-semibold text-white my-0.5">{h.temp}°</span>
              <span className="text-[9px] text-sky-300 font-mono">Prév.</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Shortcuts Grid (AI, Music, School, Planner, Notes) */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-brand">
            Raccourcis Cosmiques
          </span>
          <span className="text-[11px] text-sky-400 font-medium">Accès rapide</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* AI Assistant Shortcut */}
          <div
            onClick={() => setActiveSection('ai')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0e214d]/80 to-[#071330]/90 border border-cyan-400/30 hover:border-cyan-400 cursor-pointer transition-all shadow-[0_4px_15px_rgba(0,240,255,0.12)] group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-400/40">
                <Bot className="w-5 h-5 text-[#00F0FF] group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono">
                IA 2.4
              </span>
            </div>
            <h4 className="text-xs font-bold text-white font-brand">Assistant IA</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">Posez toutes vos questions</p>
          </div>

          {/* School Shortcut */}
          <div
            onClick={() => setActiveSection('school')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0c2e30]/80 to-[#071b22]/90 border border-emerald-400/30 hover:border-emerald-400 cursor-pointer transition-all shadow-[0_4px_15px_rgba(16,185,129,0.12)] group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-400/40">
                <GraduationCap className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono">
                16.8/20
              </span>
            </div>
            <h4 className="text-xs font-bold text-white font-brand">NOVA École</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              {pendingHomework.length} devoirs à rendre
            </p>
          </div>

          {/* Music Shortcut */}
          <div
            onClick={() => setActiveSection('music')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-[#271545]/80 to-[#120a27]/90 border border-purple-400/30 hover:border-purple-400 cursor-pointer transition-all shadow-[0_4px_15px_rgba(139,92,246,0.12)] group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-400/40">
                <Music2 className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayMusic();
                }}
                className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-[0_0_8px_#8B5CF6] active:scale-95"
                title={isPlayingMusic ? 'Pause' : 'Play'}
              >
                {isPlayingMusic ? <div className="w-2 h-2 bg-white rounded-xs" /> : <Play className="w-2.5 h-2.5 fill-current ml-0.5" />}
              </button>
            </div>
            <h4 className="text-xs font-bold text-white font-brand">NOVA Musique</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 truncate">{currentTrack.title}</p>
          </div>

          {/* Planner Shortcut */}
          <div
            onClick={() => setActiveSection('planner')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-[#2f220d]/80 to-[#191307]/90 border border-amber-400/30 hover:border-amber-400 cursor-pointer transition-all shadow-[0_4px_15px_rgba(245,158,11,0.12)] group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-400/40">
                <Calendar className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono">
                {pendingTasks.length} tâches
              </span>
            </div>
            <h4 className="text-xs font-bold text-white font-brand">NOVA Agenda</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">3 cours aujourd'hui</p>
          </div>
        </div>

        {/* Notes quick strip */}
        <div
          onClick={() => setActiveSection('notes')}
          className="mt-2.5 p-3 rounded-2xl bg-slate-900/60 border border-pink-500/20 hover:border-pink-500/40 cursor-pointer flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pink-500/15 text-pink-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white font-brand">NOVA Notes</h5>
              <p className="text-[11px] text-slate-400">{notes.length} notes synchronisées</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Short Videos Preview Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-brand">
              NOVA Shorts Populaires
            </span>
          </div>
          <button
            onClick={() => setActiveSection('shorts')}
            className="text-[11px] text-sky-400 hover:text-white flex items-center gap-0.5 transition-colors"
          >
            Tout voir <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal scroll preview cards */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {shortsList.map((short, index) => (
            <div
              key={short.id}
              onClick={() => {
                setCurrentShortIndex(index);
                setActiveSection('shorts');
              }}
              className="relative w-36 h-52 shrink-0 rounded-2xl overflow-hidden cursor-pointer group border border-sky-500/20 hover:border-rose-500/60 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.6)]"
            >
              {/* Background gradient simulating video */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${
                  short.visualTheme === 'nebula'
                    ? 'from-[#0b0c2a] via-[#381665] to-[#120427]'
                    : short.visualTheme === 'cyberpunk'
                    ? 'from-[#081b2a] via-[#103a5e] to-[#04121d]'
                    : short.visualTheme === 'aurora'
                    ? 'from-[#08221c] via-[#0d4f3b] to-[#031510]'
                    : 'from-[#170929] via-[#46183e] to-[#0d041c]'
                }`}
              />

              {/* Subtle animated pattern */}
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />

              {/* Center Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-[#1677FF] transition-all shadow-lg">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>
              </div>

              {/* Creator & Title */}
              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black via-black/70 to-transparent">
                <div className="flex items-center gap-1.5 mb-1">
                  <img
                    src={short.creatorAvatar}
                    alt={short.creator}
                    className="w-4 h-4 rounded-full border border-sky-400"
                  />
                  <span className="text-[10px] text-slate-300 truncate">{short.creator}</span>
                </div>
                <p className="text-[11px] font-semibold text-white line-clamp-2 leading-tight">
                  {short.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Immediate Tasks & Devoirs Checklist */}
      <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1677FF]" />
            <h4 className="text-xs font-bold text-white font-brand">Priorités du Jour</h4>
          </div>
          <button
            onClick={() => setActiveSection('school')}
            className="text-[11px] text-sky-400 hover:text-white"
          >
            Voir l'école
          </button>
        </div>

        <div className="space-y-2">
          {homeworkList.slice(0, 2).map((item) => (
            <div
              key={item.id}
              onClick={() => toggleHomework(item.id)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-sky-500/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                    item.completed
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : 'border-slate-600'
                  }`}
                >
                  {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div className="truncate">
                  <span
                    className={`text-xs block truncate ${
                      item.completed ? 'line-through text-slate-500' : 'text-slate-200'
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="text-[10px] text-sky-400/80">{item.subject}</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 ml-2">{item.dueDate}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
