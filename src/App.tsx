/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileFrame } from './components/common/MobileFrame';
import { TopBar } from './components/navigation/TopBar';
import { BottomNav } from './components/navigation/BottomNav';
import { MiniMusicPlayer } from './components/common/MiniMusicPlayer';
import { SearchModal } from './components/modals/SearchModal';
import { NotificationModal } from './components/modals/NotificationModal';
import { ProfileModal } from './components/modals/ProfileModal';

// 9 Main Sections
import { HomeSection } from './sections/HomeSection';
import { AiSection } from './sections/AiSection';
import { WeatherSection } from './sections/WeatherSection';
import { ShortsSection } from './sections/ShortsSection';
import { MusicSection } from './sections/MusicSection';
import { SchoolSection } from './sections/SchoolSection';
import { ChatSection } from './sections/ChatSection';
import { PlannerSection } from './sections/PlannerSection';
import { NotesSection } from './sections/NotesSection';

const MainContent: React.FC = () => {
  const { activeSection, isImmersiveWatchMode } = useApp();

  const isShortsWatching = activeSection === 'shorts' && isImmersiveWatchMode;

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection />;
      case 'ai':
        return <AiSection />;
      case 'weather':
        return <WeatherSection />;
      case 'shorts':
        return <ShortsSection />;
      case 'music':
        return <MusicSection />;
      case 'school':
        return <SchoolSection />;
      case 'chat':
        return <ChatSection />;
      case 'planner':
        return <PlannerSection />;
      case 'notes':
        return <NotesSection />;
      default:
        return <HomeSection />;
    }
  };

  return (
    <MobileFrame>
      {/* Top Header - hidden during immersive shorts watching */}
      {!isShortsWatching && <TopBar />}

      {/* Dynamic Main View */}
      <main className="flex-1 w-full">
        {renderSection()}
      </main>

      {/* Persistent Mini Music Player - hidden during immersive shorts watching */}
      {!isShortsWatching && <MiniMusicPlayer />}

      {/* Bottom Floating Navigation Dock - hidden during immersive shorts watching */}
      {!isShortsWatching && <BottomNav />}

      {/* Global Modals */}
      <SearchModal />
      <NotificationModal />
      <ProfileModal />
    </MobileFrame>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
