export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
  followers?: number;
  following?: number;
}

export interface Post {
  id: string;
  title: string;
  author: SessionUser;
  createdAt: string;
  audioUri: string;
  waveform?: number[];
  duration?: number;
  liked?: boolean;
}
