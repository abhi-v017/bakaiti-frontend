// src/navigation/MainNavigator.js — Bottom tab navigator
import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import ChatsListScreen from '../screens/ChatsListScreen';
import ContactsScreen  from '../screens/ContactsScreen';
import ProfileScreen   from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const Icon = ({ emoji, focused, color }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.6 }}>{emoji}</Text>
);

export default function MainNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor:  colors.card,
          borderTopColor:   colors.border,
          borderTopWidth:   0.5,
          height:           60,
          paddingBottom:    8,
          paddingTop:       4,
        },
        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Chats"
        component={ChatsListScreen}
        options={{ tabBarIcon: (p) => <Icon emoji="💬" {...p} /> }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{ tabBarIcon: (p) => <Icon emoji="🔍" {...p} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: (p) => <Icon emoji="👤" {...p} /> }}
      />
    </Tab.Navigator>
  );
}
