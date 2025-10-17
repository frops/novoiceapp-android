import React from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Application from 'expo-application';
import { useSessionStore } from '../../state/session';

const SettingsScreen: React.FC = () => {
  const logout = useSessionStore((state) => state.logout);
  const token = useSessionStore((state) => state.token);

  const nativeVersion = React.useMemo(() => {
    return (
      Application.nativeApplicationVersion ??
      Application.applicationVersion ??
      'Unknown'
    );
  }, []);

  const nativeBuild = React.useMemo(() => {
    return Application.nativeBuildVersion ?? 'Unknown';
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (err) {
      Alert.alert('Sign-out failed', String(err));
    }
  };

  const handleOpenPrivacyPolicy = () => {
    Linking.openURL('https://novoice.app/privacy').catch(() =>
      Alert.alert('Unable to open privacy policy')
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>
      <View style={styles.card}>
        <TouchableOpacity onPress={handleOpenPrivacyPolicy} style={styles.row}>
          <Text style={styles.rowLabel}>Privacy Policy</Text>
          <Text style={styles.rowAction}>View</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity onPress={handleSignOut} style={styles.row}>
          <Text style={[styles.rowLabel, styles.danger]}>Sign out</Text>
          <Text style={[styles.rowAction, styles.danger]}>↗</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.metaGroup}>
        <View style={styles.meta}>
          <Text style={styles.metaText}>App version</Text>
          <Text style={styles.metaValue}>{nativeVersion}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.metaText}>Build number</Text>
          <Text style={styles.metaValue}>{nativeBuild}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.metaText}>Session token preview</Text>
          <Text style={styles.metaValue}>{token ? `${token.slice(0, 12)}…` : 'Not signed in'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
    gap: 24
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16
  },
  rowLabel: {
    fontSize: 16,
    color: '#1e293b'
  },
  rowAction: {
    color: '#2563eb',
    fontWeight: '600'
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e2e8f0'
  },
  danger: {
    color: '#dc2626'
  },
  meta: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#e2e8f0'
  },
  metaGroup: {
    gap: 12
  },
  metaText: {
    color: '#475569',
    marginBottom: 4
  },
  metaValue: {
    color: '#1e293b',
    fontVariant: ['tabular-nums']
  }
});

export default SettingsScreen;
