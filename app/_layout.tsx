import React, { useCallback, useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSessionStore } from '../src/state/session';
import UpdatePromptManager from '../src/components/UpdatePromptManager';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default function RootLayout() {
  const status = useSessionStore((state) => state.status);
  const initialize = useSessionStore((state) => state.initialize);
  const [navigationKey, setNavigationKey] = useState(0);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleRecover = useCallback(() => {
    setNavigationKey((current) => current + 1);
    initialize();
  }, [initialize]);

  if (status === 'initializing') {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  const isAuthenticated = status === 'authenticated';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary
          onRetry={handleRecover}
          onReset={handleRecover}
          resetKeys={[navigationKey]}
        >
          <UpdatePromptManager />
          <StatusBar style="auto" />
          <Stack key={navigationKey} screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
              <Stack.Screen name="(tabs)" />
            ) : (
              <Stack.Screen name="login" />
            )}
          </Stack>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
