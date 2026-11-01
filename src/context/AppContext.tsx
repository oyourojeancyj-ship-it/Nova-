import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SectionId,
  UserProfile,
  NotificationItem,
  WeatherData,
  ShortVideo,
  MusicTrack,
  MusicPlaylist,
  HomeworkItem,
  CourseItem,
  ChatContact,
  ChatMessage,
  ChatGroup,
  FriendRequest,
  ActiveCallState,
  MessageType,
  PlannerTask,
  NoteItem,
  ExerciseResultRecord,
} from '../types';
import { cosmicAudio } from '../services/audioSynthesizer';
import { novaStorage } from '../services/storageDb';
import {
  fetchLiveWeather,
  searchGlobalCities,
  CityLocation,
  CONGO_CITIES,
  DEFAULT_CITY,
} from '../services/weatherService';

interface AppContextType {
  activeSection: SectionId;
  setActiveSection: (section: SectionId) => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  verifyPhoneNumber: (code: string) => boolean;
  updateUserPhone: (phone: string) => void;
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  unreadCount: number;

  // Search
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Profile & Notif Modals
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;

  // Weather (Congo-Brazzaville & World)
  weatherData: WeatherData;
  availableCities: CityLocation[];
  selectedCityName: string;
  changeCity: (city: CityLocation) => Promise<void>;
  searchCities: (query: string) => Promise<CityLocation[]>;
  refreshWeather: () => Promise<void>;
  isWeatherLoading: boolean;

  // Shorts (Separate Publier / Regarder & 9:16 Immersive View)
  shortsList: ShortVideo[];
  currentShortIndex: number;
  setCurrentShortIndex: (index: number) => void;
  shortsSubTab: 'watch' | 'publish';
  setShortsSubTab: (tab: 'watch' | 'publish') => void;
  isImmersiveWatchMode: boolean;
  setIsImmersiveWatchMode: (active: boolean) => void;
  toggleLikeShort: (id: string) => void;
  toggleFavoriteShort: (id: string) => void;
  publishShort: (data: {
    title: string;
    description: string;
    hashtags: string[];
    videoFile: File;
    thumbnailFile?: File;
    creator?: string;
  }) => Promise<ShortVideo>;
  deleteUserShort: (id: string) => Promise<void>;

  // Music (Auto import, Playlists & Favorites)
  playlist: MusicTrack[];
  currentTrackIndex: number;
  isPlayingMusic: boolean;
  togglePlayMusic: () => void;
  playTrack: (index: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  musicVolume: number;
  setMusicVolume: (v: number) => void;
  toggleFavoriteTrack: (trackId: string) => void;
  addMusicTrack: (data: {
    title: string;
    artist: string;
    album?: string;
    audioFile: File;
    coverFile?: File;
  }) => Promise<MusicTrack>;
  batchImportMusicFiles: (files: FileList | File[]) => Promise<number>;
  deleteUserMusic: (id: string) => Promise<void>;
  musicPlaylists: MusicPlaylist[];
  createPlaylist: (name: string, description?: string) => Promise<MusicPlaylist>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  refreshMusicLibrary: () => Promise<void>;

  // School (Exercises, Quizzes & History)
  averageGrade: number;
  homeworkList: HomeworkItem[];
  toggleHomework: (id: string) => void;
  addHomework: (item: Omit<HomeworkItem, 'id'>) => void;
  coursesToday: CourseItem[];
  exerciseHistory: ExerciseResultRecord[];
  recordExerciseResult: (record: Omit<ExerciseResultRecord, 'id' | 'completedAt'>) => Promise<void>;

  // Chat (Remote contacts, Requests, Groups & Calls)
  contacts: ChatContact[];
  friendRequests: FriendRequest[];
  sendFriendRequest: (identifier: string) => { success: boolean; message: string };
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  chatGroups: ChatGroup[];
  createChatGroup: (name: string, memberIds: string[], description?: string) => ChatGroup;
  activeContactId: string;
  setActiveContactId: (id: string) => void;
  messages: Record<string, ChatMessage[]>;
  sendMessage: (
    targetId: string,
    payload: {
      text: string;
      type?: MessageType;
      mediaUrl?: string;
      fileName?: string;
      fileSize?: string;
      voiceDuration?: number;
    }
  ) => void;
  activeCall: ActiveCallState;
  startCall: (contact: ChatContact, type: 'audio' | 'video') => void;
  endCall: () => void;
  toggleCallMute: () => void;
  toggleCallVideo: () => void;

  // Planner
  plannerTasks: PlannerTask[];
  toggleTask: (id: string) => void;
  addTask: (task: Omit<PlannerTask, 'id'>) => void;

  // Notes
  notes: NoteItem[];
  addNote: (note: Omit<NoteItem, 'id' | 'date'>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  // Device simulation mode
  phoneFrameMode: boolean;
  setPhoneFrameMode: (enabled: boolean) => void;
}

const initialProfile: UserProfile = {
  name: 'Alexandre Vance',
  handle: '@alexandre.cg',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  status: 'Pointe-Noire · Explorateur de l’univers NOVA',
  level: 'Nova Prime V',
  universePoints: 12450,
  country: 'Congo-Brazzaville',
  currency: 'FCFA',
  phone: '+242 06 912 34 56',
  isPhoneVerified: true,
  hidePhone: false,
};

const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Assistant NOVA IA',
    description: 'Votre météo en direct de Pointe-Noire (Congo) et vos rappels sont synchronisés.',
    time: 'Il y a 10 min',
    read: false,
    category: 'system',
  },
  {
    id: 'n2',
    title: 'Alerte Devoir',
    description: 'Dissertation de Philosophie & IA prévue pour demain 08:30.',
    time: 'Il y a 45 min',
    read: false,
    category: 'school',
  },
  {
    id: 'n3',
    title: 'Station Météo Congo',
    description: 'Brise marine et température agréable (28°C) sur la côte de Pointe-Noire.',
    time: 'Il y a 1h',
    read: true,
    category: 'weather',
  },
  {
    id: 'n4',
    title: 'Léa S. (Brazzaville)',
    description: 'Tu as vu la nouvelle capsule de révision en astrophysique ?',
    time: 'Il y a 3h',
    read: true,
    category: 'chat',
  },
];

const defaultShorts: ShortVideo[] = [
  {
    id: 's-congo-1',
    title: 'Pointe-Noire : Coucher de soleil sur la Côte Sauvage',
    creator: 'Kouilou Ocean Explorer',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    description: 'Magie crépusculaire sur les vagues de l’Atlantique à Pointe-Noire #congo #pointenoire #cotesauvage #nova',
    hashtags: ['#congo', '#pointenoire', '#cotesauvage', '#ocean', '#nova'],
    likes: 54200,
    commentsCount: 940,
    shares: 4120,
    viewsCount: 182000,
    audioTrack: 'Rythme du Fleuve — Nova Congo Beats',
    visualTheme: 'aurora',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    isLiked: false,
    isFavorited: false,
  },
  {
    id: 's-congo-2',
    title: 'Survol spatial de la Nébuleuse d’Orion en 8K',
    creator: 'AstroNova Labs',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    description: 'Une plongée cosmique dans les profondeurs stellaires #espace #astronomie #quantique #univers',
    hashtags: ['#espace', '#astronomie', '#univers', '#nova'],
    likes: 89400,
    commentsCount: 1420,
    shares: 12500,
    viewsCount: 310000,
    audioTrack: 'Cosmic Drift — Nova Spatial Audio',
    visualTheme: 'nebula',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    isLiked: true,
    isFavorited: true,
  },
  {
    id: 's-congo-3',
    title: 'Méthode Feynman : Retenir n’importe quel cours en 15 min',
    creator: 'Prof. Élise Martin',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    description: 'Technique révolutionnaire de vulgarisation et mémorisation accélérée pour les examens #etudes #bac #revisions',
    hashtags: ['#etudes', '#bac', '#revisions', '#pointenoire'],
    likes: 67300,
    commentsCount: 915,
    shares: 4890,
    viewsCount: 145000,
    audioTrack: 'Lo-Fi Study Beats — Nova School',
    visualTheme: 'quantum',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    isLiked: false,
    isFavorited: false,
  },
  {
    id: 's-congo-4',
    title: 'Brazzaville By Night : Pont du 15 Août illuminé',
    creator: 'Brazza Digital',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    description: 'Les lumières futuristes du viaduc surplombant les rapides du fleuve Congo #brazzaville #congo #futur #vibes',
    hashtags: ['#brazzaville', '#congo', '#pont15aout', '#nightvibes'],
    likes: 124000,
    commentsCount: 2310,
    shares: 18400,
    viewsCount: 420000,
    audioTrack: 'Midnight Aurora — Synth Pulse',
    visualTheme: 'cyberpunk',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    isLiked: false,
    isFavorited: false,
  },
];

const defaultPlaylist: MusicTrack[] = [
  {
    id: 't-default-1',
    title: 'Cosmic Drift (Stellar Odyssey)',
    artist: 'Nova Sound Collective',
    album: 'Voyager Infinity',
    duration: 194,
    coverArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    bpm: 92,
    mood: 'Spatial & Immersif',
    frequencyPreset: 'synthwave',
    isFavorite: true,
  },
  {
    id: 't-default-2',
    title: 'Midnight Aurora (Deep Focus)',
    artist: 'Cyber Solitude',
    album: 'Neon Echoes',
    duration: 215,
    coverArt: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=80',
    bpm: 85,
    mood: 'Concentration & Sérénité',
    frequencyPreset: 'chillhop',
    isFavorite: false,
  },
  {
    id: 't-default-3',
    title: 'Rythme Océan Pointe-Noire (Afro Ambient)',
    artist: 'Kouilou Soundwave',
    album: 'Atlantic Reflections',
    duration: 240,
    coverArt: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
    bpm: 96,
    mood: 'Douceur Côtière & Énergie',
    frequencyPreset: 'ambient',
    isFavorite: true,
  },
  {
    id: 't-default-4',
    title: 'Quantum Pulse (Future Synth)',
    artist: 'Alexandre & The Matrix',
    album: 'Hyperdrive Alpha',
    duration: 178,
    coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    bpm: 110,
    mood: 'Énergie Électrique',
    frequencyPreset: 'pulsar',
    isFavorite: false,
  },
];

const initialPlaylists: MusicPlaylist[] = [
  {
    id: 'pl-1',
    name: 'Congo Chill & Océan',
    description: 'Sons immersifs pour rêver face aux vagues de la Côte Sauvage.',
    trackIds: ['t-default-3', 't-default-1'],
    coverArt: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-10-31',
  },
  {
    id: 'pl-2',
    name: 'Deep Work & Révisions Bac',
    description: 'Fréquences alpha et sons sans paroles pour mémoriser 2x plus vite.',
    trackIds: ['t-default-2', 't-default-4'],
    coverArt: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-10-31',
  },
];

const initialContacts: ChatContact[] = [
  {
    id: 'cnt-nova',
    novaId: '@nova.assistant',
    name: 'NOVA Assistant Universel',
    phone: '+242 06 000 00 00',
    city: 'Pointe-Noire',
    country: 'Congo-Brazzaville',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    status: 'online',
    isFriend: true,
    lastMessage: 'Météo de Pointe-Noire (Congo) et quiz scolaires prêts.',
    lastMessageTime: '16:30',
    unreadCount: 0,
  },
  {
    id: 'cnt-lea',
    novaId: '@lea_brazza',
    name: 'Léa S. (Brazzaville)',
    phone: '+242 05 514 88 90',
    city: 'Brazzaville',
    country: 'Congo-Brazzaville',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    status: 'online',
    isFriend: true,
    lastMessage: 'Tu as testé le quiz de physique sur la balistique ?',
    lastMessageTime: '15:42',
    unreadCount: 1,
  },
  {
    id: 'cnt-thomas',
    novaId: '@thomas_pnr',
    name: 'Thomas R. (Pointe-Noire)',
    phone: '+242 06 633 12 45',
    city: 'Pointe-Noire',
    country: 'Congo-Brazzaville',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    status: 'busy',
    isFriend: true,
    lastMessage: 'J’ai importé toutes mes musiques dans NOVA, c’est magique !',
    lastMessageTime: '14:15',
    unreadCount: 0,
  },
  {
    id: 'cnt-bruno',
    novaId: '@bruno_dolisie',
    name: 'Bruno M. (Dolisie)',
    phone: '+242 04 421 99 10',
    city: 'Dolisie',
    country: 'Congo-Brazzaville',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    status: 'offline',
    isFriend: true,
    lastMessage: 'À demain pour la révision de philosophie !',
    lastMessageTime: 'Hier',
    unreadCount: 0,
  },
];

const initialGroups: ChatGroup[] = [
  {
    id: 'grp-1',
    name: 'Terminale C & D — Congo 2026',
    avatar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=150&q=80',
    description: 'Entraide pour les cours, exercices résolus et sujets du Bac.',
    memberIds: ['cnt-lea', 'cnt-thomas', 'cnt-bruno'],
    createdBy: 'Alexandre Vance',
    createdAt: '2026-10-30',
  },
  {
    id: 'grp-2',
    name: 'Pointe-Noire Créateurs & Musique',
    avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80',
    description: 'Partage de vidéos courtes, sons et créations urbaines.',
    memberIds: ['cnt-thomas', 'cnt-lea'],
    createdBy: 'Alexandre Vance',
    createdAt: '2026-10-28',
  },
];

const initialFriendRequests: FriendRequest[] = [
  {
    id: 'req-1',
    fromUser: {
      id: 'cnt-mariam',
      novaId: '@mariam_kin',
      name: 'Mariam K. (Kinshasa)',
      phone: '+243 81 234 56 78',
      city: 'Kinshasa',
      country: 'RDC',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      status: 'online',
      isFriend: false,
      lastMessage: 'Je voudrais réviser avec vous sur NOVA.',
      lastMessageTime: '12:10',
      unreadCount: 0,
    },
    sentAt: 'Il y a 2h',
    status: 'pending',
  },
];

const initialMessagesData: Record<string, ChatMessage[]> = {
  'cnt-nova': [
    {
      id: 'm1',
      senderId: 'cnt-nova',
      senderName: 'NOVA Assistant',
      senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
      type: 'text',
      text: 'Bonjour Alexandre ! Bienvenue dans votre univers NOVA au Congo-Brazzaville. Le catalogue d’exercices scolaires complet et la messagerie à distance sont prêts.',
      timestamp: '10:00',
      isSelf: false,
      status: 'read',
    },
  ],
  'cnt-lea': [
    {
      id: 'm2',
      senderId: 'cnt-lea',
      senderName: 'Léa S.',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      type: 'text',
      text: 'Salut Alexandre ! Tu as réussi l’exercice de math sur les limites et les asymptotes obliques ?',
      timestamp: '15:30',
      isSelf: false,
      status: 'read',
    },
    {
      id: 'm3',
      senderId: 'user',
      senderName: 'Alexandre Vance',
      senderAvatar: initialProfile.avatar,
      type: 'text',
      text: 'Oui ! La méthode par factorisation du plus haut degré donne 3 directement. Je t’envoie la fiche de correction.',
      timestamp: '15:35',
      isSelf: true,
      status: 'read',
    },
    {
      id: 'm4',
      senderId: 'cnt-lea',
      senderName: 'Léa S.',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      type: 'text',
      text: 'Tu as testé le quiz de physique sur la balistique ?',
      timestamp: '15:42',
      isSelf: false,
      status: 'read',
    },
  ],
  'grp-1': [
    {
      id: 'm-grp-1',
      senderId: 'cnt-bruno',
      senderName: 'Bruno M. (Dolisie)',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      type: 'text',
      text: 'Bienvenue à tous dans le groupe de révision Terminale C & D !',
      timestamp: 'Hier 18:00',
      isSelf: false,
      status: 'read',
    },
  ],
};

const initialHomework: HomeworkItem[] = [
  {
    id: 'hw1',
    subject: 'Mathématiques',
    title: 'Résoudre la série d’exercices sur les équations différentielles et primitives',
    dueDate: 'Demain à 08:30',
    completed: false,
    priority: 'haute',
  },
  {
    id: 'hw2',
    subject: 'Physique-Chimie',
    title: 'Exercice de balistique : Calcul de la flèche et de la portée du tir',
    dueDate: 'Mardi 14:00',
    completed: false,
    priority: 'haute',
  },
  {
    id: 'hw3',
    subject: 'SVT',
    title: 'Schématiser la transcription de l’ADN en ARNm et la traduction ribosomale',
    dueDate: 'Jeudi 10:00',
    completed: true,
    priority: 'moyenne',
  },
];

const initialCourses: CourseItem[] = [
  {
    id: 'c1',
    subject: 'Mathématiques Spéciales',
    room: 'Salle Cheikh Anta Diop (304)',
    teacher: 'Prof. Okamba',
    time: '08:30 - 10:30',
    day: 'Aujourd’hui',
  },
  {
    id: 'c2',
    subject: 'Physique & Mécanique Newtonienne',
    room: 'Laboratoire Marie Curie (Lab 2)',
    teacher: 'Dr. Mabiala',
    time: '11:00 - 13:00',
    day: 'Aujourd’hui',
  },
  {
    id: 'c3',
    subject: 'Histoire & Géopolitique du Bassin du Congo',
    room: 'Amphithéâtre Savorgnan',
    teacher: 'Mme Moukassa',
    time: '14:30 - 16:30',
    day: 'Aujourd’hui',
  },
];

const initialPlanner: PlannerTask[] = [
  {
    id: 'p1',
    title: 'Quiz Chronométré de Mathématiques (Limites)',
    time: '08:30 - 09:00',
    date: 'Aujourd’hui',
    category: 'Études',
    completed: true,
  },
  {
    id: 'p2',
    title: 'Session Musique & Importation audio',
    time: '12:30 - 13:30',
    date: 'Aujourd’hui',
    category: 'Personnel',
    completed: true,
  },
  {
    id: 'p3',
    title: 'Balade Côte Sauvage Pointe-Noire',
    time: '17:30 - 18:45',
    date: 'Aujourd’hui',
    category: 'Sport',
    completed: false,
  },
];

const initialNotes: NoteItem[] = [
  {
    id: 'not1',
    title: 'Projet NOVA Congo 2026',
    content: 'Connecter les lycées de Pointe-Noire et Brazzaville, créer des salons d’entraide scolaires et partager les vidéos scientifiques.',
    category: 'Projets',
    date: '31 Oct. 2026',
    pinned: true,
    color: 'blue',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nova_user_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('nova_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Weather: Default to Pointe-Noire
  const [currentCityLocation, setCurrentCityLocation] = useState<CityLocation>(() => {
    const saved = localStorage.getItem('nova_selected_city');
    return saved ? JSON.parse(saved) : DEFAULT_CITY;
  });

  const [weatherData, setWeatherData] = useState<WeatherData>({
    city: 'Pointe-Noire, Congo-Brazzaville',
    country: 'Congo-Brazzaville',
    temp: 28,
    condition: 'Douceur Océanique & Éclaircies',
    iconName: 'cloud-sun',
    high: 31,
    low: 24,
    feelsLike: 29,
    humidity: 78,
    wind: 16,
    uv: 7,
    airQuality: 'Très Bonne (18 IQA)',
    hourly: [
      { time: '12:00', temp: 28, icon: 'cloud-sun' },
      { time: '14:00', temp: 30, icon: 'sun' },
      { time: '16:00', temp: 29, icon: 'cloud-sun' },
      { time: '18:00', temp: 27, icon: 'sunset' },
      { time: '20:00', temp: 25, icon: 'moon' },
      { time: '22:00', temp: 24, icon: 'moon' },
    ],
    daily: [
      { day: "Aujourd'hui", condition: 'Soleil & Brise marine', high: 31, low: 24, icon: 'sun' },
      { day: 'Dimanche', condition: 'Ciel bleu voilé', high: 30, low: 24, icon: 'cloud-sun' },
      { day: 'Lundi', condition: 'Averses tropicales', high: 29, low: 23, icon: 'cloud-rain' },
      { day: 'Mardi', condition: 'Soleil radieux', high: 31, low: 24, icon: 'sun' },
      { day: 'Mercredi', condition: 'Éclaircies côtières', high: 30, low: 24, icon: 'cloud-sun' },
    ],
    latitude: DEFAULT_CITY.latitude,
    longitude: DEFAULT_CITY.longitude,
    lastUpdated: 'En direct',
    isLoading: true,
  });
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  // Shorts: Separate Publier / Regarder & 9:16 Immersive View
  const [shortsList, setShortsList] = useState<ShortVideo[]>(defaultShorts);
  const [currentShortIndex, setCurrentShortIndex] = useState(0);
  const [shortsSubTab, setShortsSubTab] = useState<'watch' | 'publish'>('watch');
  const [isImmersiveWatchMode, setIsImmersiveWatchMode] = useState<boolean>(false);

  // Music: Auto import & Playlists
  const [playlist, setPlaylist] = useState<MusicTrack[]>(defaultPlaylist);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicVolume, setMusicVolumeState] = useState(0.8);
  const [musicPlaylists, setMusicPlaylists] = useState<MusicPlaylist[]>(initialPlaylists);

  // School: Homework & History
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>(() => {
    const saved = localStorage.getItem('nova_homework');
    return saved ? JSON.parse(saved) : initialHomework;
  });
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseResultRecord[]>([]);

  // Chat: Contacts, Requests, Groups, Calls
  const [contacts, setContacts] = useState<ChatContact[]>(initialContacts);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(initialFriendRequests);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>(initialGroups);
  const [activeContactId, setActiveContactId] = useState('cnt-nova');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(initialMessagesData);
  const [activeCall, setActiveCall] = useState<ActiveCallState>({
    isActive: false,
    type: 'audio',
    contact: null,
    status: 'ended',
    isMuted: false,
    isVideoOff: false,
  });

  // Planner & Notes
  const [plannerTasks, setPlannerTasks] = useState<PlannerTask[]>(() => {
    const saved = localStorage.getItem('nova_planner');
    return saved ? JSON.parse(saved) : initialPlanner;
  });
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('nova_notes');
    return saved ? JSON.parse(saved) : initialNotes;
  });
  const [phoneFrameMode, setPhoneFrameMode] = useState<boolean>(true);

  // Weather fetch
  const updateWeatherForLocation = useCallback(async (loc: CityLocation) => {
    setIsWeatherLoading(true);
    try {
      const data = await fetchLiveWeather(loc.name, loc.country, loc.latitude, loc.longitude);
      setWeatherData(data);
    } catch (err) {
      console.warn('Erreur météo:', err);
    } finally {
      setIsWeatherLoading(false);
    }
  }, []);

  // Initialization & IndexedDB rehydration
  useEffect(() => {
    updateWeatherForLocation(currentCityLocation);

    // Rehydrate Shorts
    novaStorage.getAllUserShorts().then((userShorts) => {
      if (userShorts.length > 0) {
        setShortsList((prev) => {
          const defaultIds = new Set(defaultShorts.map((s) => s.id));
          const filteredDefaults = prev.filter((s) => defaultIds.has(s.id));
          return [...userShorts, ...filteredDefaults];
        });
      }
    });

    // Rehydrate Music
    novaStorage.getAllUserMusic().then((userTracks) => {
      if (userTracks.length > 0) {
        setPlaylist((prev) => {
          const defaultIds = new Set(defaultPlaylist.map((t) => t.id));
          const filteredDefaults = prev.filter((t) => defaultIds.has(t.id));
          return [...userTracks, ...filteredDefaults];
        });
      }
    });

    // Rehydrate Playlists
    novaStorage.getAllPlaylists().then((stored) => {
      if (stored.length > 0) {
        setMusicPlaylists(stored);
      }
    });

    // Rehydrate Exercise History
    novaStorage.getExerciseHistory().then((history) => {
      if (history.length > 0) {
        setExerciseHistory(history.reverse());
      }
    });
  }, [currentCityLocation, updateWeatherForLocation]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nova_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('nova_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('nova_homework', JSON.stringify(homeworkList));
  }, [homeworkList]);

  useEffect(() => {
    localStorage.setItem('nova_planner', JSON.stringify(plannerTasks));
  }, [plannerTasks]);

  useEffect(() => {
    localStorage.setItem('nova_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('nova_selected_city', JSON.stringify(currentCityLocation));
  }, [currentCityLocation]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  // Profile phone verification
  const verifyPhoneNumber = (code: string): boolean => {
    if (code.trim().length === 6) {
      setUserProfile((prev) => ({ ...prev, isPhoneVerified: true }));
      return true;
    }
    return false;
  };

  const updateUserPhone = (phone: string) => {
    setUserProfile((prev) => ({ ...prev, phone, isPhoneVerified: false }));
  };

  // Weather Actions
  const changeCity = async (loc: CityLocation) => {
    setCurrentCityLocation(loc);
    await updateWeatherForLocation(loc);
  };

  const refreshWeather = async () => {
    await updateWeatherForLocation(currentCityLocation);
  };

  const searchCities = async (query: string): Promise<CityLocation[]> => {
    return await searchGlobalCities(query);
  };

  // Shorts Actions
  const toggleLikeShort = (id: string) => {
    setShortsList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const isLiked = !s.isLiked;
          const likes = isLiked ? s.likes + 1 : s.likes - 1;
          novaStorage.updateShortInteractions(id, { isLiked, likes });
          return { ...s, isLiked, likes };
        }
        return s;
      })
    );
  };

  const toggleFavoriteShort = (id: string) => {
    setShortsList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const isFavorited = !s.isFavorited;
          novaStorage.updateShortInteractions(id, { isFavorited });
          return { ...s, isFavorited };
        }
        return s;
      })
    );
  };

  const publishShort = async (data: {
    title: string;
    description: string;
    hashtags: string[];
    videoFile: File;
    thumbnailFile?: File;
    creator?: string;
  }): Promise<ShortVideo> => {
    const newShortMeta: Omit<ShortVideo, 'videoUrl'> = {
      id: `short-user-${Date.now()}`,
      title: data.title,
      creator: data.creator || userProfile.name,
      creatorAvatar: userProfile.avatar,
      description: data.description,
      hashtags: data.hashtags,
      likes: 1,
      commentsCount: 0,
      shares: 0,
      viewsCount: 1,
      audioTrack: 'Audio Original — ' + userProfile.name,
      visualTheme: 'nebula',
      isLiked: true,
      isFavorited: false,
      userUploaded: true,
    };

    const savedShort = await novaStorage.saveShort(newShortMeta, data.videoFile, data.thumbnailFile);
    setShortsList((prev) => [savedShort, ...prev]);
    setCurrentShortIndex(0);
    // Add universe points
    setUserProfile((prev) => ({ ...prev, universePoints: prev.universePoints + 150 }));
    return savedShort;
  };

  const deleteUserShort = async (id: string) => {
    await novaStorage.deleteShort(id);
    setShortsList((prev) => prev.filter((s) => s.id !== id));
    setCurrentShortIndex((prev) => Math.max(0, prev - 1));
  };

  // Music Actions
  const togglePlayMusic = () => {
    if (isPlayingMusic) {
      cosmicAudio.pause();
      setIsPlayingMusic(false);
    } else {
      const track = playlist[currentTrackIndex] || playlist[0];
      if (!track) return;
      cosmicAudio.play(track.frequencyPreset, track.audioUrl);
      cosmicAudio.setVolume(musicVolume);
      setIsPlayingMusic(true);
    }
  };

  const playTrack = (index: number) => {
    if (index < 0 || index >= playlist.length) return;
    setCurrentTrackIndex(index);
    const track = playlist[index];
    cosmicAudio.pause();
    cosmicAudio.play(track.frequencyPreset, track.audioUrl);
    cosmicAudio.setVolume(musicVolume);
    setIsPlayingMusic(true);
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % playlist.length;
    playTrack(nextIdx);
  };

  const prevTrack = () => {
    if (playlist.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    playTrack(prevIdx);
  };

  const setMusicVolume = (v: number) => {
    setMusicVolumeState(v);
    cosmicAudio.setVolume(v);
  };

  const toggleFavoriteTrack = (trackId: string) => {
    setPlaylist((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          const isFavorite = !t.isFavorite;
          novaStorage.updateMusicFavorite(trackId, isFavorite);
          return { ...t, isFavorite };
        }
        return t;
      })
    );
  };

  const addMusicTrack = async (data: {
    title: string;
    artist: string;
    album?: string;
    audioFile: File;
    coverFile?: File;
  }): Promise<MusicTrack> => {
    const newTrackMeta: Omit<MusicTrack, 'audioUrl'> = {
      id: `music-user-${Date.now()}`,
      title: data.title,
      artist: data.artist,
      album: data.album || 'Morceau Importé',
      duration: 210,
      coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
      bpm: 100,
      mood: 'Morceau Utilisateur',
      frequencyPreset: 'ambient',
      isUserUploaded: true,
      isFavorite: false,
      fileSize: (data.audioFile.size / (1024 * 1024)).toFixed(1) + ' Mo',
    };

    const savedTrack = await novaStorage.saveMusic(newTrackMeta, data.audioFile, data.coverFile);
    setPlaylist((prev) => [savedTrack, ...prev]);
    playTrack(0);
    return savedTrack;
  };

  // Automatic multi-file batch audio importer
  const batchImportMusicFiles = async (files: FileList | File[]): Promise<number> => {
    let importedCount = 0;
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (file.type.startsWith('audio/') || /\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name)) {
        const rawName = file.name.replace(/\.[^/.]+$/, '');
        let title = rawName;
        let artist = 'Artiste Inconnu';

        if (rawName.includes(' - ')) {
          const parts = rawName.split(' - ');
          artist = parts[0].trim();
          title = parts.slice(1).join(' - ').trim();
        }

        const newTrackMeta: Omit<MusicTrack, 'audioUrl'> = {
          id: `music-auto-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title,
          artist,
          album: 'Bibliothèque Téléphone',
          duration: 180 + Math.floor(Math.random() * 60),
          coverArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
          bpm: 95,
          mood: 'Audio Téléphone',
          frequencyPreset: 'ambient',
          isUserUploaded: true,
          isFavorite: false,
          fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' Mo',
        };

        const saved = await novaStorage.saveMusic(newTrackMeta, file);
        setPlaylist((prev) => [saved, ...prev]);
        importedCount++;
      }
    }
    return importedCount;
  };

  const refreshMusicLibrary = async () => {
    const userTracks = await novaStorage.getAllUserMusic();
    const defaultIds = new Set(defaultPlaylist.map((t) => t.id));
    setPlaylist((prev) => {
      const filteredDefaults = prev.filter((t) => defaultIds.has(t.id));
      return [...userTracks, ...filteredDefaults];
    });
  };

  const createPlaylist = async (name: string, description?: string): Promise<MusicPlaylist> => {
    const newPl: MusicPlaylist = {
      id: `pl-${Date.now()}`,
      name,
      description,
      trackIds: [],
      coverArt: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
      createdAt: new Date().toISOString(),
    };
    await novaStorage.savePlaylist(newPl);
    setMusicPlaylists((prev) => [newPl, ...prev]);
    return newPl;
  };

  const addTrackToPlaylist = (playlistId: string, trackId: string) => {
    setMusicPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId && !pl.trackIds.includes(trackId)) {
          const updated = { ...pl, trackIds: [...pl.trackIds, trackId] };
          novaStorage.savePlaylist(updated);
          return updated;
        }
        return pl;
      })
    );
  };

  const deleteUserMusic = async (id: string) => {
    await novaStorage.deleteMusic(id);
    setPlaylist((prev) => prev.filter((t) => t.id !== id));
    setCurrentTrackIndex(0);
  };

  // School Actions
  const toggleHomework = (id: string) => {
    setHomeworkList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const addHomework = (item: Omit<HomeworkItem, 'id'>) => {
    const newItem: HomeworkItem = { ...item, id: `hw-${Date.now()}` };
    setHomeworkList((prev) => [newItem, ...prev]);
  };

  const recordExerciseResult = async (record: Omit<ExerciseResultRecord, 'id' | 'completedAt'>) => {
    const newRecord: ExerciseResultRecord = {
      ...record,
      id: `res-${Date.now()}`,
      completedAt: new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    await novaStorage.saveExerciseResult(newRecord);
    setExerciseHistory((prev) => [newRecord, ...prev]);

    // Award bonus points based on score
    const pointsGained = Math.round(record.score * 2);
    setUserProfile((prev) => ({
      ...prev,
      universePoints: prev.universePoints + pointsGained,
    }));
  };

  // Chat Actions
  const sendFriendRequest = (identifier: string): { success: boolean; message: string } => {
    const clean = identifier.trim().toLowerCase();
    if (!clean) return { success: false, message: 'Identifiant ou numéro invalide.' };

    const newContact: ChatContact = {
      id: `cnt-${Date.now()}`,
      novaId: clean.startsWith('@') ? clean : `@${clean}`,
      name: clean.startsWith('+') ? `Ami (${clean})` : clean.replace('@', ''),
      phone: clean.startsWith('+') ? clean : '+242 06 000 00 00',
      city: 'Pointe-Noire',
      country: 'Congo-Brazzaville',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      status: 'online',
      isFriend: true,
      lastMessage: 'Demande d’ami acceptée ! Vous êtes désormais connectés sur NOVA.',
      lastMessageTime: 'À l’instant',
      unreadCount: 0,
    };

    setContacts((prev) => [newContact, ...prev]);
    return { success: true, message: `Invitation envoyée avec succès à ${clean} !` };
  };

  const acceptFriendRequest = (requestId: string) => {
    const req = friendRequests.find((r) => r.id === requestId);
    if (!req) return;
    const acceptedContact: ChatContact = { ...req.fromUser, isFriend: true };
    setContacts((prev) => [acceptedContact, ...prev]);
    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const rejectFriendRequest = (requestId: string) => {
    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const createChatGroup = (name: string, memberIds: string[], description?: string): ChatGroup => {
    const newGrp: ChatGroup = {
      id: `grp-${Date.now()}`,
      name,
      avatar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=150&q=80',
      description: description || 'Groupe de discussion NOVA',
      memberIds,
      createdBy: userProfile.name,
      createdAt: 'Aujourd’hui',
    };
    setChatGroups((prev) => [newGrp, ...prev]);
    return newGrp;
  };

  const sendMessage = (
    targetId: string,
    payload: {
      text: string;
      type?: MessageType;
      mediaUrl?: string;
      fileName?: string;
      fileSize?: string;
      voiceDuration?: number;
    }
  ) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user',
      senderName: userProfile.name,
      senderAvatar: userProfile.avatar,
      type: payload.type || 'text',
      text: payload.text,
      mediaUrl: payload.mediaUrl,
      fileName: payload.fileName,
      fileSize: payload.fileSize,
      voiceDuration: payload.voiceDuration,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
      status: 'delivered',
    };

    setMessages((prev) => ({
      ...prev,
      [targetId]: [...(prev[targetId] || []), userMsg],
    }));

    // Simulated responsive reply from remote friend
    setTimeout(() => {
      let replyText = 'Bien reçu sur NOVA ! Je regarde ça de suite.';
      if (targetId === 'cnt-nova') {
        replyText = `Analyse terminée pour : "${payload.text}". Tout est synchronisé dans vos modules NOVA au Congo.`;
      } else if (targetId === 'cnt-lea') {
        replyText = payload.type === 'voice' 
          ? 'J’ai bien écouté ton message vocal ! Super explication pour les maths.'
          : 'Super idée ! On révise ensemble ce soir après les cours ?';
      } else if (targetId === 'cnt-thomas') {
        replyText = 'Carrément, j’adore ce contenu ! Pointe-Noire est connectée.';
      }

      const botMsg: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        senderId: targetId,
        senderName: contacts.find((c) => c.id === targetId)?.name || 'Correspondant',
        senderAvatar: contacts.find((c) => c.id === targetId)?.avatar || initialProfile.avatar,
        type: 'text',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isSelf: false,
        status: 'read',
      };

      setMessages((prev) => ({
        ...prev,
        [targetId]: [...(prev[targetId] || []), botMsg],
      }));
    }, 1200);
  };

  // Call actions
  const startCall = (contact: ChatContact, type: 'audio' | 'video') => {
    setActiveCall({
      isActive: true,
      type,
      contact,
      status: 'connecting',
      isMuted: false,
      isVideoOff: false,
      startedAt: Date.now(),
    });

    setTimeout(() => {
      setActiveCall((prev) => ({ ...prev, status: 'connected' }));
    }, 1500);
  };

  const endCall = () => {
    setActiveCall({
      isActive: false,
      type: 'audio',
      contact: null,
      status: 'ended',
      isMuted: false,
      isVideoOff: false,
    });
  };

  const toggleCallMute = () => {
    setActiveCall((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const toggleCallVideo = () => {
    setActiveCall((prev) => ({ ...prev, isVideoOff: !prev.isVideoOff }));
  };

  // Planner & Notes
  const toggleTask = (id: string) => {
    setPlannerTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const addTask = (task: Omit<PlannerTask, 'id'>) => {
    const newTask: PlannerTask = { ...task, id: `task-${Date.now()}` };
    setPlannerTasks((prev) => [...prev, newTask]);
  };

  const addNote = (note: Omit<NoteItem, 'id' | 'date'>) => {
    const newNote: NoteItem = {
      ...note,
      id: `note-${Date.now()}`,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const togglePinNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  return (
    <AppContext.Provider
      value={{
        activeSection,
        setActiveSection,
        userProfile,
        setUserProfile,
        verifyPhoneNumber,
        updateUserPhone,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        unreadCount,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        isProfileOpen,
        setIsProfileOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        weatherData,
        availableCities: CONGO_CITIES,
        selectedCityName: currentCityLocation.name,
        changeCity,
        searchCities,
        refreshWeather,
        isWeatherLoading,
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
        averageGrade: 16.8,
        homeworkList,
        toggleHomework,
        addHomework,
        coursesToday: initialCourses,
        exerciseHistory,
        recordExerciseResult,
        contacts,
        friendRequests,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        chatGroups,
        createChatGroup,
        activeContactId,
        setActiveContactId,
        messages,
        sendMessage,
        activeCall,
        startCall,
        endCall,
        toggleCallMute,
        toggleCallVideo,
        plannerTasks,
        toggleTask,
        addTask,
        notes,
        addNote,
        deleteNote,
        togglePinNote,
        phoneFrameMode,
        setPhoneFrameMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
