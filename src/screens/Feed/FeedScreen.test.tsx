/* eslint-env jest */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import FeedScreen from './FeedScreen';

type FeedSlice = {
  posts: any[];
  fetchNext: jest.Mock;
  refresh: jest.Mock;
  loading: boolean;
  hasMore: boolean;
  toggleLike: jest.Mock;
};

type PlayerSlice = {
  currentTrack?: { id: string };
  setTrack: jest.Mock;
};

const createFeedPost = () => ({
  id: 'post-1',
  title: 'Community drop',
  author: { id: 'author-1', name: 'Creator One' },
  createdAt: new Date().toISOString(),
  liked: false
});

const createFeedState = (overrides: Partial<FeedSlice> = {}) => ({
  posts: [],
  fetchNext: jest.fn().mockResolvedValue(undefined),
  refresh: jest.fn().mockResolvedValue(undefined),
  loading: false,
  hasMore: true,
  toggleLike: jest.fn(),
  ...overrides
});

const createPlayerState = (overrides: Partial<PlayerSlice> = {}) => ({
  currentTrack: undefined,
  setTrack: jest.fn().mockResolvedValue(undefined),
  ...overrides
});

let mockFeedState = createFeedState();
let mockPlayerState = createPlayerState();

jest.mock('../../state/feed', () => ({
  useFeedStore: (selector: any) => selector(mockFeedState)
}));

jest.mock('../../state/player', () => ({
  usePlayerStore: (selector: any) => selector(mockPlayerState)
}));

jest.mock('../../components/audio/Player', () => ({
  Player: jest.fn(() => null)
}));

describe('FeedScreen', () => {
  beforeEach(() => {
    mockFeedState = createFeedState();
    mockPlayerState = createPlayerState();
  });

  it('fetches the first page on mount when feed is empty', async () => {
    render(<FeedScreen />);

    await waitFor(() => {
      expect(mockFeedState.fetchNext).toHaveBeenCalledTimes(1);
    });
  });

  it('allows liking a post and playing audio', async () => {
    const post = createFeedPost();
    mockFeedState = createFeedState({ posts: [post] });

    const { getByText } = render(<FeedScreen />);

    fireEvent.press(getByText('♡ Like'));
    expect(mockFeedState.toggleLike).toHaveBeenCalledWith('post-1');

    fireEvent.press(getByText('Play Post'));
    await waitFor(() => {
      expect(mockPlayerState.setTrack).toHaveBeenCalledWith(post);
    });
  });
});
