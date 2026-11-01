import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { cosmicAudio } from '../../services/audioSynthesizer';
import { Play, Pause, SkipForward, Music } from 'lucide-react';

export const MiniMusicPlayer: React.FC = () => {
  const {
    playlist,
    currentTrackIndex,
    isPlayingMusic,
    togglePlayMusic,
    nextTrack,
    activeSection,
    setActiveSection,
  } = useApp();

  const [bars, setBars] = useState<number[]>([40, 60, 30, 80, 50]);

  // Audio animation ticker
  useEffect(() => {
    let animId: number;
    const updateBars = () => {
      if (isPlayingMusic) {
        const data = cosmicAudio.getVisualizerData();
        if (data.length >= 5) {
          setBars([
            Math.max(15, (data[2] / 255) * 100),
            Math.max(15, (data[4] / 255) * 100),
            Math.max(15, (data[6] / 255) * 100),
            Math.max(15, (data[8] / 255) * 100),
            Math.max(15, (data[10] / 255) * 100),
          ]);
        }
      }
      animId = requestAnimationFrame(updateBars);
    };
    animId = requestAnimationFrame(updateBars);
    return () => cancelAnimationFrame(animId);
  }, [isPlayingMusic]);

  // Don't show floating mini player if currently in full music section or if music is not playing
  if (activeSection === 'music' || !isPlayingMusic) {
    return null;
  }

  const currentTrack = playlist[currentTrackIndex] || playlist[0];
  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-30 px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div
          onClick={() => setActiveSection('music')}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-[#091535]/90 border border-sky-400/30 backdrop-blur-xl shadow-[0_8px_25px_rgba(22,119,255,0.3)] cursor-pointer hover:border-sky-400 transition-all group"
        >
          {/* Cover & Title */}
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-sky-500/40">
              <img
                src={currentTrack.coverArt}
                alt={currentTrack.title}
                className="w-full h-full object-cover animate-spin-slow group-hover:scale-110 transition-transform"
                style={{ animationDuration: '16s' }}
              />
              <div className="absolute inset-0 bg-sky-900/20 backdrop-blur-[1px]" />
              <Music className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow" />
            </div>

            <div className="truncate">
              <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
              <p className="text-[10px] text-sky-300/80 truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Controls & Mini Visualizer */}
          <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            {/* Visualizer bars */}
            <div className="flex items-end gap-0.5 h-4 px-1.5">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-[#1677FF] to-[#00F0FF] rounded-full transition-all duration-75"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            {/* Play/Pause */}
            <button
              onClick={togglePlayMusic}
              className="p-2 rounded-xl bg-[#1677FF] hover:bg-[#00F0FF] text-white hover:text-slate-900 transition-all shadow-[0_0_10px_#1677FF] active:scale-95"
              aria-label={isPlayingMusic ? 'Mettre en pause' : 'Lecture'}
            >
              {isPlayingMusic ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            {/* Next */}
            <button
              onClick={nextTrack}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Piste suivante"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
