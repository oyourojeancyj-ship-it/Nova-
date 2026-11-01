import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Wifi, BatteryMedium, Signal, Smartphone, Monitor } from 'lucide-react';

export const MobileFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { phoneFrameMode, setPhoneFrameMode } = useApp();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#02050E] flex flex-col items-center justify-start sm:p-4 md:p-6 overflow-x-hidden">
      {/* Top Desktop bar to toggle frame simulation */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md mb-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1677FF] animate-pulse" />
          <span className="font-mono text-slate-300">NOVA OS · Android 16 Optimisé</span>
        </div>
        <button
          onClick={() => setPhoneFrameMode(!phoneFrameMode)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-white transition-all"
        >
          {phoneFrameMode ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-sky-400" />
              <span>Mode Plein Écran</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-[#1677FF]" />
              <span>Simulateur Smartphone</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          phoneFrameMode
            ? 'max-w-[430px] rounded-[44px] border-[6px] border-[#0c1a3b] shadow-[0_0_50px_rgba(22,119,255,0.22),_0_20px_50px_rgba(0,0,0,0.85)] bg-[#030817] overflow-hidden min-h-[880px]'
            : 'max-w-xl rounded-none sm:rounded-3xl border-0 sm:border border-sky-500/20 bg-[#030817] min-h-screen'
        } relative flex flex-col`}
      >
        {/* Android Status Bar */}
        <div className="w-full pt-3 px-6 pb-1 flex items-center justify-between text-xs text-slate-300 select-none z-40 bg-[#030817]">
          {/* Time */}
          <span className="font-semibold tracking-tight font-mono text-[13px] text-white">
            {currentTime || '16:33'}
          </span>

          {/* Front Camera Hole Punch */}
          <div className="w-4 h-4 rounded-full bg-black ring-1 ring-slate-800 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-950/80" />
          </div>

          {/* Network, 5G, Battery */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-[10px] font-mono font-bold text-sky-400">5G</span>
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-mono font-medium">98%</span>
              <BatteryMedium className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 flex flex-col relative overflow-y-auto no-scrollbar pb-24">
          {children}
        </div>

        {/* Android Navigation Gesture Indicator */}
        <div className="w-full pb-2 pt-1 flex justify-center bg-[#030817] z-40 select-none">
          <div className="w-32 h-1 bg-slate-600/70 rounded-full" />
        </div>
      </div>
    </div>
  );
};
