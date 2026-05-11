import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function AboutScreen({ navigation }) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.hero}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
            <Ionicons name="flash" size={40} color="#fff" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>AI-Solutions</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>Innovating the Future of DX</Text>
        </View>

        <View style={[styles.glassCard, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.6)' }]}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Our Mission</Text>
          <Text style={[styles.bodyText, { color: colors.text }]}>
            AI-Solutions is a fictitious start-up based in Sunderland. We leverage state-of-the-art AI to proactively address issues impacting digital employee experience, speeding up design, engineering, and innovation.
          </Text>
        </View>

        <View style={styles.featureRow}>
          <View style={[styles.featureItem, { backgroundColor: colors.surface }]}>
            <Ionicons name="rocket-outline" size={24} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>Agile</Text>
          </View>
          <View style={[styles.featureItem, { backgroundColor: colors.surface }]}>
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.success} />
            <Text style={[styles.featureText, { color: colors.text }]}>Secure</Text>
          </View>
          <View style={[styles.featureItem, { backgroundColor: colors.surface }]}>
            <Ionicons name="analytics-outline" size={24} color={colors.warning} />
            <Text style={[styles.featureText, { color: colors.text }]}>Insightful</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.copyright, { color: colors.textMuted }]}>© 2026 AI-Solutions Inc.</Text>
          <Text style={[styles.location, { color: colors.textMuted }]}>Sunderland, United Kingdom</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingTop: 60 },
  backBtn: { marginBottom: Spacing.xl },
  hero: { alignItems: 'center', marginBottom: Spacing.xxl },
  logoBox: { width: 80, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  title: { fontSize: 32, fontWeight: 'bold' },
  tagline: { fontSize: FontSizes.md, marginTop: 4 },
  glassCard: { padding: Spacing.xl, borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: 'bold', marginBottom: Spacing.sm },
  bodyText: { fontSize: FontSizes.md, lineHeight: 24 },
  featureRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xxl },
  featureItem: { flex: 1, padding: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center', marginHorizontal: 4 },
  featureText: { fontSize: FontSizes.sm, fontWeight: '600', marginTop: 8 },
  footer: { alignItems: 'center', marginTop: Spacing.xxl },
  copyright: { fontSize: FontSizes.sm },
  location: { fontSize: FontSizes.xs, marginTop: 4 },
});
