/**
 * IndexedDB Persistent Storage for NOVA Universe
 * Handles large media assets (video files, audio files, custom covers, voice messages),
 * school exercise history, chat contacts, friend requests, and user playlists.
 */

import { ShortVideo, MusicTrack, ShortComment, ExerciseResultRecord, ChatMessage, ChatContact, ChatGroup, FriendRequest, MusicPlaylist } from '../types';

const DB_NAME = 'NovaUniverseDB';
const DB_VERSION = 2;

interface StoredMusic {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverArt: string;
  bpm: number;
  mood: string;
  frequencyPreset: 'ambient' | 'synthwave' | 'chillhop' | 'pulsar';
  audioBlob: Blob;
  coverBlob?: Blob;
  isFavorite?: boolean;
  createdAt: string;
}

interface StoredShort {
  id: string;
  title: string;
  creator: string;
  creatorAvatar: string;
  description: string;
  hashtags: string[];
  likes: number;
  commentsCount: number;
  shares: number;
  audioTrack: string;
  visualTheme: 'nebula' | 'cyberpunk' | 'quantum' | 'aurora' | 'deepspace';
  videoBlob: Blob;
  thumbnailBlob?: Blob;
  isLiked?: boolean;
  isFavorited?: boolean;
  createdAt: string;
}

class NovaStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private activeUrls: string[] = [];

  private openDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB non supporté par ce navigateur'));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('user_music')) {
          db.createObjectStore('user_music', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('user_shorts')) {
          db.createObjectStore('user_shorts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('short_comments')) {
          const commentStore = db.createObjectStore('short_comments', { keyPath: 'id' });
          commentStore.createIndex('shortId', 'shortId', { unique: false });
        }
        if (!db.objectStoreNames.contains('exercise_history')) {
          db.createObjectStore('exercise_history', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('user_playlists')) {
          db.createObjectStore('user_playlists', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // Helper to create managed Blob URL
  public createManagedUrl(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    this.activeUrls.push(url);
    return url;
  }

  // --- MUSIC STORAGE ---

  public async saveMusic(
    trackData: Omit<MusicTrack, 'audioUrl'>,
    audioBlob: Blob,
    coverBlob?: Blob
  ): Promise<MusicTrack> {
    const db = await this.openDb();
    let coverArt = trackData.coverArt;

    if (coverBlob) {
      coverArt = this.createManagedUrl(coverBlob);
    }

    const record: StoredMusic = {
      ...trackData,
      coverArt,
      audioBlob,
      coverBlob,
      isFavorite: trackData.isFavorite ?? false,
      createdAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['user_music'], 'readwrite');
      const store = transaction.objectStore('user_music');
      const req = store.put(record);

      req.onsuccess = () => {
        const audioUrl = this.createManagedUrl(audioBlob);
        resolve({
          ...trackData,
          coverArt,
          audioUrl,
          isUserUploaded: true,
          isFavorite: record.isFavorite,
          createdAt: record.createdAt,
        });
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async getAllUserMusic(): Promise<MusicTrack[]> {
    try {
      const db = await this.openDb();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['user_music'], 'readonly');
        const store = transaction.objectStore('user_music');
        const req = store.getAll();

        req.onsuccess = () => {
          const records: StoredMusic[] = req.result || [];
          const tracks: MusicTrack[] = records.map((rec) => {
            const audioUrl = this.createManagedUrl(rec.audioBlob);
            const coverArt = rec.coverBlob ? this.createManagedUrl(rec.coverBlob) : rec.coverArt;
            return {
              id: rec.id,
              title: rec.title,
              artist: rec.artist,
              album: rec.album,
              duration: rec.duration,
              coverArt,
              bpm: rec.bpm,
              mood: rec.mood,
              frequencyPreset: rec.frequencyPreset,
              audioUrl,
              isUserUploaded: true,
              isFavorite: rec.isFavorite,
              createdAt: rec.createdAt,
            };
          });
          resolve(tracks);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  }

  public async updateMusicFavorite(id: string, isFavorite: boolean): Promise<void> {
    try {
      const db = await this.openDb();
      const transaction = db.transaction(['user_music'], 'readwrite');
      const store = transaction.objectStore('user_music');
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const item = getReq.result as StoredMusic;
        if (item) {
          item.isFavorite = isFavorite;
          store.put(item);
        }
      };
    } catch (err) {
      console.warn('Erreur update music favorite:', err);
    }
  }

  public async deleteMusic(id: string): Promise<void> {
    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['user_music'], 'readwrite');
      const store = transaction.objectStore('user_music');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- PLAYLISTS STORAGE ---

  public async savePlaylist(playlist: MusicPlaylist): Promise<void> {
    try {
      const db = await this.openDb();
      const transaction = db.transaction(['user_playlists'], 'readwrite');
      const store = transaction.objectStore('user_playlists');
      store.put(playlist);
    } catch (err) {
      console.warn('Erreur save playlist:', err);
    }
  }

  public async getAllPlaylists(): Promise<MusicPlaylist[]> {
    try {
      const db = await this.openDb();
      return new Promise((resolve) => {
        const transaction = db.transaction(['user_playlists'], 'readonly');
        const store = transaction.objectStore('user_playlists');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  // --- SHORTS STORAGE ---

  public async saveShort(
    shortData: Omit<ShortVideo, 'videoUrl'>,
    videoBlob: Blob,
    thumbnailBlob?: Blob
  ): Promise<ShortVideo> {
    const db = await this.openDb();

    let thumbnailUrl = shortData.thumbnailUrl;
    if (thumbnailBlob) {
      thumbnailUrl = this.createManagedUrl(thumbnailBlob);
    }

    const record: StoredShort = {
      ...shortData,
      hashtags: shortData.hashtags || ['#nova', '#pointenoire', '#shorts'],
      videoBlob,
      thumbnailBlob,
      createdAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['user_shorts'], 'readwrite');
      const store = transaction.objectStore('user_shorts');
      const req = store.put(record);

      req.onsuccess = () => {
        const videoUrl = this.createManagedUrl(videoBlob);
        resolve({
          ...shortData,
          videoUrl,
          thumbnailUrl,
          userUploaded: true,
          createdAt: record.createdAt,
        });
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async getAllUserShorts(): Promise<ShortVideo[]> {
    try {
      const db = await this.openDb();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['user_shorts'], 'readonly');
        const store = transaction.objectStore('user_shorts');
        const req = store.getAll();

        req.onsuccess = () => {
          const records: StoredShort[] = req.result || [];
          const shorts: ShortVideo[] = records.map((rec) => {
            const videoUrl = this.createManagedUrl(rec.videoBlob);
            const thumbnailUrl = rec.thumbnailBlob ? this.createManagedUrl(rec.thumbnailBlob) : undefined;
            return {
              id: rec.id,
              title: rec.title,
              creator: rec.creator,
              creatorAvatar: rec.creatorAvatar,
              description: rec.description,
              hashtags: rec.hashtags,
              likes: rec.likes,
              commentsCount: rec.commentsCount,
              shares: rec.shares,
              audioTrack: rec.audioTrack,
              visualTheme: rec.visualTheme,
              videoUrl,
              thumbnailUrl,
              isLiked: rec.isLiked,
              isFavorited: rec.isFavorited,
              userUploaded: true,
              createdAt: rec.createdAt,
            };
          });
          resolve(shorts);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  }

  public async updateShortInteractions(
    id: string,
    updates: { isLiked?: boolean; isFavorited?: boolean; likes?: number }
  ): Promise<void> {
    try {
      const db = await this.openDb();
      const transaction = db.transaction(['user_shorts'], 'readwrite');
      const store = transaction.objectStore('user_shorts');
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item = getReq.result as StoredShort;
        if (item) {
          if (updates.isLiked !== undefined) item.isLiked = updates.isLiked;
          if (updates.isFavorited !== undefined) item.isFavorited = updates.isFavorited;
          if (updates.likes !== undefined) item.likes = updates.likes;
          store.put(item);
        }
      };
    } catch (err) {
      console.warn('Erreur mise à jour interactions short:', err);
    }
  }

  public async deleteShort(id: string): Promise<void> {
    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['user_shorts'], 'readwrite');
      const store = transaction.objectStore('user_shorts');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- SHORT COMMENTS ---

  public async saveComment(shortId: string, comment: ShortComment): Promise<void> {
    try {
      const db = await this.openDb();
      const transaction = db.transaction(['short_comments'], 'readwrite');
      const store = transaction.objectStore('short_comments');
      store.put({ ...comment, shortId });
    } catch (err) {
      console.warn('Erreur sauvegarde commentaire:', err);
    }
  }

  public async getCommentsForShort(shortId: string): Promise<ShortComment[]> {
    try {
      const db = await this.openDb();
      return new Promise((resolve) => {
        const transaction = db.transaction(['short_comments'], 'readonly');
        const store = transaction.objectStore('short_comments');
        const index = store.index('shortId');
        const req = index.getAll(shortId);

        req.onsuccess = () => {
          resolve(req.result || []);
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  // --- SCHOOL EXERCISE HISTORY ---

  public async saveExerciseResult(result: ExerciseResultRecord): Promise<void> {
    try {
      const db = await this.openDb();
      const transaction = db.transaction(['exercise_history'], 'readwrite');
      const store = transaction.objectStore('exercise_history');
      store.put(result);
    } catch (err) {
      console.warn('Erreur sauvegarde exercice:', err);
    }
  }

  public async getExerciseHistory(): Promise<ExerciseResultRecord[]> {
    try {
      const db = await this.openDb();
      return new Promise((resolve) => {
        const transaction = db.transaction(['exercise_history'], 'readonly');
        const store = transaction.objectStore('exercise_history');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }
}

export const novaStorage = new NovaStorageService();
