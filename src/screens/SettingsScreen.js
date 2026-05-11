import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function SettingsScreen({ navigation }) {
  const { isDark, toggleTheme, colors } = useTheme();

  const SettingItem = ({ icon, label, value, onValueChange, type = 'switch', onPress }) => (
    <TouchableOpacity 
      style={[styles.item, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]} 
      onPress={onPress}
      disabled={type === 'switch'}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.glow }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      {type === 'switch' ? (
        <Switch 
          value={value} 
          onValueChange={onValueChange} 
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
        <SettingItem 
          icon="moon-outline" 
          label="Dark Mode" 
          value={isDark} 
          onValueChange={toggleTheme} 
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notifications</Text>
        <SettingItem icon="notifications-outline" label="Push Notifications" value={true} />
        <SettingItem icon="mail-outline" label="Email Updates" value={false} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Support</Text>
        <SettingItem icon="help-circle-outline" label="Help Center" type="link" />
        <SettingItem icon="information-circle-outline" label="About AI-Solutions" type="link" onPress={() => navigation.navigate('About')} />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.version, { color: colors.textMuted }]}>Version 2026.1.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.xl, paddingTop: 60 },
  backBtn: { marginRight: Spacing.lg },
  title: { fontSize: FontSizes.xxl, fontWeight: 'bold' },
  section: { marginTop: Spacing.xl, paddingHorizontal: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.sm, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: Spacing.md, marginLeft: Spacing.md },
  item: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: 2, borderBottomWidth: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  label: { flex: 1, fontSize: FontSizes.md, fontWeight: '500' },
  footer: { padding: Spacing.xxl, alignItems: 'center' },
  version: { fontSize: FontSizes.xs },
});
