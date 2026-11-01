export type SectionId = 
  | 'home'
  | 'ai'
  | 'weather'
  | 'shorts'
  | 'music'
  | 'school'
  | 'chat'
  | 'planner'
  | 'notes';

export interface UserProfile {
  name: string;
  handle: string; // Unique NOVA ID, e.g. @alexandre.cg
  avatar: string;
  status: string;
  level: string;
  universePoints: number;
  country: string;
  currency: string; // e.g. "FCFA"
  phone: string; // e.g. "+242 06 912 34 56"
  isPhoneVerified: boolean;
  hidePhone: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  category: 'system' | 'school' | 'chat' | 'weather';
}

export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  condition: string;
  iconName: string;
  high: number;
  low: number;
  feelsLike: number;
  humidity: number;
  wind: number;
  uv: number;
  airQuality: string;
  hourly: { time: string; temp: number; icon: string; condition?: string }[];
  daily: { day: string; condition: string; high: number; low: number; icon: string }[];
  latitude?: number;
  longitude?: number;
  lastUpdated?: string;
  isLoading?: boolean;
}

// --- NOVA SHORTS ---
export interface ShortComment {
  id: string;
  author: string;
  text: string;
  time: string;
  avatar?: string;
}

export interface ShortVideo {
  id: string;
  title: string;
  creator: string;
  creatorAvatar: string;
  description: string;
  hashtags?: string[];
  likes: number;
  commentsCount: number;
  shares: number;
  viewsCount?: number;
  audioTrack: string;
  visualTheme: 'nebula' | 'cyberpunk' | 'quantum' | 'aurora' | 'deepspace';
  videoUrl?: string; // Real video URL (Blob or MP4 stream)
  thumbnailUrl?: string;
  duration?: number; // duration in seconds
  isLiked?: boolean;
  isFavorited?: boolean;
  userUploaded?: boolean;
  createdAt?: string;
}

// --- NOVA MUSIC ---
export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverArt: string;
  bpm: number;
  mood: string;
  frequencyPreset: 'ambient' | 'synthwave' | 'chillhop' | 'pulsar';
  audioUrl?: string; // Real audio file URL (Blob or audio stream)
  isUserUploaded?: boolean;
  isFavorite?: boolean;
  createdAt?: string;
  fileSize?: string;
}

export interface MusicPlaylist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  coverArt: string;
  createdAt: string;
}

// --- NOVA SCHOOL (ÉDUCATION & EXERCICES) ---
export type SchoolSubject = 
  | 'maths'
  | 'physique'
  | 'svt'
  | 'francais'
  | 'anglais'
  | 'histoire_geo'
  | 'philo';

export type ExerciseDifficulty = 'facile' | 'moyen' | 'difficile';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  stepByStepDetails?: string[];
}

export interface SchoolExercise {
  id: string;
  subject: SchoolSubject;
  subjectLabel: string;
  chapter: string;
  title: string;
  difficulty: ExerciseDifficulty;
  durationMinutes: number;
  summary: string;
  curriculum: string; // e.g. "Terminale C & D / Bac Congo"
  questions: QuizQuestion[];
}

export interface ExerciseResultRecord {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  subject: SchoolSubject;
  subjectLabel: string;
  difficulty: ExerciseDifficulty;
  score: number; // percentage e.g. 80
  totalQuestions: number;
  correctAnswers: number;
  elapsedSeconds: number;
  completedAt: string;
}

export interface HomeworkItem {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: 'haute' | 'moyenne' | 'basse';
}

export interface CourseItem {
  id: string;
  subject: string;
  room: string;
  teacher: string;
  time: string;
  day: string;
}

// --- NOVA CHAT (MESSAGERIE DISTANTE & APPELS) ---
export type MessageType = 'text' | 'voice' | 'image' | 'video' | 'document';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: MessageType;
  text: string;
  mediaUrl?: string; // Blob or URL for voice/image/video/document
  fileName?: string;
  fileSize?: string;
  voiceDuration?: number; // in seconds
  timestamp: string;
  isSelf: boolean;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatContact {
  id: string;
  novaId: string; // @handle
  name: string;
  phone: string;
  city: string;
  country: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  lastSeen?: string;
  isFriend: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface FriendRequest {
  id: string;
  fromUser: ChatContact;
  sentAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ChatGroup {
  id: string;
  name: string;
  avatar: string;
  description: string;
  memberIds: string[];
  createdBy: string;
  createdAt: string;
}

export interface ActiveCallState {
  isActive: boolean;
  type: 'audio' | 'video';
  contact: ChatContact | null;
  status: 'connecting' | 'connected' | 'ended';
  isMuted: boolean;
  isVideoOff: boolean;
  startedAt?: number;
}

// --- NOVA PLANNER & NOTES ---
export interface PlannerTask {
  id: string;
  title: string;
  time: string;
  date: string;
  category: 'Études' | 'Personnel' | 'Projet' | 'Sport';
  completed: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: 'Idées' | 'Cours' | 'Projets' | 'Perso';
  date: string;
  pinned: boolean;
  color: string;
}
