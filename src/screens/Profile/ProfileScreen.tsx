import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSessionStore } from '../../state/session';
import { useFeedStore } from '../../state/feed';

const suggestedCreators = [
  { id: 'creator-1', name: 'Indie Podcasters' },
  { id: 'creator-2', name: 'Meditation Voices' },
  { id: 'creator-3', name: 'Startup Stories' }
];

const ProfileScreen: React.FC = () => {
  const user = useSessionStore((state) => state.user);
  const updateProfile = useSessionStore((state) => state.updateProfile);
  const toggleFollow = useSessionStore((state) => state.toggleFollow);
  const following = useSessionStore((state) => state.following);

  const posts = useFeedStore((state) => state.posts);
  const replaceUserPosts = useFeedStore((state) => state.replaceUserPosts);

  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name ?? '');
    setBio(user?.bio ?? '');
    setAvatarUrl(user?.avatarUrl ?? '');
  }, [user?.avatarUrl, user?.bio, user?.name]);

  const myPosts = useMemo(() => {
    if (!user) return [];
    return posts.filter((post) => post.author.id === user.id);
  }, [posts, user]);

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centeredText}>Sign in to manage your profile.</Text>
      </View>
    );
  }

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow gallery access to update your avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });
    if (!result.canceled && result.assets?.length) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, bio, avatarUrl });
      if (user) {
        replaceUserPosts(user.id, (post) => ({
          ...post,
          author: {
            ...post.author,
            name,
            bio,
            avatarUrl
          }
        }));
      }
      Alert.alert('Profile updated');
    } catch (err) {
      Alert.alert('Profile error', String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePickAvatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{user.name?.[0]?.toUpperCase() ?? '?'}</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.stats}>
            Followers: {user.followers ?? 0} · Following: {user.following ?? 0}
          </Text>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Display name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          multiline
        />
      </View>
      <TouchableOpacity
        style={[styles.saveButton, saving ? styles.saveDisabled : null]}
        onPress={handleSaveProfile}
        disabled={saving}
      >
        <Text style={styles.saveLabel}>{saving ? 'Saving…' : 'Save profile'}</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Suggested creators</Text>
        {suggestedCreators.map((creator) => {
          const isFollowing = !!following[creator.id];
          return (
            <View key={creator.id} style={styles.followRow}>
              <Text style={styles.followName}>{creator.name}</Text>
              <TouchableOpacity
                style={[styles.followButton, isFollowing ? styles.following : null]}
                onPress={() => void toggleFollow(creator.id)}
              >
                <Text style={styles.followLabel}>{isFollowing ? 'Following' : 'Follow'}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your voice posts</Text>
        {myPosts.length === 0 ? (
          <Text style={styles.emptyState}>You have not shared any posts yet.</Text>
        ) : (
          <FlatList
            data={myPosts}
            scrollEnabled={false}
            keyExtractor={(post) => post.id}
            renderItem={({ item }) => (
              <View style={styles.postCard}>
                <Text style={styles.postTitle}>{item.title}</Text>
                <Text style={styles.postMeta}>
                  {new Date(item.createdAt).toLocaleString()} · {item.duration ?? 0}s
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9'
  },
  content: {
    padding: 24,
    gap: 24
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  headerInfo: {
    flex: 1,
    gap: 4
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a'
  },
  stats: {
    color: '#475569'
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitials: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700'
  },
  formGroup: {
    gap: 8
  },
  label: {
    color: '#1e293b',
    fontWeight: '500'
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#cbd5f5'
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  saveButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  saveDisabled: {
    opacity: 0.6
  },
  saveLabel: {
    color: '#f8fafc',
    fontWeight: '600'
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  followRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  followName: {
    color: '#1e293b',
    fontWeight: '500'
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#38bdf8'
  },
  following: {
    backgroundColor: '#0f172a'
  },
  followLabel: {
    color: '#ffffff',
    fontWeight: '600'
  },
  postCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8
  },
  postTitle: {
    fontWeight: '600',
    color: '#0f172a'
  },
  postMeta: {
    color: '#64748b'
  },
  emptyState: {
    color: '#64748b'
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  centeredText: {
    color: '#64748b'
  }
});

export default ProfileScreen;
