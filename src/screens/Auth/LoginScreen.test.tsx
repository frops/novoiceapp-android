import React from 'react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { LoginScreen } from './LoginScreen';

type SessionSlice = {
  status: string;
  requestMagicLink: jest.Mock;
  confirmMagicLink: jest.Mock;
  error?: string;
  pendingEmail?: string;
  debugCode?: string;
};

const createSessionState = (overrides: Partial<SessionSlice> = {}) => ({
  status: 'unauthenticated',
  requestMagicLink: jest.fn().mockResolvedValue(undefined),
  confirmMagicLink: jest.fn().mockResolvedValue(undefined),
  error: undefined,
  pendingEmail: undefined,
  debugCode: undefined,
  ...overrides
});

let mockSessionState = createSessionState();

jest.mock('../../state/session', () => ({
  useSessionStore: (selector: any) => selector(mockSessionState)
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    mockSessionState = createSessionState();
  });

  it('requests a magic link when a valid email is submitted', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('you@example.com'), 'nova@novoice.dev');
    fireEvent.press(getByText('Send Magic Link'));

    expect(mockSessionState.requestMagicLink).toHaveBeenCalledWith('nova@novoice.dev');
  });

  it('renders verification UI when awaiting link and confirms login', () => {
    mockSessionState = createSessionState({
      status: 'awaiting-link',
      pendingEmail: 'ava@novoice.dev',
      debugCode: '123456'
    });

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);

    expect(getByText(/Enter the 6-digit code/i)).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText('123456'), '654321');
    fireEvent.press(getByText('Confirm Login'));

    expect(mockSessionState.confirmMagicLink).toHaveBeenCalledWith('654321');
  });
});
