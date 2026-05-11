import React, { useContext } from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

import CustomerTabs from './CustomerTabs';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import FeedbackScreen from '../screens/FeedbackScreen';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { user, logout } = useContext(AuthContext);
  const { colors, isDark } = useTheme();

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
              <Text style={styles.userRole}>Premium Client</Text>
            </View>
          </View>
        </View>

        <View style={styles.drawerList}>
          <DrawerItemList {...props} />
          
          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          
          <DrawerItem
            label="Give Feedback"
            icon={({ color, size }) => <Ionicons name="star-outline" size={size} color={color} />}
            onPress={() => props.navigation.navigate('Feedback')}
            labelStyle={styles.drawerLabel}
            activeTintColor={colors.primary}
            inactiveTintColor={colors.textSecondary}
          />
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

export default function ClientDrawer() {
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
        component={CustomerTabs} 
        options={{ 
          drawerLabel: 'Home',
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
      <Drawer.Screen name="Feedback" component={FeedbackScreen} options={{ drawerItemStyle: { display: 'none' } }} />
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
  divider: { height: 1, marginHorizontal: Spacing.xl, marginVertical: Spacing.md },
  footer: { padding: Spacing.xl, borderTopWidth: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  logoutText: { fontSize: FontSizes.md, fontWeight: '600', marginLeft: Spacing.md },
});
