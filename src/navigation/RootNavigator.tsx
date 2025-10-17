import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { FeedScreen } from '../screens/Feed/FeedScreen';
import { RecordScreen } from '../screens/Record/RecordScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';
import { useSessionStore } from '../state/session';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export type MainTabParamList = {
  Feed: undefined;
  Record: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home';
        switch (route.name) {
          case 'Feed':
            iconName = 'musical-notes';
            break;
          case 'Record':
            iconName = 'mic-circle';
            break;
          case 'Profile':
            iconName = 'person-circle';
            break;
          case 'Settings':
            iconName = 'settings';
            break;
          default:
            iconName = 'home';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      }
    })}
  >
    <Tab.Screen name="Feed" component={FeedScreen} />
    <Tab.Screen name="Record" component={RecordScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

export const RootNavigator = () => {
  const status = useSessionStore((state) => state.status);
  const initialize = useSessionStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (status === 'initializing') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  const isAuthenticated = status === 'authenticated';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};
