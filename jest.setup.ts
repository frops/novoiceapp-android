import '@testing-library/jest-native/extend-expect';
import { Alert, NativeModules } from 'react-native';

jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

if (!(NativeModules as any).default) {
  (NativeModules as any).default = NativeModules;
}

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => undefined;
  return Reanimated;
});

jest.mock('expo-av', () => {
  const recordingInstances: any[] = [];

  class MockSound {
    playAsync = jest.fn().mockResolvedValue(undefined);
    pauseAsync = jest.fn().mockResolvedValue(undefined);
    unloadAsync = jest.fn().mockResolvedValue(undefined);
    setOnPlaybackStatusUpdate = jest.fn();
  }

  class MockRecording {
    _statusCallback?: (status: any) => void;

    constructor() {
      recordingInstances.push(this);
    }

    prepareToRecordAsync = jest.fn().mockResolvedValue(undefined);
    setOnRecordingStatusUpdate = jest.fn((callback: (status: any) => void) => {
      this._statusCallback = callback;
    });
    startAsync = jest.fn().mockResolvedValue(undefined);
    stopAndUnloadAsync = jest.fn().mockResolvedValue(undefined);
    getURI = jest.fn(() => 'file://mock-recording.m4a');
  }

  const Audio = {
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
    Recording: MockRecording,
    Sound: {
      createAsync: jest.fn(async () => ({
        sound: new MockSound()
      }))
    },
    RecordingOptionsPresets: {
      HIGH_QUALITY: {}
    },
    __getRecordingInstances: () => recordingInstances
  };

  return { Audio };
});

jest.mock('expo-file-system', () => ({
  uploadAsync: jest.fn().mockResolvedValue({}),
  FileSystemUploadType: { BINARY_CONTENT: 'BINARY_CONTENT' }
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: 'granted', granted: true }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true })
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined)
}));
