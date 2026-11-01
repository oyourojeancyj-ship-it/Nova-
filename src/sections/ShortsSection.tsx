import React, { useState, useRef, useEffect, TouchEvent } from 'react';
import { useApp } from '../context/AppContext';
import { novaStorage } from '../services/storageDb';
import { ShortComment, ShortVideo } from '../types';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Plus,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  X,
  Send,
  Sparkles,
  Upload,
  Video,
  Trash2,
  Hash,
  AlertCircle,
  ArrowLeft,
  Film,
  Layers,
  Image as ImageIcon,
  CheckCircle,
  Eye,
} from 'lucide-react';

export const ShortsSection: React.FC = () => {
  const {
    shortsList,
    currentShortIndex,
    setCurrentShortIndex,
    shortsSubTab,
    setShortsSubTab,
    isImmersiveWatchMode,
    setIsImmersiveWatchMode,
    toggleLikeShort,
    toggleFavoriteShort,
    publishShort,
    deleteUserShort,
    userProfile,
  } = useApp();

  // Playback & Interaction state
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [shareToast, setShareToast] = useState(false);
  const [commentsMap, setCommentsMap] = useState<Record<string, ShortComment[]>>({});
  const [videoError, setVideoError] = useState<Record<string, boolean>>({});

  // Touch swipe handling
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Publish Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [publishTitle, setPublishTitle] = useState('');
  const [publishDescription, setPublishDescription] = useState('');
  const [publishHashtags, setPublishHashtags] = useState('#congo #pointenoire #nova');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [publishSuccessToast, setPublishSuccessToast] = useState(false);

  const currentShort: ShortVideo | undefined = shortsList[currentShortIndex] || shortsList[0];
  const userShorts = shortsList.filter((s) => s.userUploaded);

  // Load comments for current short
  useEffect(() => {
    if (currentShort) {
      novaStorage.getCommentsForShort(currentShort.id).then((storedComments) => {
        if (storedComments.length > 0) {
          setCommentsMap((prev) => ({ ...prev, [currentShort.id]: storedComments }));
        } else {
          const initialDefaultComments: ShortComment[] = [
            {
              id: 'c-init-1',
              author: 'Kévin M. (Pointe-Noire)',
              text: 'Superbe prise de vue ! La Côte Sauvage est magnifique au crépuscule.',
              time: 'Il y a 25 min',
            },
            {
              id: 'c-init-2',
              author: 'Grace T. (Brazzaville)',
              text: 'Cette appli NOVA est super fluide au Congo ! Bravo.',
              time: 'Il y a 1h',
            },
          ];
          setCommentsMap((prev) => ({ ...prev, [currentShort.id]: initialDefaultComments }));
        }
      });
    }
  }, [currentShort]);

  // Video playback management on index change or when entering immersive watch mode
  useEffect(() => {
    setIsPaused(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        setIsMuted(true);
      });
    }
  }, [currentShortIndex, isImmersiveWatchMode]);

  // Touch Swipe Handlers for vertical navigation
  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null || touchEndY.current === null) return;
    const distance = touchStartY.current - touchEndY.current;

    // Swipe threshold 45px
    if (distance > 45) {
      handleNext();
    } else if (distance < -45) {
      handlePrev();
    }

    touchStartY.current = null;
    touchEndY.current = null;
  };

  const handleNext = () => {
    if (currentShortIndex < shortsList.length - 1) {
      setCurrentShortIndex(currentShortIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentShortIndex > 0) {
      setCurrentShortIndex(currentShortIndex - 1);
    }
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    videoRef.current.muted = nextMute;
    setIsMuted(nextMute);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share && currentShort) {
      try {
        await navigator.share({
          title: currentShort.title,
          text: `${currentShort.description} — sur NOVA Univers`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard?.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2200);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentShort) return;

    const newComment: ShortComment = {
      id: `comm-${Date.now()}`,
      author: userProfile.name,
      text: commentInput.trim(),
      time: "À l'instant",
    };

    await novaStorage.saveComment(currentShort.id, newComment);
    setCommentsMap((prev) => ({
      ...prev,
      [currentShort.id]: [newComment, ...(prev[currentShort.id] || [])],
    }));
    setCommentInput('');
  };

  // Video file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setPublishError('Veuillez sélectionner un fichier vidéo valide (MP4, WebM, MOV).');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
      setPublishError('');
      if (!publishTitle) {
        setPublishTitle(file.name.replace(/\.[^/.]+$/, '').slice(0, 40));
      }
    }
  };

  // Thumbnail file selection
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setPublishError('Veuillez sélectionner un fichier image valide pour la miniature.');
        return;
      }
      setThumbnailFile(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreviewUrl(url);
    }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setPublishError('Veuillez sélectionner une vidéo depuis votre galerie.');
      return;
    }
    if (!publishTitle.trim() || !publishDescription.trim()) {
      setPublishError('Veuillez renseigner un titre et une description.');
      return;
    }

    setIsPublishing(true);
    setPublishError('');

    try {
      const tagsArray = publishHashtags
        .split(' ')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .map((t) => (t.startsWith('#') ? t : `#${t}`));

      await publishShort({
        title: publishTitle.trim(),
        description: publishDescription.trim(),
        hashtags: tagsArray,
        videoFile: selectedFile,
        thumbnailFile: thumbnailFile || undefined,
        creator: userProfile.name,
      });

      // Reset form
      setSelectedFile(null);
      setThumbnailFile(null);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
      setVideoPreviewUrl(null);
      setThumbnailPreviewUrl(null);
      setPublishTitle('');
      setPublishDescription('');

      setPublishSuccessToast(true);
      setTimeout(() => setPublishSuccessToast(false), 3000);

      // Switch to watch mode directly with the newly published video
      setShortsSubTab('watch');
      setIsImmersiveWatchMode(true);
    } catch (err: any) {
      setPublishError("Erreur lors de l'enregistrement de la vidéo : " + (err.message || ''));
    } finally {
      setIsPublishing(false);
    }
  };

  const activeComments = currentShort ? commentsMap[currentShort.id] || [] : [];

  // ==========================================
  // CASE 1: FULLSCREEN 9:16 IMMERSIVE WATCH MODE
  // ==========================================
  if (isImmersiveWatchMode && currentShort) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Full 9:16 Video Canvas */}
        <div
          onClick={handleTogglePlay}
          className="relative w-full h-full max-w-[480px] mx-auto flex items-center justify-center overflow-hidden bg-black cursor-pointer"
        >
          {currentShort.videoUrl && !videoError[currentShort.id] ? (
            <video
              ref={videoRef}
              src={currentShort.videoUrl}
              className="w-full h-full object-cover"
              playsInline
              loop
              autoPlay
              muted={isMuted}
              onError={() => {
                setVideoError((prev) => ({ ...prev, [currentShort.id]: true }));
              }}
            />
          ) : (
            /* Cosmic Fallback Canvas */
            <div
              className={`w-full h-full flex flex-col items-center justify-center p-6 text-center ${
                currentShort.visualTheme === 'nebula'
                  ? 'bg-gradient-to-b from-[#12052b] via-[#3d1266] to-[#04010b]'
                  : currentShort.visualTheme === 'cyberpunk'
                  ? 'bg-gradient-to-b from-[#031526] via-[#0d4777] to-[#010811]'
                  : currentShort.visualTheme === 'aurora'
                  ? 'bg-gradient-to-b from-[#031c15] via-[#0b5c46] to-[#010906]'
                  : 'bg-gradient-to-b from-[#21092e] via-[#521b4a] to-[#09020e]'
              }`}
            >
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:16px_16px] animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-[#00F0FF] animate-spin-slow" />
              </div>
              <h3 className="text-lg font-bold text-white z-10 px-4">{currentShort.title}</h3>
              <p className="text-xs text-slate-300 z-10 mt-1">{currentShort.creator}</p>
            </div>
          )}

          {/* Holographic Play/Pause Icon */}
          {isPaused && (
            <div className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-2xl pointer-events-none">
              <Play className="w-10 h-10 fill-white ml-1.5" />
            </div>
          )}

          {/* CRITICAL: ONLY TOP-LEFT RETURN ARROW AS REQUESTED */}
          <div className="absolute top-4 left-4 z-40 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsImmersiveWatchMode(false);
              }}
              className="p-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 active:scale-90 shadow-xl transition-all"
              aria-label="Retour à l'écran NOVA"
              title="Retour à l'écran normal"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Minimal Current Short Counter & Mute Icon Top Right */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2 pointer-events-auto">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-sky-300 border border-sky-500/30 shadow-md">
              {currentShortIndex + 1}/{shortsList.length}
            </span>
            <button
              onClick={handleToggleMute}
              className="p-2.5 rounded-full bg-black/60 text-sky-300 border border-sky-500/30 backdrop-blur-md active:scale-95"
              title={isMuted ? 'Activer le son' : 'Couper le son'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>
          </div>

          {/* Navigation Arrows for desktop or tap scrolling */}
          <div className="absolute right-4 top-20 z-20 flex flex-col gap-2 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              disabled={currentShortIndex === 0}
              className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md disabled:opacity-20 border border-white/20 active:scale-90 shadow"
              aria-label="Short précédent"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              disabled={currentShortIndex === shortsList.length - 1}
              className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md disabled:opacity-20 border border-white/20 active:scale-90 shadow"
              aria-label="Short suivant"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Right Interaction Rail (J'aime, Commentaires, Favoris, Partager) */}
          <div className="absolute right-4 bottom-20 z-30 flex flex-col items-center gap-4 pointer-events-auto">
            {/* J'aime */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLikeShort(currentShort.id);
              }}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className={`p-3.5 rounded-full backdrop-blur-md border transition-transform active:scale-125 ${
                  currentShort.isLiked
                    ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_#F43F5E]'
                    : 'bg-black/60 text-white border-white/20 group-hover:bg-rose-500/20'
                }`}
              >
                <Heart className={`w-6 h-6 ${currentShort.isLiked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[11px] font-mono font-bold text-white drop-shadow">
                {(currentShort.likes / 1000).toFixed(1)}k
              </span>
            </button>

            {/* Commentaires */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(true);
              }}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="p-3.5 rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-md group-hover:bg-sky-500/20 transition-all active:scale-95">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono font-bold text-white drop-shadow">
                {activeComments.length || currentShort.commentsCount}
              </span>
            </button>

            {/* Favoris */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavoriteShort(currentShort.id);
              }}
              className="flex flex-col items-center gap-1 group"
              title="Ajouter aux favoris"
            >
              <div
                className={`p-3.5 rounded-full backdrop-blur-md border transition-transform active:scale-125 ${
                  currentShort.isFavorited
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_20px_#F59E0B]'
                    : 'bg-black/60 text-white border-white/20 group-hover:bg-amber-500/20'
                }`}
              >
                <Bookmark
                  className={`w-6 h-6 ${currentShort.isFavorited ? 'fill-current' : ''}`}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-white drop-shadow">
                Favoris
              </span>
            </button>

            {/* Partager */}
            <button onClick={handleShare} className="flex flex-col items-center gap-1 group">
              <div className="p-3.5 rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-md group-hover:bg-emerald-500/20 transition-all active:scale-95">
                <Share2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono font-bold text-white drop-shadow">
                Partager
              </span>
            </button>

            {/* Delete button if uploaded by user */}
            {currentShort.userUploaded && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Voulez-vous supprimer ce Short de vos publications ?')) {
                    deleteUserShort(currentShort.id);
                  }
                }}
                className="p-3 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 backdrop-blur-md hover:bg-rose-600 hover:text-white transition-colors"
                title="Supprimer mon short"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Bottom Video Metadata Overlay */}
          <div className="absolute left-0 right-20 bottom-4 z-20 p-5 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-auto">
            <div className="flex items-center gap-2.5 mb-2">
              <img
                src={currentShort.creatorAvatar}
                alt={currentShort.creator}
                className="w-9 h-9 rounded-full border border-sky-400 object-cover"
              />
              <div>
                <h4 className="text-sm font-bold text-white leading-tight font-brand flex items-center gap-1.5">
                  <span>{currentShort.creator}</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
                </h4>
                <span className="text-[10px] text-sky-300/80">Pointe-Noire · Congo</span>
              </div>
            </div>

            <p className="text-xs text-slate-100 font-medium leading-snug line-clamp-2 mb-2">
              {currentShort.description}
            </p>

            {/* Hashtags */}
            {currentShort.hashtags && currentShort.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {currentShort.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono text-[#00F0FF] bg-sky-950/70 px-2 py-0.5 rounded border border-sky-500/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Audio Track Ticker */}
            <div className="flex items-center gap-2 text-[10px] text-sky-200 bg-sky-950/50 border border-sky-500/30 px-3 py-1 rounded-full w-fit max-w-full backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">{currentShort.audioTrack}</span>
            </div>
          </div>
        </div>

        {/* Comments Drawer Sheet */}
        {showComments && (
          <div className="fixed inset-x-0 bottom-0 top-1/4 z-50 max-w-md mx-auto bg-[#071129]/95 border-t border-sky-500/30 rounded-t-3xl p-4 flex flex-col backdrop-blur-2xl">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white font-brand">
                Commentaires ({activeComments.length})
              </h4>
              <button
                onClick={() => setShowComments(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 py-1">
              {activeComments.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">
                  Aucun commentaire pour le moment. Soyez le premier à commenter !
                </p>
              ) : (
                activeComments.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-sky-300">{c.author}</span>
                      <span className="text-[10px] text-slate-500">{c.time}</span>
                    </div>
                    <p className="text-xs text-slate-200">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="relative mt-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Écrire un commentaire..."
                className="w-full pl-3 pr-10 py-2.5 bg-slate-900 border border-sky-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-[#00F0FF]"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="absolute right-2 top-2 p-1 text-[#00F0FF] hover:text-white disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Share Toast */}
        {shareToast && (
          <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-[#1677FF] text-white text-xs font-bold shadow-2xl border border-sky-300/40">
            Lien du Short copié dans le presse-papier !
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // CASE 2: NORMAL SCREEN (SEPARATED REGARDER & PUBLIER)
  // ==========================================
  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-6 animate-fade-in">
      {/* Header with Title & Prominent + Publier Button */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <Film className="w-5 h-5 text-[#00F0FF]" />
            <h2 className="text-lg font-bold text-white font-brand">NOVA SHORTS</h2>
          </div>
          <p className="text-xs text-slate-400">Vidéos verticales & Univers créateurs</p>
        </div>

        {/* Quick action button to publish */}
        <button
          onClick={() => setShortsSubTab('publish')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#1677FF] to-[#00F0FF] text-white font-bold text-xs shadow-[0_0_15px_#1677FF] active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Publier</span>
        </button>
      </div>

      {/* Main Tabs: « Regarder » vs « Publier » */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-sky-500/20 backdrop-blur-md">
        <button
          onClick={() => setShortsSubTab('watch')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            shortsSubTab === 'watch'
              ? 'bg-[#1677FF] text-white shadow-[0_0_12px_rgba(22,119,255,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Regarder ({shortsList.length})</span>
        </button>
        <button
          onClick={() => setShortsSubTab('publish')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            shortsSubTab === 'publish'
              ? 'bg-[#1677FF] text-white shadow-[0_0_12px_rgba(22,119,255,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Publier & Mes Vidéos</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {publishSuccessToast && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Votre Short a été publié avec succès dans l'univers NOVA !</span>
        </div>
      )}

      {/* SUB-TAB 1: « REGARDER » */}
      {shortsSubTab === 'watch' && (
        <div className="space-y-4">
          {/* Hero Banner: Launch Immersive 9:16 Fullscreen Stream */}
          <div
            onClick={() => setIsImmersiveWatchMode(true)}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-[#030d24] via-[#0b1f48] to-[#030d24] border border-sky-400/40 p-5 shadow-2xl cursor-pointer group active:scale-[0.98] transition-all"
          >
            <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-300 bg-sky-950/70 border border-sky-500/30 px-2 py-0.5 rounded-full">
                  Format Portrait 9:16
                </span>
                <h3 className="text-base font-extrabold text-white font-brand mt-1.5 flex items-center gap-2">
                  <span>Lancer le flux Plein Écran</span>
                  <Sparkles className="w-4 h-4 text-[#00F0FF] animate-pulse" />
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-[240px]">
                  Visionnage immersif, défilement vertical et son haute fidélité.
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1677FF] to-[#00F0FF] flex items-center justify-center text-white shadow-[0_0_25px_#1677FF] group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 fill-white ml-1" />
              </div>
            </div>
          </div>

          {/* Feed Grid Preview of Shorts */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-brand flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Tous les Shorts disponibles</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {shortsList.length} vidéos
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {shortsList.map((short, idx) => (
                <div
                  key={short.id}
                  onClick={() => {
                    setCurrentShortIndex(idx);
                    setIsImmersiveWatchMode(true);
                  }}
                  className="relative aspect-[9/14] rounded-2xl overflow-hidden bg-slate-900 border border-sky-500/20 cursor-pointer group shadow-lg hover:border-sky-400/50 transition-all"
                >
                  {/* Thumbnail Image */}
                  <img
                    src={short.thumbnailUrl || short.creatorAvatar}
                    alt={short.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px]">
                    {short.userUploaded ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold font-mono text-[9px]">
                        Ma Vidéo
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full bg-black/60 text-sky-300 font-mono text-[9px] backdrop-blur-md">
                        {short.duration}s
                      </span>
                    )}

                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 text-white font-mono text-[9px] backdrop-blur-md">
                      <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                      <span>{(short.likes / 1000).toFixed(1)}k</span>
                    </div>
                  </div>

                  {/* Play Button Indicator in center on hover */}
                  <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black/50 border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 text-left">
                    <h4 className="text-[11px] font-bold text-white line-clamp-1 leading-tight">
                      {short.title}
                    </h4>
                    <p className="text-[10px] text-sky-300 truncate mt-0.5">{short.creator}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: « PUBLIER » */}
      {shortsSubTab === 'publish' && (
        <div className="space-y-5">
          {/* Publication Form Card */}
          <div className="p-4 rounded-3xl bg-[#071330]/90 border border-sky-500/30 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-[#1677FF]/20 text-[#00F0FF]">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-brand">
                  Publier une nouvelle vidéo
                </h3>
                <p className="text-[11px] text-slate-400">
                  Partagez vos moments à Pointe-Noire, Brazzaville et dans le monde
                </p>
              </div>
            </div>

            {publishError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{publishError}</span>
              </div>
            )}

            <form onSubmit={handlePublishSubmit} className="space-y-3.5">
              {/* Video File Picker */}
              <div>
                <label className="text-[11px] font-semibold text-sky-200 block mb-1.5">
                  1. Vidéo depuis la galerie du téléphone (Format 9:16 recommandé)
                </label>
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-sky-500/40 hover:border-[#00F0FF] rounded-2xl cursor-pointer bg-slate-900/60 transition-colors p-2 text-center">
                  {videoPreviewUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-black">
                      <video
                        src={videoPreviewUrl}
                        className="h-full object-contain rounded-lg"
                        controls
                        muted
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-emerald-300 font-mono">
                        ✓ Vidéo chargée ({selectedFile?.name.slice(0, 20)})
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-2">
                      <div className="p-3 rounded-full bg-sky-500/20 text-[#00F0FF] mb-1.5">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-white font-medium">
                        Choisir une vidéo dans la galerie
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">MP4, WebM, MOV acceptés</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* Miniature (Thumbnail) Picker */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                  2. Miniature personnalisée (optionnelle)
                </label>
                <label className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-400 cursor-pointer transition-colors">
                  {thumbnailPreviewUrl ? (
                    <img
                      src={thumbnailPreviewUrl}
                      alt="Miniature"
                      className="w-12 h-12 rounded-lg object-cover border border-sky-400"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="truncate flex-1">
                    <p className="text-xs text-slate-200 font-medium truncate">
                      {thumbnailFile ? thumbnailFile.name : 'Choisir une image de miniature'}
                    </p>
                    <p className="text-[10px] text-slate-500">JPG, PNG, WebP</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailChange}
                  />
                </label>
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  3. Titre du Short
                </label>
                <input
                  type="text"
                  required
                  value={publishTitle}
                  onChange={(e) => setPublishTitle(e.target.value)}
                  placeholder="ex: Coucher de soleil magnifique sur la Côte Sauvage..."
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  4. Description
                </label>
                <textarea
                  required
                  rows={2}
                  value={publishDescription}
                  onChange={(e) => setPublishDescription(e.target.value)}
                  placeholder="Présentez votre vidéo à la communauté de l'univers..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  5. Hashtags
                </label>
                <div className="relative">
                  <Hash className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-sky-400" />
                  <input
                    type="text"
                    value={publishHashtags}
                    onChange={(e) => setPublishHashtags(e.target.value)}
                    placeholder="#congo #pointenoire #nova #vibe"
                    className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {['#pointenoire', '#congo', '#brazzaville', '#musique', '#science', '#nova'].map(
                    (tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => {
                          if (!publishHashtags.includes(tag)) {
                            setPublishHashtags(`${publishHashtags} ${tag}`.trim());
                          }
                        }}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-500/30 hover:border-sky-400 transition-colors"
                      >
                        +{tag}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPublishing || !selectedFile}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#1677FF] to-[#00F0FF] text-white font-bold text-xs shadow-[0_0_20px_rgba(22,119,255,0.4)] disabled:opacity-40 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95 cursor-pointer"
              >
                {isPublishing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Publication dans l'univers NOVA...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Publier mon Short</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Section « Mes Publications » */}
          <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-brand flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mes Publications ({userShorts.length})</span>
              </h3>
            </div>

            {userShorts.length === 0 ? (
              <div className="text-center py-6 px-4">
                <p className="text-xs text-slate-400 mb-2">
                  Vous n'avez pas encore publié de vidéo.
                </p>
                <p className="text-[11px] text-slate-500">
                  Remplissez le formulaire ci-dessus pour ajouter votre premier Short !
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {userShorts.map((short) => {
                  const globalIdx = shortsList.findIndex((s) => s.id === short.id);
                  return (
                    <div
                      key={short.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-slate-700">
                          {short.videoUrl ? (
                            <video
                              src={short.videoUrl}
                              className="w-full h-full object-cover"
                              muted
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                              <Video className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                        </div>

                        <div className="truncate">
                          <h4 className="text-xs font-bold text-white truncate">{short.title}</h4>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {short.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-sky-300 font-mono">
                            <span className="flex items-center gap-0.5">
                              <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />{' '}
                              {short.likes}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Eye className="w-2.5 h-2.5 text-sky-400" /> {short.viewsCount || 1}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            if (globalIdx !== -1) setCurrentShortIndex(globalIdx);
                            setIsImmersiveWatchMode(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-[#1677FF] hover:bg-[#00F0FF] text-white hover:text-slate-950 text-[11px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Voir</span>
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Voulez-vous supprimer définitivement "${short.title}" ?`
                              )
                            ) {
                              deleteUserShort(short.id);
                            }
                        }}
                        className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Supprimer la vidéo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
};
