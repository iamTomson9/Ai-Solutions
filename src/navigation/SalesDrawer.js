import React, { useContext } from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';

import SalesTabs from './SalesTabs';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { user, logout } = useContext(AuthContext);
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.profileBox}>
            {user?.profile_image ? (
              <Image source={{ uri: user.profile_image }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userRole}>Sales Specialist</Text>
            </View>
          </View>
        </View>

        <View style={styles.drawerList}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SalesDrawer() {
  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: colors.glow,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerLabelStyle: styles.drawerLabel,
      }}
    >
      <Drawer.Screen 
        name="Main" 
        component={SalesTabs} 
        options={{ 
          drawerLabel: 'Dashboard',
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />
        }} 
      />
      <Drawer.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ 
          drawerIcon: ({ color, size }) => <Ionicons name="information-circle-outline" size={size} color={color} />
        }} 
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  header: { padding: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.xxl },
  profileBox: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#fff' },
  avatarPlaceholder: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  userInfo: { marginLeft: Spacing.lg },
  userName: { color: '#fff', fontSize: FontSizes.lg, fontWeight: 'bold' },
  userRole: { color: 'rgba(255,255,255,0.7)', fontSize: FontSizes.xs, marginTop: 2 },
  drawerList: { paddingVertical: Spacing.md },
  drawerLabel: { fontSize: FontSizes.md, fontWeight: '500', marginLeft: -10 },
  footer: { padding: Spacing.xl, borderTopWidth: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  logoutText: { fontSize: FontSizes.md, fontWeight: '600', marginLeft: Spacing.md },
});
