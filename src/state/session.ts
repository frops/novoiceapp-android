import create from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { mockBackend } from '../services/mockBackend';
import type { SessionUser } from '../types/models';

export type SessionStatus =
  | 'initializing'
  | 'unauthenticated'
  | 'awaiting-link'
  | 'loading'
  | 'authenticated'
  | 'error';

interface SessionState {
  status: SessionStatus;
  user?: SessionUser;
  token?: string;
  error?: string;
  pendingEmail?: string;
  following: Record<string, boolean>;
  debugCode?: string;
  initialize: () => Promise<void>;
  requestMagicLink: (email: string) => Promise<void>;
  confirmMagicLink: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: Partial<SessionUser>) => Promise<void>;
  toggleFollow: (userId: string) => Promise<void>;
}

const TOKEN_KEY = 'novoiceapp.token';

export const useSessionStore = create<SessionState>((set, get) => ({
  status: 'initializing',
  following: {},
  error: undefined,
  pendingEmail: undefined,
  debugCode: undefined,
  async initialize() {
    set({ status: 'initializing' });
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token) {
      set({ status: 'unauthenticated', token: undefined, user: undefined });
      return;
    }
    try {
      const { user } = await mockBackend.restoreSession(token);
      const following = mockBackend.getFollowing(user.id);
      set({
        status: 'authenticated',
        token,
        user,
        error: undefined,
        pendingEmail: undefined,
        following,
        debugCode: undefined
      });
    } catch (error) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      set({ status: 'unauthenticated', token: undefined, user: undefined });
    }
  },
  async requestMagicLink(email) {
    set({ status: 'loading', error: undefined });
    try {
      const { code } = await mockBackend.requestMagicLink(email);
      set({
        status: 'awaiting-link',
        pendingEmail: email,
        error: undefined,
        debugCode: code
      });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        debugCode: undefined
      });
    }
  },
  async confirmMagicLink(code) {
    const { pendingEmail } = get();
    if (!pendingEmail) {
      set({ status: 'error', error: 'No pending login request found.' });
      return;
    }
    set({ status: 'loading', error: undefined });
    try {
      const { token, user } = await mockBackend.confirmMagicLink(
        pendingEmail,
        code
      );
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      const following = mockBackend.getFollowing(user.id);
      set({
        status: 'authenticated',
        token,
        user,
        pendingEmail: undefined,
        error: undefined,
        following,
        debugCode: undefined
      });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        debugCode: undefined
      });
    }
  },
  async logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({
      status: 'unauthenticated',
      user: undefined,
      token: undefined,
      following: {},
      pendingEmail: undefined,
      error: undefined,
      debugCode: undefined
    });
  },
  async updateProfile(input) {
    const { user } = get();
    if (!user) return;
    try {
      const updated = await mockBackend.updateProfile(user.id, input);
      set({ user: updated });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  },
  async toggleFollow(userId) {
    const { user } = get();
    if (!user) return;
    try {
      const { actorFollowing, actor } = await mockBackend.toggleFollow(
        user.id,
        userId
      );
      set({ following: actorFollowing, user: actor });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}));

export type { SessionUser } from '../types/models';
