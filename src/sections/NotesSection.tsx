import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Plus,
  Pin,
  Trash2,
  Search,
  Tag,
  Sparkles,
  X,
  FileCheck,
} from 'lucide-react';
import { NoteItem } from '../types';

export const NotesSection: React.FC = () => {
  const { notes, addNote, deleteNote, togglePinNote } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('Toutes');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Note Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'Idées' | 'Cours' | 'Projets' | 'Perso'>('Idées');
  const [color, setColor] = useState('blue');

  const tags = ['Toutes', 'Idées', 'Cours', 'Projets', 'Perso'] as const;

  const filteredNotes = notes.filter((n) => {
    const matchesTag = selectedTag === 'Toutes' || n.category === selectedTag;
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const otherNotes = filteredNotes.filter((n) => !n.pinned);

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addNote({
      title: title.trim(),
      content: content.trim(),
      category,
      pinned: false,
      color,
    });

    setTitle('');
    setContent('');
    setShowAddModal(false);
  };

  const getColorClasses = (c: string) => {
    switch (c) {
      case 'cyan':
        return 'border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 to-slate-900/80';
      case 'pink':
        return 'border-pink-500/40 bg-gradient-to-br from-pink-950/40 to-slate-900/80';
      case 'indigo':
        return 'border-indigo-500/40 bg-gradient-to-br from-indigo-950/40 to-slate-900/80';
      default:
        return 'border-sky-500/40 bg-gradient-to-br from-sky-950/40 to-slate-900/80';
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-5 h-5 text-pink-400" />
            <h2 className="text-lg font-bold text-white font-brand">NOVA NOTES</h2>
          </div>
          <p className="text-xs text-slate-400">Carnet de pensée & Connaissances</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-400/30 hover:bg-pink-500/30 text-xs font-semibold active:scale-95 transition-all shadow-[0_0_12px_rgba(236,72,153,0.2)]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle Note</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher dans les notes..."
          className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
        />
      </div>

      {/* Tags Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTag(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              selectedTag === t
                ? 'bg-pink-500 text-white font-bold shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-pink-400 uppercase tracking-wider mb-2">
            <Pin className="w-3 h-3 rotate-45" />
            <span>Notes Épinglées</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {pinnedNotes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-2xl border transition-all relative group shadow-md ${getColorClasses(
                  note.color
                )}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900/80 text-pink-300 border border-pink-500/30">
                    {note.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePinNote(note.id)}
                      className="text-pink-400 hover:text-white p-1"
                      title="Détacher"
                    >
                      <Pin className="w-3.5 h-3.5 rotate-45 fill-current" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-white mb-1.5">{note.title}</h4>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {note.content}
                </p>
                <span className="text-[10px] text-slate-400 font-mono block mt-3">
                  {note.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Notes */}
      <div>
        {pinnedNotes.length > 0 && (
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Toutes les Notes
          </span>
        )}

        {otherNotes.length === 0 && pinnedNotes.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Aucune note trouvée. Appuyez sur « Nouvelle Note » pour commencer.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {otherNotes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-2xl border transition-all relative group shadow-md ${getColorClasses(
                  note.color
                )}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900/80 text-sky-300 border border-sky-500/30">
                    {note.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePinNote(note.id)}
                      className="text-slate-400 hover:text-pink-400 p-1"
                      title="Épingler"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-white mb-1.5">{note.title}</h4>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {note.content}
                </p>
                <span className="text-[10px] text-slate-400 font-mono block mt-3">
                  {note.date}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          <div className="relative z-10 w-full max-w-sm bg-[#071330] border border-pink-500/40 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-brand">Nouvelle Note NOVA</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Titre de la note</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: Idées de projets..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-pink-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Contenu</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Rédigez votre pensée..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-pink-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Catégorie</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Idées', 'Cours', 'Projets', 'Perso'] as const).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border ${
                        category === cat
                          ? 'bg-pink-500/20 border-pink-400 text-pink-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Teinte Luminescente</label>
                <div className="flex gap-2">
                  {[
                    { id: 'blue', color: 'bg-sky-500' },
                    { id: 'cyan', color: 'bg-cyan-400' },
                    { id: 'pink', color: 'bg-pink-500' },
                    { id: 'indigo', color: 'bg-indigo-500' },
                  ].map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setColor(c.id)}
                      className={`w-6 h-6 rounded-full ${c.color} ${
                        color === c.id ? 'ring-2 ring-white scale-110' : 'opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs transition-colors shadow-lg"
              >
                Sauvegarder la Note
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
