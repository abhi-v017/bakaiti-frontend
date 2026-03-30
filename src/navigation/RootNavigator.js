// src/navigation/RootNavigator.js
import React, { useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useIncomingCall } from '../hooks/useIncomingCall';

import AuthNavigator      from './AuthNavigator';
import MainNavigator      from './MainNavigator';
import ChatScreen         from '../screens/ChatScreen';
import CallScreen         from '../screens/CallScreen';
import IncomingCallScreen from '../screens/IncomingCallScreen';
import UserProfileScreen  from '../screens/UserProfileScreen';
import GroupInfoScreen    from '../screens/GroupInfoScreen';
import NewGroupScreen     from '../screens/NewGroupScreen';

const Stack = createNativeStackNavigator();

// Inner component so useIncomingCall has access to the navigation ref
function AppNavigator() {
  const navRef = useRef(null);
  useIncomingCall(navRef.current);

  const { user, loading } = useAuth();
  const { colors }        = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main"         component={MainNavigator} />
            <Stack.Screen name="Chat"         component={ChatScreen}
              options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Call"         component={CallScreen}
              options={{ animation: 'fade' }} />
            <Stack.Screen name="IncomingCall" component={IncomingCallScreen}
              options={{ animation: 'fade' }} />
            <Stack.Screen name="UserProfile"  component={UserProfileScreen}
              options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="GroupInfo"    component={GroupInfoScreen}
              options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="NewGroup"     component={NewGroupScreen}
              options={{ animation: 'slide_from_right' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function RootNavigator() {
  return <AppNavigator />;
}
