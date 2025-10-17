import React from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import * as Updates from 'expo-updates';

const UpdatePromptManager: React.FC = () => {
  const isCheckingRef = React.useRef(false);
  const hasPromptedRef = React.useRef(false);

  const isDevelopment = process.env.NODE_ENV !== 'production';

  React.useEffect(() => {
    if (isDevelopment || !Updates.isEnabled) {
      return undefined;
    }

    let isMounted = true;

    const promptForReload = () => {
      if (hasPromptedRef.current) {
        return;
      }

      hasPromptedRef.current = true;
      Alert.alert(
        'Update available',
        'A newer version of Novoice is ready to install. Restart to apply the latest improvements.',
        [
          {
            text: 'Later',
            style: 'cancel',
            onPress: () => {
              hasPromptedRef.current = false;
            }
          },
          {
            text: 'Restart now',
            onPress: async () => {
              try {
                await Updates.reloadAsync();
              } catch (error) {
                console.error('Failed to reload after update', error);
              } finally {
                hasPromptedRef.current = false;
              }
            }
          }
        ]
      );
    };

    const checkForUpdates = async () => {
      if (isCheckingRef.current) {
        return;
      }

      isCheckingRef.current = true;
      try {
        const update = await Updates.checkForUpdateAsync();
        if (!update.isAvailable) {
          return;
        }

        const fetchResult = await Updates.fetchUpdateAsync();
        if (isMounted && fetchResult.isNew) {
          promptForReload();
        }
      } catch (error) {
        console.warn('Failed to check for updates', error);
      } finally {
        isCheckingRef.current = false;
      }
    };

    const handleAppStateChange = (status: AppStateStatus) => {
      if (status === 'active') {
        checkForUpdates();
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    const updatesSubscription = Updates.addListener((event) => {
      if (!isMounted) {
        return;
      }

      switch (event.type) {
        case Updates.UpdateEventType.UPDATE_AVAILABLE:
          promptForReload();
          break;
        case Updates.UpdateEventType.ERROR:
          console.error('Expo updates error', event.message);
          break;
        default:
          break;
      }
    });

    checkForUpdates();

    return () => {
      isMounted = false;
      appStateSubscription.remove();
      updatesSubscription.remove();
    };
  }, [isDevelopment]);

  return null;
};

export default UpdatePromptManager;
