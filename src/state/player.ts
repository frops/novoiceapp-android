import create from 'zustand';
import { Audio, AVPlaybackStatusSuccess } from 'expo-av';
import type { Post } from '../types/models';

export interface PlayerTrack {
  id: string;
  title: string;
  uri: string;
  duration?: number;
}

interface PlayerState {
  currentTrack?: PlayerTrack;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  sound?: Audio.Sound;
  setTrack: (post: Post) => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (progress: number) => Promise<void>;
  reset: () => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: undefined,
  isPlaying: false,
  positionMillis: 0,
  durationMillis: 0,
  sound: undefined,
  async setTrack(post) {
    const { sound: currentSound } = get();
    if (currentSound) {
      await currentSound.unloadAsync();
    }
    const sound = new Audio.Sound();
    try {
      await sound.loadAsync({ uri: post.audioUri });
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        const successStatus = status as AVPlaybackStatusSuccess;
        set({
          positionMillis: successStatus.positionMillis,
          durationMillis: successStatus.durationMillis ?? 0,
          isPlaying: successStatus.isPlaying
        });
      });
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        allowsRecordingIOS: false
      });
      await sound.playAsync();
      set({
        currentTrack: {
          id: post.id,
          title: post.title,
          uri: post.audioUri,
          duration: post.duration
        },
        sound,
        isPlaying: true,
        positionMillis: 0,
        durationMillis: (post.duration ?? 0) * 1000
      });
    } catch (error) {
      console.warn('Failed to load audio track', error);
      await sound.unloadAsync().catch(() => undefined);
      set({ sound: undefined, currentTrack: undefined, isPlaying: false });
    }
  },
  async togglePlay() {
    const { sound, isPlaying } = get();
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  },
  async seek(progress) {
    const { sound, durationMillis } = get();
    if (!sound || durationMillis === 0) return;
    const position = progress * durationMillis;
    await sound.setPositionAsync(position);
  },
  async reset() {
    const { sound } = get();
    if (sound) {
      await sound.unloadAsync();
    }
    set({
      currentTrack: undefined,
      isPlaying: false,
      positionMillis: 0,
      durationMillis: 0,
      sound: undefined
    });
  }
}));
