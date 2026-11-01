import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Tag,
  X,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { PlannerTask } from '../types';

export const PlannerSection: React.FC = () => {
  const { plannerTasks, toggleTask, addTask } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskCategory, setTaskCategory] = useState<'Études' | 'Personnel' | 'Projet' | 'Sport'>('Études');

  const categories = ['Toutes', 'Études', 'Personnel', 'Projet', 'Sport'] as const;

  const filteredTasks = selectedCategory === 'Toutes'
    ? plannerTasks
    : plannerTasks.filter((t) => t.category === selectedCategory);

  const completedCount = plannerTasks.filter((t) => t.completed).length;
  const completionRate = Math.round((completedCount / (plannerTasks.length || 1)) * 100);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      time: taskTime.trim() || 'Toute la journée',
      date: 'Aujourd’hui',
      category: taskCategory,
      completed: false,
    });

    setTaskTitle('');
    setTaskTime('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white font-brand">NOVA AGENDA</h2>
          </div>
          <p className="text-xs text-slate-400">Chronologie & Synchronisation du temps</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30 text-xs font-semibold active:scale-95 transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Événement</span>
        </button>
      </div>

      {/* Productivity Score Banner */}
      <div className="relative rounded-3xl p-5 overflow-hidden bg-gradient-to-br from-[#3b280a]/80 via-[#221605]/90 to-[#0e0802] border border-amber-500/30 shadow-[0_10px_35px_rgba(245,158,11,0.2)]">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-300 font-mono uppercase tracking-wider block">
              Indice d'accomplissement
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-black text-white font-brand">{completionRate}%</span>
              <span className="text-xs text-amber-300 font-mono">du programme validé</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {completedCount} sur {plannerTasks.length} tâches terminées aujourd’hui.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Date Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { day: 'Ven.', date: '30 Oct.', active: false },
          { day: 'Auj.', date: '31 Oct.', active: true },
          { day: 'Dim.', date: '1 Nov.', active: false },
          { day: 'Lun.', date: '2 Nov.', active: false },
          { day: 'Mar.', date: '3 Nov.', active: false },
        ].map((item, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center py-2 px-3 rounded-2xl cursor-pointer min-w-[68px] transition-all ${
              item.active
                ? 'bg-[#1677FF] text-white shadow-[0_0_15px_#1677FF]'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <span className="text-[10px] font-bold uppercase">{item.day}</span>
            <span className="text-xs font-mono font-extrabold mt-0.5">{item.date}</span>
          </div>
        ))}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Timeline of Tasks */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Aucun événement dans cette catégorie pour le moment.
          </div>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => toggleTask(t.id)}
              className={`p-3.5 rounded-2xl cursor-pointer border transition-all ${
                t.completed
                  ? 'bg-slate-900/40 border-slate-800 opacity-60'
                  : 'bg-slate-900/70 border-amber-500/20 hover:border-amber-400/50 shadow-md'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      t.completed
                        ? 'bg-amber-500 border-amber-400 text-slate-950'
                        : 'border-slate-600 bg-slate-950/60'
                    }`}
                  >
                    {t.completed && <CheckCircle2 className="w-4 h-4 font-bold" />}
                  </div>

                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        t.completed ? 'line-through text-slate-500' : 'text-white'
                      }`}
                    >
                      {t.title}
                    </h4>
                    <span className="text-[10px] text-amber-300/80 font-mono block mt-0.5">
                      {t.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 shrink-0">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{t.time}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add Task */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          <div className="relative z-10 w-full max-w-sm bg-[#071330] border border-amber-500/40 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-brand">Nouvel Événement Agenda</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Titre de l'événement</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="ex: Séminaire IA, Entraînement..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Horaire</label>
                <input
                  type="text"
                  value={taskTime}
                  onChange={(e) => setTaskTime(e.target.value)}
                  placeholder="ex: 15:00 - 16:30"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Catégorie</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Études', 'Personnel', 'Projet', 'Sport'] as const).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setTaskCategory(cat)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border ${
                        taskCategory === cat
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-lg"
              >
                Ajouter à l'Agenda
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
