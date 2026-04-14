import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from './DashboardScreen';
import MyJobsScreen from './MyJobsScreen';
import FinanceScreen from './FinanceScreen';
import ProfileScreen from './ProfileScreen';
import { ACCENT, BG, BORDER, CARD, TEXT_MUTED } from '../components/dashboard/theme';

const Tab = createBottomTabNavigator();

function buildTabIcon(routeName, focused) {
  const color = focused ? ACCENT : TEXT_MUTED;
  let icon = 'home-outline';
  if (routeName === 'Home') icon = focused ? 'home' : 'home-outline';
  if (routeName === 'My Jobs') icon = focused ? 'briefcase' : 'briefcase-outline';
  if (routeName === 'Finance') icon = focused ? 'wallet' : 'wallet-outline';
  if (routeName === 'Profile') icon = focused ? 'person' : 'person-outline';
  return <Ionicons name={icon} size={20} color={color} />;
}

/**
 * @param {{ expert: object | null }} props
 */
export default function MainTabs({ expert }) {
  return (
    <NavigationContainer independent>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => buildTabIcon(route.name, focused),
          tabBarActiveTintColor: ACCENT,
          tabBarInactiveTintColor: TEXT_MUTED,
          tabBarStyle: {
            backgroundColor: CARD,
            borderTopColor: BORDER,
            height: 62,
            paddingBottom: 6,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
          },
          sceneStyle: {
            backgroundColor: BG,
          },
        })}
      >
        <Tab.Screen name="Home">{() => <DashboardScreen expert={expert} />}</Tab.Screen>
        <Tab.Screen name="My Jobs">{() => <MyJobsScreen expert={expert} />}</Tab.Screen>
        <Tab.Screen name="Finance">{() => <FinanceScreen expert={expert} />}</Tab.Screen>
        <Tab.Screen name="Profile">{() => <ProfileScreen expert={expert} />}</Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
