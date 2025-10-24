import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { useSessionStore } from '../src/state/session';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const LoadingFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator />
  </View>
);

export default function RootLayout() {
  const status = useSessionStore((state) => state.status);
  const initialize = useSessionStore((state) => state.initialize);
  const [navigationKey, setNavigationKey] = useState(0);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleRecover = useCallback(() => {
    setNavigationKey((current) => current + 1);
  }, []);

  const content = useMemo(() => {
    if (status === 'initializing') {
      return <LoadingFallback />;
    }

    const isAuthenticated = status === 'authenticated';

    return (
      <Stack key={navigationKey} screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="login" />
        )}
      </Stack>
    );
  }, [navigationKey, status]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <ErrorBoundary
          onReset={handleRecover}
          onRetry={handleRecover}
          resetKeys={[navigationKey, status]}
        >
          {content}
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
