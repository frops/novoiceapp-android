import type { Post, SessionUser } from '../types/models';

interface FeedPage {
  posts: Post[];
  hasMore: boolean;
}

interface MagicLinkRecord {
  code: string;
  token: string;
  email: string;
}

interface CreatePostInput {
  title: string;
  audioUri: string;
  duration?: number;
  waveform?: number[];
}

const simulateNetwork = async (delay = 300) =>
  new Promise<void>((resolve) => setTimeout(resolve, delay));

const randomCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const sampleAudio =
  'https://github.com/SergLam/Audio-Sample-files/raw/master/sample.wav';

export class MockBackend {
  private users = new Map<string, SessionUser>();
  private tokens = new Map<string, string>();
  private magicLinks = new Map<string, MagicLinkRecord>();
  private posts: Post[] = [];
  private followers = new Map<string, Set<string>>();
  private following = new Map<string, Set<string>>();
  private likes = new Map<string, Set<string>>();

  constructor() {
    this.seed();
  }

  private seed() {
    const demoEmails = [
      'ava@novoice.dev',
      'ben@novoice.dev',
      'cody@novoice.dev',
      'devin@novoice.dev',
      'emerald@novoice.dev'
    ];
    demoEmails.forEach((email, index) => {
      const user = this.ensureUser(email, `Creator ${index + 1}`);
      user.followers = Math.floor(Math.random() * 5000);
      user.following = Math.floor(Math.random() * 1000);
    });
    for (let i = 0; i < 25; i += 1) {
      const author = demoEmails[i % demoEmails.length];
      const post: Post = {
        id: `seed-post-${i}`,
        title: `Community drop ${i + 1}`,
        author: this.ensureUser(author),
        createdAt: new Date(Date.now() - i * 1000 * 60 * 12).toISOString(),
        audioUri: sampleAudio,
        waveform: this.randomWaveform(),
        duration: 60 + (i % 15)
      };
      this.posts.push(post);
    }
  }

  private ensureUser(email: string, name?: string): SessionUser {
    const existing = this.users.get(email);
    if (existing) {
      return existing;
    }
    const user: SessionUser = {
      id: `user-${email}`,
      email,
      name: name ?? email.split('@')[0],
      bio: 'Voice-first storytelling',
      followers: 0,
      following: 0
    };
    this.users.set(email, user);
    return user;
  }

  private randomWaveform() {
    return Array.from({ length: 30 }, () => Number(Math.random().toFixed(2)));
  }

  async requestMagicLink(email: string) {
    await simulateNetwork(400);
    if (!email.includes('@')) {
      throw new Error('Provide a valid email address.');
    }
    this.ensureUser(email);
    const record: MagicLinkRecord = {
      email,
      code: randomCode(),
      token: `${email}:${Date.now()}`
    };
    this.magicLinks.set(email, record);
    return { code: record.code };
  }

  async confirmMagicLink(email: string, code: string) {
    await simulateNetwork(350);
    const pending = this.magicLinks.get(email);
    if (!pending) {
      throw new Error('Magic link expired. Request a new one.');
    }
    if (pending.code !== code) {
      throw new Error('Invalid verification code.');
    }
    this.magicLinks.delete(email);
    this.tokens.set(pending.token, email);
    const user = { ...this.ensureUser(email) };
    return { token: pending.token, user };
  }

  async restoreSession(token: string) {
    await simulateNetwork(250);
    const email = this.tokens.get(token);
    if (!email) {
      throw new Error('Session expired');
    }
    return { user: { ...this.ensureUser(email) } };
  }

  async fetchFeed(
    page: number,
    pageSize: number,
    userId?: string
  ): Promise<FeedPage> {
    await simulateNetwork(500);
    const start = (page - 1) * pageSize;
    const slice = this.posts.slice(start, start + pageSize).map((post) => {
      const likes = this.likes.get(post.id);
      const liked = userId ? likes?.has(userId) ?? false : false;
      return {
        ...post,
        liked,
        author: { ...this.ensureUser(post.author.email) }
      };
    });
    return {
      posts: slice,
      hasMore: start + pageSize < this.posts.length
    };
  }

  async updateProfile(userId: string, input: Partial<SessionUser>) {
    await simulateNetwork(300);
    const user = Array.from(this.users.values()).find((item) => item.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    const next = { ...user, ...input };
    this.users.set(user.email, next);
    return { ...next };
  }

  async requestUploadUrl() {
    await simulateNetwork(200);
    const id = Date.now();
    return {
      uploadUrl: `mock://novoice/uploads/${id}`,
      fileUrl: `https://cdn.novoice.app/audio/${id}.m4a`
    };
  }

  async publishPost(authorId: string, input: CreatePostInput) {
    await simulateNetwork(400);
    const author = Array.from(this.users.values()).find(
      (item) => item.id === authorId
    );
    if (!author) {
      throw new Error('Author not found');
    }
    const post: Post = {
      id: `user-post-${Date.now()}`,
      title: input.title,
      author: { ...author },
      createdAt: new Date().toISOString(),
      audioUri: input.audioUri,
      duration: input.duration,
      waveform: input.waveform ?? this.randomWaveform(),
      liked: false
    };
    this.posts.unshift(post);
    return { ...post };
  }

  async toggleFollow(actorId: string, targetId: string) {
    await simulateNetwork(150);
    const actor = Array.from(this.users.values()).find((user) => user.id === actorId);
    let target = Array.from(this.users.values()).find((user) => user.id === targetId);
    if (!actor) {
      throw new Error('User not found');
    }
    if (!target) {
      target = {
        id: targetId,
        email: `${targetId}@novoice.dev`,
        name: targetId
          .split('-')
          .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
          .join(' '),
        bio: 'Novoice creator',
        followers: 0,
        following: 0
      };
      this.users.set(target.email, target);
    }
    const actorFollowing = this.following.get(actorId) ?? new Set<string>();
    const targetFollowers = this.followers.get(targetId) ?? new Set<string>();
    if (actorFollowing.has(targetId)) {
      actorFollowing.delete(targetId);
      targetFollowers.delete(actorId);
    } else {
      actorFollowing.add(targetId);
      targetFollowers.add(actorId);
    }
    this.following.set(actorId, actorFollowing);
    this.followers.set(targetId, targetFollowers);
    actor.following = actorFollowing.size;
    target.followers = targetFollowers.size;
    return {
      actor: { ...actor },
      target: { ...target },
      actorFollowing: this.getFollowing(actorId)
    };
  }

  async toggleLike(userId: string | undefined, postId: string) {
    await simulateNetwork(120);
    const likeSet = this.likes.get(postId) ?? new Set<string>();
    let liked = false;
    if (userId) {
      if (likeSet.has(userId)) {
        likeSet.delete(userId);
      } else {
        likeSet.add(userId);
      }
      liked = likeSet.has(userId);
    } else {
      liked = !likeSet.has('anonymous');
      if (liked) {
        likeSet.add('anonymous');
      } else {
        likeSet.delete('anonymous');
      }
    }
    this.likes.set(postId, likeSet);
    return { liked };
  }

  getFollowing(userId: string) {
    const following = this.following.get(userId);
    if (!following) return {};
    return Array.from(following.values()).reduce<Record<string, boolean>>(
      (acc, id) => ({
        ...acc,
        [id]: true
      }),
      {}
    );
  }
}

export const mockBackend = new MockBackend();
