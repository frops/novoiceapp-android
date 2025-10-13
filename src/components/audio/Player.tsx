import React, { useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { usePlayerStore } from '../../state/player';

const formatTime = (millis: number) => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const Player: React.FC = () => {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const positionMillis = usePlayerStore((state) => state.positionMillis);
  const durationMillis = usePlayerStore((state) => state.durationMillis);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const seek = usePlayerStore((state) => state.seek);
  const reset = usePlayerStore((state) => state.reset);

  const [barWidth, setBarWidth] = useState(1);

  const progress = useMemo(() => {
    if (!durationMillis) return 0;
    return Math.min(positionMillis / durationMillis, 1);
  }, [durationMillis, positionMillis]);

  const handleSeek = async (event: any) => {
    if (!durationMillis) return;
    const ratio = Math.min(Math.max(event.nativeEvent.locationX / barWidth, 0), 1);
    await seek(ratio);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width || 1);
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text numberOfLines={1} style={styles.title}>
          {currentTrack.title}
        </Text>
        <TouchableOpacity onPress={reset}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>
      <Pressable onPress={handleSeek} onLayout={handleLayout} style={styles.progressBar}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { flex: progress }]} />
          <View style={{ flex: 1 - progress }} />
        </View>
      </Pressable>
      <View style={styles.timeRow}>
        <Text style={styles.time}>{formatTime(positionMillis)}</Text>
        <Text style={styles.time}>{formatTime(durationMillis)}</Text>
      </View>
      <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
        <Text style={styles.playLabel}>{isPlaying ? 'Pause' : 'Play'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 12
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
    marginRight: 12
  },
  close: {
    color: '#94a3b8',
    fontSize: 18
  },
  progressBar: {
    height: 24,
    justifyContent: 'center'
  },
  progressBackground: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    height: 6,
    flexDirection: 'row',
    overflow: 'hidden'
  },
  progressFill: {
    backgroundColor: '#38bdf8'
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  time: {
    color: '#cbd5f5',
    fontVariant: ['tabular-nums']
  },
  playButton: {
    alignSelf: 'center',
    backgroundColor: '#38bdf8',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999
  },
  playLabel: {
    color: '#0f172a',
    fontWeight: '700'
  }
});

export default Player;
