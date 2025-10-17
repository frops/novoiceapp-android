import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useFeedStore } from '../../state/feed';
import { usePlayerStore } from '../../state/player';
import Player from '../../components/audio/Player';

const FeedScreen: React.FC = () => {
  const posts = useFeedStore((state) => state.posts);
  const fetchNext = useFeedStore((state) => state.fetchNext);
  const refresh = useFeedStore((state) => state.refresh);
  const loading = useFeedStore((state) => state.loading);
  const hasMore = useFeedStore((state) => state.hasMore);
  const toggleLike = useFeedStore((state) => state.toggleLike);

  const setTrack = usePlayerStore((state) => state.setTrack);
  const currentTrack = usePlayerStore((state) => state.currentTrack);

  useEffect(() => {
    if (posts.length === 0) {
      fetchNext();
    }
  }, [fetchNext, posts.length]);

  const handleEndReached = useCallback(() => {
    if (!loading && hasMore) {
      fetchNext();
    }
  }, [fetchNext, hasMore, loading]);

  const handleSelectPost = useCallback(
    async (postId: string) => {
      const post = posts.find((item) => item.id === postId);
      if (!post) return;
      await setTrack(post);
    },
    [posts, setTrack]
  );

  const renderItem = useCallback(
    ({ item }: { item: (typeof posts)[number] }) => {
      const isActive = currentTrack?.id === item.id;
      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.author}>{item.author.name}</Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleLike(item.id)}
              accessibilityRole="button"
            >
              <Text style={[styles.like, item.liked ? styles.likeActive : null]}>
                {item.liked ? '♥ Liked' : '♡ Like'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.timestamp}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
          <TouchableOpacity
            style={[styles.playButton, isActive ? styles.playButtonActive : null]}
            onPress={() => handleSelectPost(item.id)}
          >
            <Text style={styles.playLabel}>{isActive ? 'Now Playing' : 'Play Post'}</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [currentTrack?.id, handleSelectPost, toggleLike]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyState}>Follow creators to see new voice posts.</Text>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={loading && posts.length > 0} onRefresh={refresh} />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.6}
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null
        }
      />
      <Player />
    </View>
  );
};

export { FeedScreen };
export default FeedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  listContent: {
    padding: 16,
    paddingBottom: 120
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  author: {
    fontSize: 14,
    color: '#475569'
  },
  timestamp: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8
  },
  playButton: {
    marginTop: 16,
    backgroundColor: '#1d4ed8',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  playButtonActive: {
    backgroundColor: '#0f172a'
  },
  playLabel: {
    color: '#ffffff',
    fontWeight: '600'
  },
  like: {
    color: '#1e293b',
    fontWeight: '500'
  },
  likeActive: {
    color: '#ef4444'
  },
  emptyState: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 48
  }
});
