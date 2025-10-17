import React from 'react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Audio } from 'expo-av';
import { RecordScreen } from './RecordScreen';
import { mockBackend } from '../../services/mockBackend';

type SessionSlice = {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
};

type FeedSlice = {
  addPost: jest.Mock;
};

const createSessionState = (overrides: Partial<SessionSlice> = {}) => ({
  user: {
    id: 'user-1',
    email: 'creator@novoice.dev',
    name: 'Creator'
  },
  ...overrides
});

const createFeedState = (overrides: Partial<FeedSlice> = {}) => ({
  addPost: jest.fn(),
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

jest.mock('../../services/mockBackend', () => {
  const requestUploadUrl = jest.fn();
  const publishPost = jest.fn();

  return {
    mockBackend: {
      requestUploadUrl,
      publishPost
    }
  };
});

describe('RecordScreen', () => {
  beforeEach(() => {
    mockSessionState = createSessionState();
    mockFeedState = createFeedState();

    (mockBackend.requestUploadUrl as jest.Mock).mockResolvedValue({
      uploadUrl: 'https://cdn.novoice/upload',
      fileUrl: 'https://cdn.novoice/audio/mock.m4a'
    });
    (mockBackend.publishPost as jest.Mock).mockResolvedValue({
      id: 'post-123',
      title: 'Voice post mock',
      author: { id: 'user-1', name: 'Creator', email: 'creator@novoice.dev' },
      createdAt: new Date().toISOString(),
      audioUri: 'https://cdn.novoice/audio/mock.m4a'
    });
  });

  it('records and publishes a voice note', async () => {
    const { getByTestId, findByText } = render(<RecordScreen />);

    const recordPressable = getByTestId('record-button');

    await act(async () => {
      fireEvent(recordPressable, 'pressIn');
    });

    const recordings = (Audio as any).__getRecordingInstances() as any[];
    expect(recordings.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent(recordPressable, 'pressOut');
    });

    await findByText('Play Preview');

    const publishButton = await findByText('Publish');

    await act(async () => {
      fireEvent.press(publishButton);
    });

    await waitFor(() => {
      expect(mockBackend.requestUploadUrl).toHaveBeenCalledTimes(1);
      expect(mockBackend.publishPost).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          audioUri: 'https://cdn.novoice/audio/mock.m4a'
        })
      );
      expect(mockFeedState.addPost).toHaveBeenCalled();
    });
  });
});
