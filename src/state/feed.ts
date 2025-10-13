import create from 'zustand';
import { mockBackend } from '../services/mockBackend';
import type { Post } from '../types/models';
import { useSessionStore } from './session';

interface FeedState {
  posts: Post[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  error?: string;
  fetchNext: () => Promise<void>;
  refresh: () => Promise<void>;
  addPost: (post: Post) => void;
  toggleLike: (postId: string) => void;
  replaceUserPosts: (userId: string, updater: (post: Post) => Post) => void;
}

const PAGE_SIZE = 5;

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  page: 0,
  hasMore: true,
  loading: false,
  async fetchNext() {
    const { loading, hasMore, page, posts } = get();
    if (loading || !hasMore) return;
    set({ loading: true, error: undefined });
    try {
      const nextPage = page + 1;
      const userId = useSessionStore.getState().user?.id;
      const { posts: newPosts, hasMore: more } = await mockBackend.fetchFeed(
        nextPage,
        PAGE_SIZE,
        userId
      );
      set({
        posts: [...posts, ...newPosts],
        page: nextPage,
        hasMore: more,
        loading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error),
        loading: false
      });
    }
  },
  async refresh() {
    set({ page: 0, posts: [], hasMore: true });
    await get().fetchNext();
  },
  addPost(post) {
    const { posts } = get();
    set({ posts: [post, ...posts] });
  },
  toggleLike(postId) {
    const { posts } = get();
    const userId = useSessionStore.getState().user?.id;
    set({
      posts: posts.map((post) =>
        post.id === postId ? { ...post, liked: !post.liked } : post
      )
    });
    mockBackend
      .toggleLike(userId, postId)
      .then(({ liked }) => {
        const currentPosts = get().posts;
        set({
          posts: currentPosts.map((post) =>
            post.id === postId ? { ...post, liked } : post
          )
        });
      })
      .catch(() => {
        const currentPosts = get().posts;
        set({
          posts: currentPosts.map((post) =>
            post.id === postId ? { ...post, liked: !post.liked } : post
          )
        });
      });
  },
  replaceUserPosts(userId, updater) {
    const { posts } = get();
    set({
      posts: posts.map((post) =>
        post.author.id === userId ? updater(post) : post
      )
    });
  }
}));
