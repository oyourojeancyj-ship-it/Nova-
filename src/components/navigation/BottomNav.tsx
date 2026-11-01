import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SectionId } from '../../types';
import {
  Home,
  Bot,
  CloudSun,
  PlaySquare,
  Music2,
  GraduationCap,
  MessageCircle,
  Calendar,
  FileText,
  Grid,
  X,
} from 'lucide-react';

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'ai', label: 'NOVA IA', icon: Bot },
  { id: 'weather', label: 'Météo', icon: CloudSun },
  { id: 'shorts', label: 'Shorts', icon: PlaySquare },
  { id: 'music', label: 'Musique', icon: Music2 },
];

const allUniverseModules: {
  id: SectionId;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accentColor: string;
}[] = [
  { id: 'home', name: 'NOVA Accueil', subtitle: 'Tableau de bord cosmique', icon: Home, accentColor: '#1677FF' },
  { id: 'ai', name: 'NOVA IA', subtitle: 'Assistant quantique universel', icon: Bot, accentColor: '#00F0FF' },
  { id: 'weather', name: 'NOVA Météo', subtitle: 'Atmosphère & Prévisions', icon: CloudSun, accentColor: '#38BDF8' },
  { id: 'shorts', name: 'NOVA Shorts', subtitle: 'Flux de vidéos courtes immersives', icon: PlaySquare, accentColor: '#F43F5E' },
  { id: 'music', name: 'NOVA Musique', subtitle: 'Lecteur audio spatial & Lo-fi', icon: Music2, accentColor: '#8B5CF6' },
  { id: 'school', name: 'NOVA École', subtitle: 'Devoirs, cours & révisions', icon: GraduationCap, accentColor: '#10B981' },
  { id: 'chat', name: 'NOVA Chat', subtitle: 'Messagerie interstellaire', icon: MessageCircle, accentColor: '#06B6D4' },
  { id: 'planner', name: 'NOVA Agenda', subtitle: 'Planning & gestion du temps', icon: Calendar, accentColor: '#F59E0B' },
  { id: 'notes', name: 'NOVA Notes', subtitle: 'Carnet de pensée & cours', icon: FileText, accentColor: '#EC4899' },
];

export const BottomNav: React.FC = () => {
  const { activeSection, setActiveSection } = useApp();
  const [isUniverseMenuOpen, setIsUniverseMenuOpen] = useState(false);

  const handleSelect = (id: SectionId) => {
    setActiveSection(id);
    setIsUniverseMenuOpen(false);
  };

  const isMoreActive = ['school', 'chat', 'planner', 'notes'].includes(activeSection);

  return (
    <>
      {/* Expansive Universe Drawer for all 9 sections */}
      {isUniverseMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-md animate-fade-in"
            onClick={() => setIsUniverseMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative z-10 w-full max-w-lg mx-auto bg-[#071129] border-t border-sky-500/25 rounded-t-3xl p-5 shadow-[0_-10px_40px_rgba(22,119,255,0.25)] animate-slide-up">
            {/* Grab handle */}
            <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-brand flex items-center gap-2">
                  <span>Univers NOVA</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    9 Modules
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Accédez instantanément à toutes les dimensions de votre quotidien.</p>
              </div>
              <button
                onClick={() => setIsUniverseMenuOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of all 9 modules */}
            <div className="grid grid-cols-3 gap-2.5 max-h-[60vh] overflow-y-auto no-scrollbar py-1">
              {allUniverseModules.map((module) => {
                const Icon = module.icon;
                const isSelected = activeSection === module.id;
                return (
                  <button
                    key={module.id}
                    onClick={() => handleSelect(module.id)}
                    className={`flex flex-col items-center p-3 rounded-2xl text-center transition-all ${
                      isSelected
                        ? 'bg-sky-500/20 border-2 border-[#1677FF] shadow-[0_0_15px_rgba(22,119,255,0.35)]'
                        : 'bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-2"
                      style={{
                        backgroundColor: `${module.accentColor}20`,
                        border: `1px solid ${module.accentColor}40`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: module.accentColor }} />
                    </div>
                    <span className="text-xs font-semibold text-white truncate w-full">
                      {module.name.replace('NOVA ', '')}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate w-full mt-0.5">
                      {module.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Futuristic Bottom Navigation Dock */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none">
        <div className="w-full max-w-md mx-auto pointer-events-auto">
          <div className="relative glass-panel-elevated rounded-2xl px-2 py-1.5 flex items-center justify-between border border-sky-500/20 shadow-[0_4px_30px_rgba(3,8,23,0.95)]">
            {/* Primary 4 sections */}
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'text-[#00F0FF] scale-105'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {/* Subtle active glow pill */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-t from-sky-500/20 to-transparent rounded-xl -z-10" />
                  )}
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'drop-shadow-[0_0_8px_#1677FF]' : ''
                    }`}
                  />
                  <span
                    className={`text-[10px] tracking-wide mt-1 font-medium transition-colors ${
                      isActive ? 'font-semibold text-white' : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1677FF] mt-0.5 shadow-[0_0_6px_#00F0FF]" />
                  )}
                </button>
              );
            })}

            {/* "Plus" (Universe drawer) item */}
            <button
              onClick={() => setIsUniverseMenuOpen(true)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all ${
                isMoreActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid
                className={`w-5 h-5 transition-transform ${
                  isMoreActive ? 'drop-shadow-[0_0_8px_#F59E0B]' : ''
                }`}
              />
              <span className="text-[10px] tracking-wide mt-1 font-medium text-slate-300">
                {isMoreActive ? activeSection.toUpperCase() : 'Plus'}
              </span>
              {isMoreActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5 shadow-[0_0_6px_#F59E0B]" />
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
