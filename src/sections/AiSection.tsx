import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bot,
  Send,
  Sparkles,
  Mic,
  MicOff,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  Atom,
  HelpCircle,
} from 'lucide-react';

interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const initialAiMessages: AiMessage[] = [
  {
    id: 'ai-1',
    role: 'assistant',
    content:
      'Bonjour Alexandre ! Je suis NOVA IA, votre intelligence cosmique dédiée. Je suis synchronisé avec vos cours, votre emploi du temps, vos notes et vos stations météo. Comment puis-je illuminer votre journée ?',
    timestamp: '16:30',
  },
];

const promptSuggestions = [
  'Résume mon planning et mes devoirs du jour',
  'Explique la physique quantique simplement',
  'Donne-moi 3 astuces pour mémoriser mes cours',
  'Quelle est la météo idéale pour étudier dehors ?',
];

export const AiSection: React.FC = () => {
  const { userProfile, homeworkList, coursesToday, weatherData } = useApp();
  const [messages, setMessages] = useState<AiMessage[]>(initialAiMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isTyping) return;

    const userMsg: AiMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Contextual responses in French based on prompt
    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();

      if (lower.includes('devoir') || lower.includes('planning') || lower.includes('cours') || lower.includes('agenda')) {
        const pendingCount = homeworkList.filter((h) => !h.completed).length;
        reply = `Voici le point de situation pour votre univers quotidien :\n\n• **Devoirs à rendre** : Vous avez ${pendingCount} devoir(s) en attente, notamment la résolution des équations de Kepler en Astrophysique.\n• **Prochains cours** : ${coursesToday.map((c) => `${c.subject} (${c.time})`).join(', ')}.\n• **Recommandation NOVA** : Consacrez 45 minutes ce soir à la révision avec le module NOVA Musique en mode Focus.`;
      } else if (lower.includes('quantique') || lower.includes('physique') || lower.includes('relativité')) {
        reply = `La mécanique quantique en 3 points essentiels :\n\n1. **Dualité onde-corpuscule** : La matière et la lumière possèdent simultanément les propriétés d’une onde et d’un paquet d’énergie (photon/électron).\n2. **Principe d’incertitude d’Heisenberg** : Impossible de connaître à la fois avec une précision infinie la position et la vitesse d’une particule.\n3. **Superposition d’états** : Tant qu’une mesure n’est pas effectuée, le système quantique réside dans une combinaison probabiliste de tous les états possibles.`;
      } else if (lower.includes('météo') || lower.includes('temps')) {
        reply = `D'après la station NOVA Météo à ${weatherData.city} :\nLa température actuelle est de ${weatherData.temp}°C avec un ciel « ${weatherData.condition} ». L'indice de qualité de l'air est ${weatherData.airQuality}, ce qui est idéal pour une session de lecture en terrasse ou une marche revigorante !`;
      } else if (lower.includes('musique') || lower.includes('son') || lower.includes('concentration')) {
        reply = `Je vous conseille la piste « Cosmic Drift » ou « Midnight Aurora » disponible sur NOVA Musique. Ces fréquences sont accordées à 432 Hz et favorisent les ondes cérébrales Alpha, parfaites pour le travail approfondi.`;
      } else {
        reply = `J’ai bien analysé votre demande : « ${text} ».\n\nDans l’univers NOVA, chaque tâche est une opportunité de progression. Souhaitez-vous que je génère une fiche de révision synthétique, que j’ajoute un rappel à votre agenda ou que je détaille davantage ce concept ?`;
      }

      const botMsg: AiMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages(initialAiMessages);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] px-4 pt-2 pb-4 animate-fade-in">
      {/* Header of NOVA AI */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-sky-500/20">
        <div className="flex items-center gap-2.5">
          <div className="relative p-2 rounded-xl bg-gradient-to-tr from-[#1677FF] to-[#00F0FF] text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white font-brand">NOVA IA</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-[#00F0FF] border border-cyan-500/30 font-mono">
                Modèle Quantique 2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Assistant intelligent universel</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsVoiceMode(!isVoiceMode)}
            className={`p-2 rounded-xl transition-all ${
              isVoiceMode
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
            title="Mode Vocal Cosmique"
          >
            {isVoiceMode ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button
            onClick={clearChat}
            className="p-2 rounded-xl bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Réinitialiser la conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice Mode Holographic Visualizer Orb when enabled */}
      {isVoiceMode && (
        <div className="p-4 mb-3 rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/70 border border-cyan-400/30 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-400/30 border border-cyan-400 flex items-center justify-center animate-spin-slow">
              <Atom className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Mode Vocal Actif</span>
              <span className="text-[10px] text-cyan-300">À l'écoute des fréquences vocales...</span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-cyan-300">432 Hz</span>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 pr-1">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-[#1677FF] to-[#0284C7] text-white rounded-br-xs shadow-[0_4px_15px_rgba(22,119,255,0.3)]'
                    : 'bg-[#091535]/80 text-slate-100 rounded-bl-xs border border-sky-500/20 shadow-[0_4px_20px_rgba(3,8,23,0.5)]'
                }`}
              >
                <div className="whitespace-pre-line font-sans">{msg.content}</div>

                <div
                  className={`mt-2 flex items-center justify-between text-[10px] ${
                    isUser ? 'text-sky-200' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-white transition-opacity ml-2"
                      title="Copier la réponse"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#091535]/80 border border-sky-500/20 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF] animate-spin" />
            <span className="text-xs text-sky-300 font-mono">NOVA calcule votre réponse...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts pills */}
      {messages.length < 3 && (
        <div className="py-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {promptSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(suggestion)}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-sky-500/20 hover:border-[#00F0FF] text-[11px] text-sky-200 hover:text-white transition-all active:scale-95"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center mt-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Demandez n'importe quoi à NOVA..."
          className="w-full pl-4 pr-12 py-3 bg-slate-900/90 text-white rounded-2xl border border-sky-500/30 focus:border-[#00F0FF] focus:outline-none text-xs placeholder-slate-400 shadow-inner"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="absolute right-2 p-2 rounded-xl bg-[#1677FF] hover:bg-[#00F0FF] text-white hover:text-slate-950 disabled:opacity-40 disabled:hover:bg-[#1677FF] transition-all shadow-[0_0_10px_#1677FF]"
          aria-label="Envoyer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
