import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function GlobalHeader({ navigation, title }) {
  const { user, logout } = useContext(AuthContext);
  const { colors } = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.topRow}>
        <TouchableOpacity 
          style={[styles.menuBtn, { backgroundColor: colors.surface }]} 
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu-outline" size={26} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.centerInfo}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()},</Text>
          <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>{user?.name || 'User'}</Text>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.surface }]} 
            onPress={() => navigation.navigate('Profile')}
          >
            {user?.profile_image ? (
              <Image source={{ uri: user.profile_image }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.danger + '15' }]} 
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
      {title && <Text style={[styles.pageTitle, { color: colors.text }]}>{title}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.xl, paddingTop: 60, paddingBottom: Spacing.md },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  menuBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  centerInfo: { flex: 1, marginHorizontal: Spacing.md },
  greeting: { fontSize: FontSizes.xs, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  userName: { fontSize: FontSizes.lg, fontWeight: 'bold' },
  rightActions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: Spacing.sm, elevation: 1 },
  avatar: { width: 34, height: 34, borderRadius: 10 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', marginTop: Spacing.lg },
});
