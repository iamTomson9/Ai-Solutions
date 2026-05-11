import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

import SalesDashboard from '../screens/SalesDashboard';
import SalesProductsScreen from '../screens/SalesProductsScreen';
import SalesInquiriesScreen from '../screens/SalesInquiriesScreen';
import SalesSupportInboxScreen from '../screens/SalesSupportInboxScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function SalesTabs() {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          else if (route.name === 'Inventory') iconName = focused ? 'file-tray-full' : 'file-tray-full-outline';
          else if (route.name === 'Inquiries') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Support') iconName = focused ? 'headset' : 'headset-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          borderRadius: 25,
          height: 70,
          paddingBottom: Platform.OS === 'ios' ? 20 : 12,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        tabBarBackground: () => (
          <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        ),
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={SalesDashboard} />
      <Tab.Screen name="Inventory" component={SalesProductsScreen} />
      <Tab.Screen name="Inquiries" component={SalesInquiriesScreen} />
      <Tab.Screen name="Support" component={SalesSupportInboxScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
