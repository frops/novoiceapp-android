import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type TabBarIconProps = {
  color: string;
  size: number;
};

const renderIcon = (name: keyof typeof Ionicons.glyphMap) =>
  ({ color, size }: TabBarIconProps) => (
    <Ionicons name={name} size={size} color={color} />
  );

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: renderIcon('musical-notes'),
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: 'Record',
          tabBarIcon: renderIcon('mic-circle'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: renderIcon('person-circle'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: renderIcon('settings'),
        }}
      />
    </Tabs>
  );
}
