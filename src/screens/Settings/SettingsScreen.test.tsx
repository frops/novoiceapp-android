import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Linking } from 'react-native';
import SettingsScreen from './SettingsScreen';

type SessionSlice = {
  logout: jest.Mock;
  token?: string;
};

const createSessionState = (overrides: Partial<SessionSlice> = {}) => ({
  logout: jest.fn().mockResolvedValue(undefined),
  token: 'token-1234567890',
  ...overrides
});

let mockSessionState = createSessionState();

jest.mock('../../state/session', () => ({
  useSessionStore: (selector: any) => selector(mockSessionState)
}));

describe('SettingsScreen', () => {
  beforeEach(() => {
    mockSessionState = createSessionState();
  });

  it('opens privacy policy link', () => {
    const openUrlSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const { getByText } = render(<SettingsScreen />);

    fireEvent.press(getByText('Privacy Policy'));

    expect(openUrlSpy).toHaveBeenCalledWith('https://novoice.app/privacy');
  });

  it('logs out when sign out is pressed', async () => {
    const { getByText } = render(<SettingsScreen />);

    fireEvent.press(getByText('Sign out'));

    expect(mockSessionState.logout).toHaveBeenCalled();
  });
});
