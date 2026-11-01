import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { cosmicAudio } from '../services/audioSynthesizer';
import { MusicTrack, MusicPlaylist } from '../types';
import {
  Music2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Repeat,
  Shuffle,
  Plus,
  Upload,
  Image as ImageIcon,
  X,
  Trash2,
  FileAudio,
  AlertCircle,
  Heart,
  Search,
  RefreshCw,
  FolderPlus,
  ListMusic,
  CheckCircle,
  Sliders,
  Disc,
} from 'lucide-react';

export const MusicSection: React.FC = () => {
  const {
    playlist,
    currentTrackIndex,
    isPlayingMusic,
    togglePlayMusic,
    playTrack,
    nextTrack,
    prevTrack,
    musicVolume,
    setMusicVolume,
    toggleFavoriteTrack,
    addMusicTrack,
    batchImportMusicFiles,
    deleteUserMusic,
    musicPlaylists,
    createPlaylist,
    addTrackToPlaylist,
    refreshMusicLibrary,
  } = useApp();

  // Tab state: 'player' | 'library' | 'playlists' | 'favorites'
  const [activeTab, setActiveTab] = useState<'player' | 'library' | 'playlists' | 'favorites'>('player');

  // Equalizer visualizer
  const [bars, setBars] = useState<number[]>(new Array(16).fill(20));
  const [spatialMode, setSpatialMode] = useState<'432hz' | '528hz' | 'deep_focus' | 'surround'>('432hz');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState<MusicTrack | null>(null);

  // Single track add form
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackAlbum, setTrackAlbum] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Playlist creation form
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

  // Batch import & refresh indicators
  const multiFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentTrack: MusicTrack | undefined = playlist[currentTrackIndex] || playlist[0];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Live visualizer effect from Web Audio API
  useEffect(() => {
    let animId: number;
    const update = () => {
      if (isPlayingMusic) {
        const data = cosmicAudio.getVisualizerData();
        const newBars = [];
        for (let i = 0; i < 16; i++) {
          const val = data[i * 2] || 0;
          newBars.push(Math.max(12, (val / 255) * 100));
        }
        setBars(newBars);
      } else {
        setBars(new Array(16).fill(15));
      }
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [isPlayingMusic]);

  // Single audio file selection
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/x-wav',
        'audio/m4a',
        'audio/x-m4a',
        'audio/aac',
      ];
      const extension = file.name.split('.').pop()?.toLowerCase();
      const isValidExt = ['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(extension || '');

      if (!file.type.startsWith('audio/') && !isValidExt) {
        setFormError('Format non supporté. Veuillez choisir un fichier MP3, WAV ou M4A.');
        return;
      }

      setAudioFile(file);
      setFormError('');
      if (!trackTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        if (cleanName.includes(' - ')) {
          const parts = cleanName.split(' - ');
          setTrackArtist(parts[0].trim());
          setTrackTitle(parts.slice(1).join(' - ').trim());
        } else {
          setTrackTitle(cleanName);
        }
      }
      if (!trackArtist) {
        setTrackArtist('Artiste Local');
      }
    }
  };

  // Cover image selection
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormError('Veuillez choisir un fichier image pour la pochette.');
        return;
      }
      setCoverFile(file);
      const url = URL.createObjectURL(file);
      setCoverPreviewUrl(url);
    }
  };

  // Single track add submit
  const handleAddMusicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      setFormError('Veuillez sélectionner un fichier audio (MP3, WAV ou M4A).');
      return;
    }
    if (!trackTitle.trim() || !trackArtist.trim()) {
      setFormError('Veuillez renseigner le titre et le nom de l’artiste.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await addMusicTrack({
        title: trackTitle.trim(),
        artist: trackArtist.trim(),
        album: trackAlbum.trim() || 'Morceau Importé',
        audioFile,
        coverFile: coverFile || undefined,
      });

      // Reset
      setAudioFile(null);
      setCoverFile(null);
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
      setCoverPreviewUrl(null);
      setTrackTitle('');
      setTrackArtist('');
      setTrackAlbum('');
      setShowAddModal(false);
      setActiveTab('player');
      triggerToast('Morceau ajouté à votre bibliothèque avec succès !');
    } catch (err: any) {
      setFormError("Erreur lors de l'enregistrement de la musique : " + (err.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Multi-file batch scan / import from phone
  const handleBatchImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      triggerToast(`Importation de ${files.length} fichier(s) en cours...`);
      try {
        const count = await batchImportMusicFiles(files);
        triggerToast(`${count} morceau(x) importé(s) dans votre bibliothèque !`);
        setActiveTab('library');
      } catch (err: any) {
        triggerToast(`Erreur d'importation : ${err.message || 'Inconnue'}`);
      }
      // Reset input value to allow re-importing the same files if needed
      e.target.value = '';
    }
  };

  // Refresh library
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshMusicLibrary();
      triggerToast('Bibliothèque actualisée avec succès !');
    } catch {
      triggerToast('Erreur lors de l’actualisation.');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Playlist creation submit
  const handleCreatePlaylistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    setIsCreatingPlaylist(true);
    try {
      await createPlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setShowCreatePlaylistModal(false);
      triggerToast('Nouvelle playlist créée !');
    } catch {
      triggerToast('Erreur lors de la création de la playlist.');
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  // Filtered tracks based on tab and search
  const filteredTracks = useMemo(() => {
    let list = playlist;

    if (activeTab === 'favorites') {
      list = list.filter((t) => t.isFavorite);
    } else if (activeTab === 'playlists' && selectedPlaylistId) {
      const pl = musicPlaylists.find((p) => p.id === selectedPlaylistId);
      if (pl) {
        const trackIds = new Set(pl.trackIds);
        list = list.filter((t) => trackIds.has(t.id));
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          (t.album && t.album.toLowerCase().includes(q))
      );
    }

    return list;
  }, [playlist, activeTab, selectedPlaylistId, musicPlaylists, searchQuery]);

  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-6 animate-fade-in">
      {/* Hidden Multi-file input for Phone scan */}
      <input
        ref={multiFileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
        className="hidden"
        onChange={handleBatchImportChange}
      />

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <Music2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white font-brand">NOVA MUSIQUE</h2>
          </div>
          <p className="text-xs text-slate-400">Audio spatial & Bibliothèque locale Congo</p>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-1.5">
          {/* Actualiser */}
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-xl bg-slate-900 border border-sky-500/30 text-sky-300 hover:text-white transition-all active:scale-95 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Actualiser la bibliothèque"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Scanner le téléphone */}
          <button
            onClick={() => multiFileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 text-xs font-semibold active:scale-95 transition-all"
            title="Scanner et importer plusieurs morceaux du téléphone"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scanner</span>
          </button>

          {/* Ajouter un morceau manuellement */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#1677FF] to-[#00F0FF] text-white hover:text-slate-950 font-bold text-xs shadow-[0_0_12px_#1677FF] active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {toastMessage && (
        <div className="p-3 rounded-2xl bg-[#1677FF]/90 border border-sky-400 text-white text-xs font-medium flex items-center gap-2 shadow-xl animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-2xl border border-sky-500/20 backdrop-blur-md">
        <button
          onClick={() => {
            setActiveTab('player');
            setSelectedPlaylistId(null);
          }}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'player'
              ? 'bg-[#1677FF] text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Lecteur
        </button>
        <button
          onClick={() => {
            setActiveTab('library');
            setSelectedPlaylistId(null);
          }}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'library'
              ? 'bg-[#1677FF] text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Titres ({playlist.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('favorites');
            setSelectedPlaylistId(null);
          }}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'favorites'
              ? 'bg-[#1677FF] text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Favoris
        </button>
        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'playlists'
              ? 'bg-[#1677FF] text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Playlists
        </button>
      </div>

      {/* Search Bar for Library / Playlists / Favorites */}
      {activeTab !== 'player' && (
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un morceau, artiste, album..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F0FF]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ================================================= */}
      {/* TAB 1: COSMIC AUDIO PLAYER */}
      {/* ================================================= */}
      {activeTab === 'player' && currentTrack && (
        <>
          {/* Rotating Holographic Vinyl / Album Artwork */}
          <div className="relative flex flex-col items-center justify-center py-2">
            <div className="relative w-52 h-52 rounded-full p-2 bg-gradient-to-tr from-[#1677FF]/40 via-purple-600/30 to-cyan-400/40 border-2 border-sky-400/40 shadow-[0_0_40px_rgba(22,119,255,0.35)] flex items-center justify-center">
              <div
                className={`w-full h-full rounded-full overflow-hidden relative flex items-center justify-center ${
                  isPlayingMusic ? 'animate-spin-slow' : ''
                }`}
                style={{ animationDuration: '20s' }}
              >
                <img
                  src={currentTrack.coverArt}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.5px]" />
                {/* Center Vinyl Hole */}
                <div className="absolute w-16 h-16 rounded-full bg-[#030817] border-2 border-cyan-400 flex flex-col items-center justify-center shadow-inner">
                  <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[7px] font-mono text-cyan-300 mt-0.5">NOVA</span>
                </div>
              </div>
            </div>

            {/* Title, Artist & Like Button */}
            <div className="mt-4 text-center px-4 w-full flex flex-col items-center">
              <div className="flex items-center justify-center gap-2 max-w-full">
                <h3 className="text-base font-extrabold text-white font-brand tracking-tight truncate">
                  {currentTrack.title}
                </h3>
                <button
                  onClick={() => toggleFavoriteTrack(currentTrack.id)}
                  className="p-1 rounded-full text-slate-400 hover:text-rose-400 active:scale-125 transition-all"
                  title="Ajouter aux favoris"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      currentTrack.isFavorite
                        ? 'fill-rose-500 text-rose-500'
                        : 'text-slate-400 hover:text-rose-400'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-sky-300 font-medium mt-0.5 truncate">{currentTrack.artist}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-[10px] text-purple-300 font-mono">
                <Radio className="w-3 h-3 text-purple-400" />
                <span>
                  {currentTrack.isUserUploaded ? 'Fichier Audio Importé' : currentTrack.mood}
                </span>
              </div>
            </div>
          </div>

          {/* Equalizer Frequency Bars */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-end justify-between h-14 gap-1 px-4">
            {bars.map((h, i) => (
              <div
                key={i}
                className="w-full rounded-full bg-gradient-to-t from-[#1677FF] via-cyan-400 to-[#00F0FF] transition-all duration-75"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          {/* Player Controls Container */}
          <div className="p-4 rounded-3xl bg-[#071330]/80 border border-sky-500/20 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
              <span>{isPlayingMusic ? 'Lecture en cours' : 'En pause'}</span>
              <span>
                {Math.floor(currentTrack.duration / 60)}:
                {(currentTrack.duration % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-5">
              <div
                className={`h-full bg-gradient-to-r from-[#1677FF] to-[#00F0FF] ${
                  isPlayingMusic ? 'w-1/2 animate-pulse' : 'w-0'
                }`}
              />
            </div>

            {/* Buttons Row */}
            <div className="flex items-center justify-between px-3">
              <button
                className="text-slate-400 hover:text-white transition-colors"
                title="Lecture aléatoire"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={prevTrack}
                className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all active:scale-95"
                aria-label="Morceau précédent"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Main Play / Pause Button */}
              <button
                onClick={togglePlayMusic}
                className="p-4 rounded-full bg-gradient-to-tr from-[#1677FF] to-[#00F0FF] text-white shadow-[0_0_20px_#1677FF] hover:scale-105 active:scale-95 transition-all"
                aria-label={isPlayingMusic ? 'Pause' : 'Lecture'}
              >
                {isPlayingMusic ? (
                  <Pause className="w-6 h-6 fill-white" />
                ) : (
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                )}
              </button>

              <button
                onClick={nextTrack}
                className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all active:scale-95"
                aria-label="Morceau suivant"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <button
                className="text-slate-400 hover:text-white transition-colors"
                title="Répéter le morceau"
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-800 px-2">
              {musicVolume === 0 ? (
                <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
              ) : (
                <Volume2 className="w-4 h-4 text-sky-400 shrink-0" />
              )}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#1677FF]"
              />
              <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                {Math.round(musicVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Spatial Audio Selector */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00F0FF]" />
              <span className="text-xs font-semibold text-slate-200">Mode Fréquence Cosmique</span>
            </div>
            <div className="flex gap-1">
              {[
                { id: '432hz', label: '432 Hz' },
                { id: '528hz', label: '528 Hz' },
                { id: 'deep_focus', label: 'Focus' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSpatialMode(m.id as any)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-colors ${
                    spatialMode === m.id
                      ? 'bg-[#1677FF] text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ================================================= */}
      {/* TAB 2 & 4: TITRES (LIBRARY) & FAVORIS */}
      {/* ================================================= */}
      {(activeTab === 'library' || activeTab === 'favorites') && (
        <div className="space-y-3">
          {/* Quick Info & Stats */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              {activeTab === 'favorites' ? 'Mes Favoris' : 'Tous les morceaux'} :{' '}
              {filteredTracks.length} titre(s)
            </span>
            {activeTab === 'library' && (
              <button
                onClick={() => multiFileInputRef.current?.click()}
                className="text-[#00F0FF] hover:underline flex items-center gap-1 text-[11px]"
              >
                <Upload className="w-3 h-3" />
                <span>Importer en lot</span>
              </button>
            )}
          </div>

          {filteredTracks.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-3xl bg-slate-900/40 border border-slate-800">
              <Disc className="w-10 h-10 text-slate-500 mx-auto mb-2 animate-spin-slow" />
              <h4 className="text-sm font-bold text-white">Aucun morceau trouvé</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {activeTab === 'favorites'
                  ? "Vous n'avez pas encore ajouté de morceau aux favoris. Cliquez sur le cœur pour en ajouter !"
                  : "Aucun fichier audio correspondant. Utilisez le bouton « Ajouter » ou « Scanner » pour importer vos fichiers MP3 du téléphone."}
              </p>
              {activeTab === 'library' && (
                <button
                  onClick={() => multiFileInputRef.current?.click()}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#1677FF] text-white text-xs font-bold shadow-md hover:bg-[#00F0FF] hover:text-slate-950 transition-colors"
                >
                  Sélectionner des MP3 / WAV
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTracks.map((track) => {
                const globalIndex = playlist.findIndex((t) => t.id === track.id);
                const isCurrent = currentTrackIndex === globalIndex;
                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      if (globalIndex !== -1) playTrack(globalIndex);
                      setActiveTab('player');
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-r from-purple-950/80 to-slate-900 border border-purple-400/50 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                        : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                        <img
                          src={track.coverArt}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                        {isCurrent && isPlayingMusic && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-[#00F0FF] animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="truncate">
                        <h4
                          className={`text-xs font-bold truncate ${
                            isCurrent ? 'text-white' : 'text-slate-200'
                          }`}
                        >
                          {track.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[9px] font-mono text-slate-500">
                          {track.isUserUploaded ? (
                            <span className="text-emerald-400">Fichier Téléphone</span>
                          ) : (
                            <span>{track.album || 'NOVA Universe'}</span>
                          )}
                          <span>•</span>
                          <span>
                            {Math.floor(track.duration / 60)}:
                            {(track.duration % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteTrack(track.id);
                        }}
                        className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Favori"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            track.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                      </button>

                      {/* Add to Playlist Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddToPlaylistModal(track);
                        }}
                        className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-purple-300 transition-colors"
                        title="Ajouter à une playlist"
                      >
                        <ListMusic className="w-4 h-4" />
                      </button>

                      {/* Play Status */}
                      <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                        {isCurrent && isPlayingMusic ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                      </div>

                      {/* Delete user track */}
                      {track.isUserUploaded && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Supprimer définitivement ${track.title} ?`)) {
                              deleteUserMusic(track.id);
                              triggerToast('Morceau supprimé.');
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Supprimer le morceau"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================= */}
      {/* TAB 3: PLAYLISTS MANAGEMENT */}
      {/* ================================================= */}
      {activeTab === 'playlists' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-brand flex items-center gap-1.5">
              <ListMusic className="w-4 h-4 text-purple-400" />
              <span>Mes Playlists Personnalisées</span>
            </h3>
            <button
              onClick={() => setShowCreatePlaylistModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 text-xs font-semibold active:scale-95 transition-all"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Créer</span>
            </button>
          </div>

          {/* Playlist Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            {musicPlaylists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => {
                  setSelectedPlaylistId(pl.id);
                  setActiveTab('library');
                }}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-400/50 cursor-pointer group transition-all"
              >
                <div className="w-full aspect-video rounded-xl bg-gradient-to-tr from-purple-900/60 to-indigo-900/60 border border-purple-500/20 mb-2.5 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform">
                  <ListMusic className="w-8 h-8" />
                </div>
                <h4 className="text-xs font-bold text-white truncate">{pl.name}</h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {pl.description || `${pl.trackIds.length} titre(s)`}
                </p>
                <span className="inline-block mt-2 text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  {pl.trackIds.length} morceaux
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* MODAL 1: AJOUTER UNE MUSIQUE MANUELLEMENT */}
      {/* ================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#071330] border border-purple-500/40 rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                  <Music2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white font-brand">Ajouter une musique</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddMusicSubmit} className="space-y-3.5">
              {/* Audio File Input */}
              <div>
                <label className="text-[11px] font-semibold text-purple-200 block mb-1.5">
                  Fichier Audio (MP3, WAV, M4A)
                </label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-purple-500/40 hover:border-purple-400 rounded-2xl cursor-pointer bg-slate-900/60 transition-colors p-2 text-center">
                  {audioFile ? (
                    <div className="flex items-center gap-2 text-emerald-300 text-xs">
                      <FileAudio className="w-5 h-5" />
                      <span className="font-semibold truncate max-w-[200px]">{audioFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="w-5 h-5 text-purple-400 mb-1" />
                      <p className="text-xs text-white font-medium">Sélectionner un fichier audio</p>
                      <p className="text-[10px] text-slate-400">Formats : .mp3, .wav, .m4a</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="audio/mp3,audio/wav,audio/m4a,audio/*,.mp3,.wav,.m4a"
                    className="hidden"
                    onChange={handleAudioChange}
                  />
                </label>
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Titre du morceau
                </label>
                <input
                  type="text"
                  required
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                  placeholder="ex: Rumba Océan, Brazza Vibes..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Artist */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Nom de l'artiste
                </label>
                <input
                  type="text"
                  required
                  value={trackArtist}
                  onChange={(e) => setTrackArtist(e.target.value)}
                  placeholder="ex: Extra Musica, Fally, Youlou..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Album / Catégorie */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Album ou Catégorie (optionnel)
                </label>
                <input
                  type="text"
                  value={trackAlbum}
                  onChange={(e) => setTrackAlbum(e.target.value)}
                  placeholder="ex: Rumba Congolaise, Afrobeat, Acoustique..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Cover Art Image */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                  Pochette du morceau (optionnelle)
                </label>
                <label className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-400 cursor-pointer">
                  {coverPreviewUrl ? (
                    <img
                      src={coverPreviewUrl}
                      alt="Pochette"
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <span className="text-xs text-slate-300 truncate">
                    {coverFile ? coverFile.name : 'Choisir une image de couverture'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !audioFile}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-[#1677FF] text-white font-bold text-xs shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-40 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Enregistrement dans la bibliothèque...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Ajouter à ma bibliothèque</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* MODAL 2: CRÉER UNE NOUVELLE PLAYLIST */}
      {/* ================================================= */}
      {showCreatePlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#071330] border border-purple-500/40 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white font-brand">Nouvelle Playlist</h3>
              </div>
              <button
                onClick={() => setShowCreatePlaylistModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylistSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Nom de la playlist
                </label>
                <input
                  type="text"
                  required
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="ex: Soirée Pointe-Noire, Focus Mathématiques..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="ex: Les meilleurs sons pour travailler ou se détendre..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingPlaylist || !newPlaylistName.trim()}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Créer la playlist</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* MODAL 3: AJOUTER UN MORCEAU À UNE PLAYLIST */}
      {/* ================================================= */}
      {showAddToPlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#071330] border border-purple-500/40 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                  <ListMusic className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white font-brand">Ajouter à une playlist</h3>
              </div>
              <button
                onClick={() => setShowAddToPlaylistModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3 truncate">
              Morceau : <span className="text-white font-bold">{showAddToPlaylistModal.title}</span>
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {musicPlaylists.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Aucune playlist existante. Créez-en une d'abord !
                </p>
              ) : (
                musicPlaylists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => {
                      addTrackToPlaylist(pl.id, showAddToPlaylistModal.id);
                      triggerToast(`Ajouté à la playlist "${pl.name}"`);
                      setShowAddToPlaylistModal(null);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-400/50 text-left transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{pl.name}</p>
                      <p className="text-[10px] text-slate-400">{pl.trackIds.length} morceaux</p>
                    </div>
                    <Plus className="w-4 h-4 text-purple-300" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
