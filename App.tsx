import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';

export default function App() {
  const [navigationKey, setNavigationKey] = React.useState(0);

  const handleRecover = React.useCallback(() => {
    setNavigationKey((current) => current + 1);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary onRetry={handleRecover} onReset={handleRecover}>
          <NavigationContainer key={navigationKey}>
            <StatusBar style="auto" />
            <RootNavigator />
          </NavigationContainer>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
export { default } from 'expo-router/entry';
