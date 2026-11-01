import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, Bot, CloudSun, PlaySquare, Music2, GraduationCap, MessageCircle, Calendar, FileText, ArrowRight } from 'lucide-react';
import { SectionId } from '../../types';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    setActiveSection,
    homeworkList,
    plannerTasks,
    notes,
    playlist,
    contacts,
  } = useApp();

  const [term, setTerm] = useState('');

  if (!isSearchOpen) return null;

  const navigateTo = (section: SectionId) => {
    setActiveSection(section);
    setIsSearchOpen(false);
  };

  const cleanTerm = term.toLowerCase().trim();

  const matchingHomework = homeworkList.filter(
    (h) => h.title.toLowerCase().includes(cleanTerm) || h.subject.toLowerCase().includes(cleanTerm)
  );

  const matchingTasks = plannerTasks.filter(
    (t) => t.title.toLowerCase().includes(cleanTerm) || t.category.toLowerCase().includes(cleanTerm)
  );

  const matchingNotes = notes.filter(
    (n) => n.title.toLowerCase().includes(cleanTerm) || n.content.toLowerCase().includes(cleanTerm)
  );

  const matchingTracks = playlist.filter(
    (tr) => tr.title.toLowerCase().includes(cleanTerm) || tr.artist.toLowerCase().includes(cleanTerm)
  );

  const matchingContacts = contacts.filter(
    (c) => c.name.toLowerCase().includes(cleanTerm)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 sm:pt-20">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-lg bg-[#071330] border border-sky-500/30 rounded-3xl p-5 shadow-[0_10px_40px_rgba(22,119,255,0.35)] overflow-hidden">
        {/* Search Input Bar */}
        <div className="relative flex items-center mb-5">
          <Search className="absolute left-4 w-5 h-5 text-sky-400" />
          <input
            type="text"
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Rechercher dans tout l’Univers NOVA..."
            className="w-full pl-12 pr-12 py-3.5 bg-slate-900/90 text-white rounded-2xl border border-sky-500/30 focus:border-[#00F0FF] focus:outline-none text-sm placeholder-slate-400 focus:ring-2 focus:ring-[#1677FF]/40 shadow-inner"
          />
          {term ? (
            <button
              onClick={() => setTerm('')}
              className="absolute right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Category Jump Tabs if search is empty */}
        {!cleanTerm ? (
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Raccourcis Galactiques
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => navigateTo('ai')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 text-left transition-all"
              >
                <Bot className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-medium text-slate-200">Assistant IA</span>
              </button>
              <button
                onClick={() => navigateTo('school')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 text-left transition-all"
              >
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-slate-200">Devoirs & Cours</span>
              </button>
              <button
                onClick={() => navigateTo('weather')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 text-left transition-all"
              >
                <CloudSun className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-medium text-slate-200">Météo Live</span>
              </button>
              <button
                onClick={() => navigateTo('music')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 text-left transition-all"
              >
                <Music2 className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-medium text-slate-200">Lecteur Musique</span>
              </button>
              <button
                onClick={() => navigateTo('planner')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 text-left transition-all"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-medium text-slate-200">Agenda du jour</span>
              </button>
              <button
                onClick={() => navigateTo('notes')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 text-left transition-all"
              >
                <FileText className="w-4 h-4 text-pink-400" />
                <span className="text-xs font-medium text-slate-200">Bloc-Notes</span>
              </button>
            </div>
          </div>
        ) : (
          /* Search results list */
          <div className="max-h-[50vh] overflow-y-auto no-scrollbar space-y-3">
            {matchingHomework.length === 0 &&
              matchingTasks.length === 0 &&
              matchingNotes.length === 0 &&
              matchingTracks.length === 0 &&
              matchingContacts.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Aucun résultat cosmique trouvé pour « {cleanTerm} »
                </div>
              )}

            {matchingHomework.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1.5">
                  Devoirs & École
                </span>
                {matchingHomework.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => navigateTo('school')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-emerald-500/20 mb-1 cursor-pointer hover:bg-slate-800/80 transition-all"
                  >
                    <div>
                      <h5 className="text-xs font-semibold text-white">{h.title}</h5>
                      <p className="text-[11px] text-slate-400">{h.subject} · {h.dueDate}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </div>
                ))}
              </div>
            )}

            {matchingTasks.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block mb-1.5">
                  Agenda & Tâches
                </span>
                {matchingTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => navigateTo('planner')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-amber-500/20 mb-1 cursor-pointer hover:bg-slate-800/80 transition-all"
                  >
                    <div>
                      <h5 className="text-xs font-semibold text-white">{t.title}</h5>
                      <p className="text-[11px] text-slate-400">{t.time} · {t.category}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </div>
                ))}
              </div>
            )}

            {matchingNotes.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-pink-400 uppercase tracking-wider block mb-1.5">
                  Notes
                </span>
                {matchingNotes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => navigateTo('notes')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-pink-500/20 mb-1 cursor-pointer hover:bg-slate-800/80 transition-all"
                  >
                    <div>
                      <h5 className="text-xs font-semibold text-white">{n.title}</h5>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{n.content}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-pink-400" />
                  </div>
                ))}
              </div>
            )}

            {matchingTracks.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider block mb-1.5">
                  Musique
                </span>
                {matchingTracks.map((tr) => (
                  <div
                    key={tr.id}
                    onClick={() => navigateTo('music')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-violet-500/20 mb-1 cursor-pointer hover:bg-slate-800/80 transition-all"
                  >
                    <div>
                      <h5 className="text-xs font-semibold text-white">{tr.title}</h5>
                      <p className="text-[11px] text-slate-400">{tr.artist}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-violet-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
