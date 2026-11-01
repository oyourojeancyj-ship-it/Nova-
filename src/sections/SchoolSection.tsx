import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  SCHOOL_SUBJECTS_LIST,
  SCHOOL_EXERCISES_DATA,
} from '../data/schoolExercises';
import {
  SchoolExercise,
  SchoolSubject,
  ExerciseDifficulty,
  QuizQuestion,
  ExerciseResultRecord,
} from '../types';
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  Plus,
  BookOpen,
  Award,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Filter,
  Check,
  X,
  Play,
  History,
  Timer,
  AlertCircle,
} from 'lucide-react';

export const SchoolSection: React.FC = () => {
  const {
    averageGrade,
    coursesToday,
    homeworkList,
    toggleHomework,
    addHomework,
    exerciseHistory,
    recordExerciseResult,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'exercices' | 'devoirs' | 'cours' | 'historique'>('exercices');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Active Quiz Runner State
  const [activeExercise, setActiveExercise] = useState<SchoolExercise | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isTimedMode, setIsTimedMode] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Add Homework Modal State
  const [showAddHomework, setShowAddHomework] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<'haute' | 'moyenne' | 'basse'>('moyenne');

  // Chronometer ticker
  useEffect(() => {
    let timer: number;
    if (activeExercise && !quizFinished) {
      timer = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeExercise, quizFinished]);

  // Start Exercise Handler
  const handleStartExercise = (exercise: SchoolExercise) => {
    setActiveExercise(exercise);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setHasSubmittedAnswer(false);
    setUserAnswers([]);
    setQuizFinished(false);
    setElapsedSeconds(0);
  };

  // Submit current answer
  const handleSubmitAnswer = () => {
    if (selectedOption === null || !activeExercise) return;
    setHasSubmittedAnswer(true);
    const updated = [...userAnswers, selectedOption];
    setUserAnswers(updated);
  };

  // Next Question or Finish
  const handleNextQuestion = () => {
    if (!activeExercise) return;
    if (currentQuestionIdx < activeExercise.questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setHasSubmittedAnswer(false);
    } else {
      // Finish Quiz & calculate score
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!activeExercise) return;
    setQuizFinished(true);

    let correctCount = 0;
    activeExercise.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / activeExercise.questions.length) * 100);

    await recordExerciseResult({
      exerciseId: activeExercise.id,
      exerciseTitle: activeExercise.title,
      subject: activeExercise.subject,
      subjectLabel: activeExercise.subjectLabel,
      difficulty: activeExercise.difficulty,
      score: scorePercentage,
      totalQuestions: activeExercise.questions.length,
      correctAnswers: correctCount,
      elapsedSeconds,
    });
  };

  // Restart Exercise
  const handleRestartExercise = () => {
    if (!activeExercise) return;
    handleStartExercise(activeExercise);
  };

  // Close Quiz
  const handleCloseQuiz = () => {
    setActiveExercise(null);
    setQuizFinished(false);
  };

  // Filter exercises
  const filteredExercises = SCHOOL_EXERCISES_DATA.filter((ex) => {
    const matchesSubject = selectedSubject === 'all' || ex.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === 'all' || ex.difficulty === selectedDifficulty;
    const matchesSearch =
      ex.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ex.chapter.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ex.subjectLabel.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesSubject && matchesDifficulty && matchesSearch;
  });

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newTitle.trim()) return;
    addHomework({
      subject: newSubject.trim(),
      title: newTitle.trim(),
      dueDate: newDueDate.trim() || 'Cette semaine',
      priority: newPriority,
      completed: false,
    });
    setNewSubject('');
    setNewTitle('');
    setNewDueDate('');
    setShowAddHomework(false);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-6 animate-fade-in">
      {/* Header with grade and Congo curriculum tag */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white font-brand">NOVA ÉCOLE</h2>
          </div>
          <p className="text-xs text-emerald-300/90 font-medium">
            Programme Officiel Congo-Brazzaville & CEMAC
          </p>
        </div>

        <button
          onClick={() => setShowAddHomework(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30 text-xs font-semibold active:scale-95 transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Devoir</span>
        </button>
      </div>

      {/* Grade Banner */}
      <div className="relative rounded-3xl p-5 overflow-hidden bg-gradient-to-br from-[#0a2f26]/80 via-[#07201b]/90 to-[#02100d] border border-emerald-500/30 shadow-[0_10px_35px_rgba(16,185,129,0.2)]">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-300/80 font-mono uppercase tracking-wider block">
              Moyenne Trimestrielle
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-4xl font-black text-white font-brand tracking-tight">
                {averageGrade}
              </span>
              <span className="text-sm font-semibold text-emerald-400">/ 20</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-200">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mention Très Bien · Lycée Victor Augagneur (Pointe-Noire)</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/60 border border-emerald-500/20">
            <span className="text-xl font-black text-white font-mono">{exerciseHistory.length}</span>
            <span className="text-[9px] text-slate-400 mt-0.5 text-center leading-tight">
              Quiz validés
            </span>
          </div>
        </div>
      </div>

      {/* 4 Main Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-2xl border border-sky-500/20">
        <button
          onClick={() => setActiveTab('exercices')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'exercices' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Exercices & Quiz
        </button>
        <button
          onClick={() => setActiveTab('devoirs')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'devoirs' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Devoirs ({homeworkList.filter((h) => !h.completed).length})
        </button>
        <button
          onClick={() => setActiveTab('cours')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'cours' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Cours ({coursesToday.length})
        </button>
        <button
          onClick={() => setActiveTab('historique')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'historique' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Historique
        </button>
      </div>

      {/* TAB 1: EXERCICES & QUIZ CATALOG */}
      {activeTab === 'exercices' && (
        <div className="space-y-3.5">
          {/* Subject Pills (7 subjects) */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedSubject === 'all'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900/70 text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              Toutes les matières
            </button>
            {SCHOOL_SUBJECTS_LIST.map((subj) => (
              <button
                key={subj.id}
                onClick={() => setSelectedSubject(subj.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedSubject === subj.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900/70 text-slate-300 border border-slate-800 hover:text-white'
                }`}
              >
                {subj.label}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400 font-medium">Niveau :</span>
              {(['all', 'facile', 'moyen', 'difficile'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                    selectedDifficulty === diff
                      ? 'bg-sky-500/20 text-[#00F0FF] border border-sky-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {diff === 'all' ? 'Tous' : diff}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono text-emerald-400">
              {filteredExercises.length} exercice(s)
            </span>
          </div>

          {/* Exercise Cards */}
          <div className="space-y-3">
            {filteredExercises.map((ex) => (
              <div
                key={ex.id}
                className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/80 to-[#071330] border border-emerald-500/20 hover:border-emerald-400/50 transition-all shadow-md group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {ex.subjectLabel}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase ${
                        ex.difficulty === 'facile'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : ex.difficulty === 'moyen'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {ex.difficulty}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Timer className="w-3 h-3 text-emerald-400" />
                    {ex.durationMinutes} min
                  </span>
                </div>

                <span className="text-[11px] text-sky-400 font-medium block mb-1">
                  Chapitre : {ex.chapter}
                </span>

                <h4 className="text-xs font-bold text-white leading-snug mb-1.5 font-brand">
                  {ex.title}
                </h4>

                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                  {ex.summary}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {ex.questions.length} question(s) avec corrigé
                  </span>

                  <button
                    onClick={() => handleStartExercise(ex)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-sm active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Lancer le Quiz</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DEVOIRS */}
      {activeTab === 'devoirs' && (
        <div className="space-y-2.5">
          {homeworkList.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleHomework(item.id)}
              className={`p-3.5 rounded-2xl cursor-pointer border transition-all ${
                item.completed
                  ? 'bg-slate-900/40 border-slate-800 opacity-60'
                  : 'bg-slate-900/70 border-emerald-500/25 hover:border-emerald-400/60 shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      item.completed
                        ? 'bg-emerald-500 border-emerald-400 text-white'
                        : 'border-slate-600 bg-slate-950/60'
                    }`}
                  >
                    {item.completed && <CheckCircle2 className="w-4 h-4" />}
                  </div>

                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        item.completed ? 'line-through text-slate-500' : 'text-white'
                      }`}
                    >
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-emerald-300/80 mt-0.5">{item.subject}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase ${
                      item.priority === 'haute'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : item.priority === 'moyenne'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.dueDate}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: COURS */}
      {activeTab === 'cours' && (
        <div className="space-y-2.5">
          {coursesToday.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-2xl bg-slate-900/70 border border-sky-500/20 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{c.subject}</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">{c.room} · {c.teacher}</p>
                </div>
              </div>

              <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-xl bg-slate-950 text-cyan-300 border border-sky-500/30 whitespace-nowrap">
                {c.time}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: HISTORIQUE DES EXERCICES RÉALISÉS */}
      {activeTab === 'historique' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-brand">
              Historique des Quiz & Exercices
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              {exerciseHistory.length} terminés
            </span>
          </div>

          {exerciseHistory.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center">
              <History className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white mb-1">Aucun exercice réalisé pour le moment</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Choisissez un exercice dans l’onglet « Exercices & Quiz » et testez vos connaissances !
              </p>
            </div>
          ) : (
            exerciseHistory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {item.subjectLabel}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.completedAt}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{item.exerciseTitle}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Temps : {formatTimer(item.elapsedSeconds)} · {item.correctAnswers}/{item.totalQuestions} justes
                  </span>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span
                    className={`text-sm font-black font-mono ${
                      item.score >= 70 ? 'text-emerald-400' : item.score >= 50 ? 'text-amber-400' : 'text-rose-400'
                    }`}
                  >
                    {item.score}%
                  </span>
                  <button
                    onClick={() => {
                      const match = SCHOOL_EXERCISES_DATA.find((e) => e.id === item.exerciseId);
                      if (match) handleStartExercise(match);
                    }}
                    className="mt-1 text-[10px] text-sky-400 hover:text-white flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Recommencer</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* INTERACTIVE QUIZ RUNNER MODAL */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#071330] border border-emerald-500/40 rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar flex flex-col">
            {/* Quiz Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 uppercase">
                  {activeExercise.subjectLabel} · {activeExercise.difficulty}
                </span>
                <h3 className="text-xs font-bold text-white font-brand mt-1 line-clamp-1">
                  {activeExercise.title}
                </h3>
              </div>

              <button
                onClick={handleCloseQuiz}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quiz In-Progress View */}
            {!quizFinished ? (
              <>
                {/* Timer & Question Progress Bar */}
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <span className="text-slate-400">
                    Question {currentQuestionIdx + 1} / {activeExercise.questions.length}
                  </span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400">
                    <Timer className="w-3.5 h-3.5 animate-pulse" />
                    <span>{formatTimer(elapsedSeconds)}</span>
                  </div>
                </div>

                {/* Progress bar line */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-[#00F0FF] transition-all"
                    style={{
                      width: `${((currentQuestionIdx + 1) / activeExercise.questions.length) * 100}%`,
                    }}
                  />
                </div>

                {/* Current Question */}
                {(() => {
                  const q = activeExercise.questions[currentQuestionIdx];
                  return (
                    <div className="space-y-3.5">
                      <p className="text-xs font-bold text-white leading-relaxed bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                        {q.question}
                      </p>

                      {/* Options */}
                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = selectedOption === oIdx;
                          const isCorrect = q.correctIndex === oIdx;

                          let btnClasses = 'border-slate-800 bg-slate-900/70 text-slate-200';
                          if (hasSubmittedAnswer) {
                            if (isCorrect) {
                              btnClasses = 'border-emerald-400 bg-emerald-950/70 text-emerald-300 font-bold';
                            } else if (isSelected && !isCorrect) {
                              btnClasses = 'border-rose-500 bg-rose-950/70 text-rose-300';
                            }
                          } else if (isSelected) {
                            btnClasses = 'border-[#00F0FF] bg-sky-950 text-white shadow-[0_0_12px_rgba(0,240,255,0.3)]';
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={hasSubmittedAnswer}
                              onClick={() => setSelectedOption(oIdx)}
                              className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnClasses}`}
                            >
                              <span>{opt}</span>
                              {hasSubmittedAnswer && isCorrect && (
                                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                              {hasSubmittedAnswer && isSelected && !isCorrect && (
                                <X className="w-4 h-4 text-rose-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Step-by-Step Explanation when submitted */}
                      {hasSubmittedAnswer && (
                        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 text-xs space-y-2 animate-fade-in">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Explication & Corrigé Détaillé :</span>
                          </div>
                          <p className="text-slate-300 leading-relaxed">{q.explanation}</p>

                          {q.stepByStepDetails && (
                            <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                              <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block">
                                Résolution étape par étape :
                              </span>
                              {q.stepByStepDetails.map((step, sIdx) => (
                                <p key={sIdx} className="text-[11px] text-slate-300 pl-2 border-l-2 border-emerald-500/50">
                                  {step}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action buttons */}
                      {!hasSubmittedAnswer ? (
                        <button
                          onClick={handleSubmitAnswer}
                          disabled={selectedOption === null}
                          className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-40 transition-all shadow-md mt-2"
                        >
                          Valider ma réponse
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuestion}
                          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#1677FF] text-white font-bold text-xs transition-all shadow-md mt-2 flex items-center justify-center gap-1.5"
                        >
                          <span>
                            {currentQuestionIdx < activeExercise.questions.length - 1
                              ? 'Question suivante'
                              : 'Terminer et voir les résultats'}
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })()}
              </>
            ) : (
              /* Quiz Finished Summary Screen */
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mx-auto shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-bounce">
                  <Award className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-white font-brand">Exercice Terminé !</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Temps total : {formatTimer(elapsedSeconds)} · Programme {activeExercise.curriculum}
                  </p>
                </div>

                {/* Score Pill */}
                {(() => {
                  let correctCount = 0;
                  activeExercise.questions.forEach((q, idx) => {
                    if (userAnswers[idx] === q.correctIndex) correctCount++;
                  });
                  const percentage = Math.round((correctCount / activeExercise.questions.length) * 100);

                  return (
                    <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 max-w-xs mx-auto">
                      <span className="text-3xl font-black font-mono text-emerald-400 block">
                        {percentage}%
                      </span>
                      <span className="text-xs text-slate-300 mt-0.5 block">
                        {correctCount} sur {activeExercise.questions.length} réponses correctes
                      </span>
                    </div>
                  );
                })()}

                {/* Re-try and Return buttons */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <button
                    onClick={handleRestartExercise}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 text-xs text-white font-semibold flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Recommencer</span>
                  </button>

                  <button
                    onClick={handleCloseQuiz}
                    className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors shadow-md"
                  >
                    Terminer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL AJOUT DE DEVOIR */}
      {showAddHomework && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#071330] border border-emerald-500/40 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-brand">Nouveau Devoir</h3>
              <button onClick={() => setShowAddHomework(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHomework} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Matière</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="ex: Mathématiques, SVT, Philosophie..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Intitulé du devoir</label>
                <textarea
                  required
                  rows={2}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Description du devoir à réaliser..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Date d'échéance</label>
                <input
                  type="text"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  placeholder="ex: Demain 08:30 ou Vendredi"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Priorité</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['basse', 'moyenne', 'haute'] as const).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setNewPriority(p)}
                      className={`py-1.5 rounded-lg text-xs font-semibold capitalize border ${
                        newPriority === p
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg"
              >
                Enregistrer le Devoir
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
