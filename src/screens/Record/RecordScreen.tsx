import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useFeedStore } from '../../state/feed';
import { useSessionStore } from '../../state/session';
import { mockBackend } from '../../services/mockBackend';

const MAX_DURATION = 60_000;

const uploadRecording = async (uri: string) => {
  const { uploadUrl, fileUrl } = await mockBackend.requestUploadUrl();
  if (uploadUrl.startsWith('mock://')) {
    // Offline mock path – in production replace with real FileSystem.uploadAsync call.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return fileUrl;
  }
  await FileSystem.uploadAsync(uploadUrl, uri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    mimeType: 'audio/m4a'
  });
  return fileUrl;
};

export function RecordScreen(): React.JSX.Element {
  const user = useSessionStore((state) => state.user);
  const addPost = useFeedStore((state) => state.addPost);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [duration, setDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [previewSound, setPreviewSound] = useState<Audio.Sound | null>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Hold to start recording');

  const formattedDuration = useMemo(() => {
    const seconds = Math.min(Math.floor(duration / 1000), 60);
    return `${seconds}s`;
  }, [duration]);

  useEffect(() => {
    return () => {
      if (previewSound) {
        previewSound.unloadAsync();
      }
      const activeRecording = recordingRef.current;
      if (activeRecording) {
        activeRecording.stopAndUnloadAsync().catch(() => undefined);
      }
    };
  }, [previewSound]);

  const resetRecordingState = useCallback(() => {
    const activeRecording = recordingRef.current;
    if (activeRecording) {
      activeRecording.stopAndUnloadAsync().catch(() => undefined);
    }
    setDuration(0);
    setRecordingUri(null);
    recordingRef.current = null;
    setPreviewSound((existing) => {
      if (existing) {
        existing.unloadAsync();
      }
      return null;
    });
    setPreviewPlaying(false);
    setStatusMessage('Hold to start recording');
  }, []);

  const stopCurrentRecording = useCallback(async () => {
    const activeRecording = recordingRef.current;
    if (!activeRecording) return;
    try {
      await activeRecording.stopAndUnloadAsync();
      const uri = activeRecording.getURI();
      if (uri) {
        setRecordingUri(uri);
        setStatusMessage('Recording complete. Preview or publish!');
      }
    } catch (err) {
      console.warn('Failed to stop recording', err);
      Alert.alert('Recording error', 'Unable to stop recording. Please try again.');
    }
    recordingRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Microphone permission required');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      newRecording.setOnRecordingStatusUpdate((status) => {
        if (!status.canRecord) {
          return;
        }
        setDuration(status.durationMillis ?? 0);
        if ((status.durationMillis ?? 0) >= MAX_DURATION) {
          stopCurrentRecording();
        }
      });
      recordingRef.current = newRecording;
      await newRecording.startAsync();
      setStatusMessage('Recording… release to stop');
    } catch (err) {
      console.warn('Failed to start recording', err);
      Alert.alert('Recording error', 'Could not start recording.');
      recordingRef.current = null;
    }
  }, [stopCurrentRecording]);

  const handlePressIn = useCallback(async () => {
    resetRecordingState();
    await startRecording();
  }, [resetRecordingState, startRecording]);

  const handlePressOut = useCallback(async () => {
    await stopCurrentRecording();
  }, [stopCurrentRecording]);

  const togglePreview = useCallback(async () => {
    if (!recordingUri) return;
    if (!previewSound) {
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (!status.isPlaying) {
          setPreviewPlaying(false);
        }
      });
      setPreviewSound(sound);
      setPreviewPlaying(true);
      await sound.playAsync();
      return;
    }
    if (previewPlaying) {
      await previewSound.pauseAsync();
      setPreviewPlaying(false);
    } else {
      await previewSound.playAsync();
      setPreviewPlaying(true);
    }
  }, [previewPlaying, previewSound, recordingUri]);

  const handlePublish = useCallback(async () => {
    if (!recordingUri) {
      Alert.alert('Record something first');
      return;
    }
    if (!user) {
      Alert.alert('Please sign in to publish');
      return;
    }
    setUploading(true);
    try {
      const remoteUri = await uploadRecording(recordingUri);
      const post = await mockBackend.publishPost(user.id, {
        title: `Voice post ${new Date().toLocaleTimeString()}`,
        audioUri: remoteUri,
        duration: Math.floor(duration / 1000)
      });
      addPost(post);
      resetRecordingState();
      Alert.alert('Published!', 'Your voice post is now live in the feed.');
    } catch (err) {
      console.warn('Upload failed', err);
      Alert.alert('Upload failed', 'Could not upload audio. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [addPost, duration, recordingUri, resetRecordingState, user]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Record a voice update</Text>
        <Text style={styles.subHeading}>{statusMessage}</Text>
        <Pressable
          testID="record-button"
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [styles.recordButton, pressed ? styles.recordButtonActive : null]}
        >
          <Text style={styles.recordLabel}>{formattedDuration}</Text>
        </Pressable>
        {recordingUri && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.previewButton} onPress={togglePreview}>
              <Text style={styles.previewLabel}>
                {previewPlaying ? 'Pause Preview' : 'Play Preview'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.publishButton, uploading ? styles.publishDisabled : null]}
              onPress={handlePublish}
              disabled={uploading}
            >
              <Text style={styles.publishLabel}>{uploading ? 'Uploading…' : 'Publish'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center'
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 24
  },
  heading: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '700'
  },
  subHeading: {
    color: '#94a3b8',
    textAlign: 'center'
  },
  recordButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38bdf8',
    shadowOpacity: 0.45,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12
  },
  recordButtonActive: {
    backgroundColor: '#38bdf8'
  },
  recordLabel: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700'
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    gap: 16
  },
  previewButton: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  previewLabel: {
    color: '#38bdf8',
    fontWeight: '600'
  },
  publishButton: {
    flex: 1,
    backgroundColor: '#38bdf8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  publishDisabled: {
    opacity: 0.6
  },
  publishLabel: {
    color: '#020617',
    fontWeight: '700'
  }
});
