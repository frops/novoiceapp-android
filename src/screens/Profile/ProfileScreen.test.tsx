import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import ProfileScreen from './ProfileScreen';

type SessionSlice = {
  user?: {
    id: string;
    email: string;
    name?: string;
    bio?: string;
    followers?: number;
    following?: number;
  };
  updateProfile: jest.Mock;
  toggleFollow: jest.Mock;
  following: Record<string, boolean>;
};

type FeedSlice = {
  posts: any[];
  replaceUserPosts: jest.Mock;
};

const createSessionState = (overrides: Partial<SessionSlice> = {}) => ({
  user: {
    id: 'user-1',
    email: 'creator@novoice.dev',
    name: 'Creator',
    bio: 'Voice-first storytelling',
    followers: 10,
    following: 5
  },
  updateProfile: jest.fn().mockResolvedValue(undefined),
  toggleFollow: jest.fn().mockResolvedValue(undefined),
  following: {},
  ...overrides
});

const createFeedState = (overrides: Partial<FeedSlice> = {}) => ({
  posts: [
    {
      id: 'post-1',
      title: 'Hello world',
      author: { id: 'user-1', name: 'Creator' },
      createdAt: new Date().toISOString()
    }
  ],
  replaceUserPosts: jest.fn(),
  ...overrides
});

let mockSessionState = createSessionState();
let mockFeedState = createFeedState();

jest.mock('../../state/session', () => ({
  useSessionStore: (selector: any) => selector(mockSessionState)
}));

jest.mock('../../state/feed', () => ({
  useFeedStore: (selector: any) => selector(mockFeedState)
}));

describe('ProfileScreen', () => {
  beforeEach(() => {
    mockSessionState = createSessionState();
    mockFeedState = createFeedState();
  });

  it('updates profile information', async () => {
    const { getByDisplayValue, getByText } = render(<ProfileScreen />);

    fireEvent.changeText(getByDisplayValue('Creator'), 'New Name');
    fireEvent.press(getByText('Save profile'));

    await waitFor(() => {
      expect(mockSessionState.updateProfile).toHaveBeenCalledWith({
        name: 'New Name',
        bio: 'Voice-first storytelling',
        avatarUrl: ''
      });
      expect(mockFeedState.replaceUserPosts).toHaveBeenCalledWith(
        'user-1',
        expect.any(Function)
      );
    });
  });

  it('toggles follow suggestions', async () => {
    const { getAllByText } = render(<ProfileScreen />);

    await act(async () => {
      const followButtons = getAllByText('Follow');
      fireEvent.press(followButtons[0]);
    });

    expect(mockSessionState.toggleFollow).toHaveBeenCalledWith('creator-1');
  });
});
