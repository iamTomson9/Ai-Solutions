import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as DB from '../services/DatabaseService';
import GlobalHeader from '../components/GlobalHeader';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function AdminDashboard({ navigation }) {
  const { colors, isDark } = useTheme();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation]);

  const loadData = async () => {
    const s = await DB.getAdminStats();
    setStats(s);
    setLoading(false);
  };

  const MetricCard = ({ label, value, subValue, icon, color, trend }) => (
    <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="trending-up" size={12} color={colors.success} />
            <Text style={[styles.trendText, { color: colors.success }]}>{trend}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
      {subValue && <Text style={[styles.metricSub, { color: colors.textMuted }]}>{subValue}</Text>}
    </View>
  );

  const PerformanceBar = ({ label, percentage, color }) => (
    <View style={styles.performanceRow}>
      <View style={styles.barInfo}>
        <Text style={[styles.barLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.barPercent, { color: color }]}>{percentage}%</Text>
      </View>
      <View style={[styles.barBg, { backgroundColor: colors.borderLight }]}>
        <View style={[styles.barFill, { backgroundColor: color, width: `${percentage}%` }]} />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlobalHeader navigation={navigation} title="Admin Intel" />
      
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <MetricCard 
            label="Total Users" 
            value={stats.totalUsers || 0} 
            trend="+12%" 
            icon="people" 
            color={colors.primary} 
          />
          <MetricCard 
            label="AI Responses" 
            value={stats.aiResponses || 0} 
            subValue="Last 30 days"
            icon="chatbubble-ellipses" 
            color={colors.success} 
          />
          <MetricCard 
            label="Avg Speed" 
            value={`${stats.avgResponseTime || 0}s`} 
            subValue="Real-time audit"
            icon="flash" 
            color={colors.warning} 
          />
          <MetricCard 
            label="Satisfaction" 
            value={stats.feedbackAvg || '0.0'} 
            subValue={`${stats.feedbackCount || 0} reviews`}
            icon="star" 
            color={colors.danger} 
          />
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Platform Performance</Text>
          <PerformanceBar label="AI Accuracy" percentage={94} color={colors.primary} />
          <PerformanceBar label="User Retention" percentage={82} color={colors.success} />
          <PerformanceBar label="System Uptime" percentage={99} color={colors.warning} />
        </View>

        <View style={styles.quickLinks}>
          <TouchableOpacity 
            style={[styles.linkBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Users')}
          >
            <Ionicons name="shield-checkmark" size={20} color="#fff" />
            <Text style={styles.linkBtnText}>Verify New Users</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.linkBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Reports')}
          >
            <Ionicons name="document-text-outline" size={20} color={colors.text} />
            <Text style={[styles.linkBtnText, { color: colors.text }]}>Full Audit Logs</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 120 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.lg, justifyContent: 'space-between' },
  metricCard: { width: (width - 60) / 2, padding: Spacing.lg, borderRadius: BorderRadius.xl, marginBottom: Spacing.md, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  trendText: { fontSize: 10, fontWeight: 'bold', marginLeft: 2 },
  metricValue: { fontSize: 24, fontWeight: 'bold' },
  metricLabel: { fontSize: FontSizes.xs, marginTop: 4, fontWeight: '600' },
  metricSub: { fontSize: 10, marginTop: 2 },
  sectionCard: { margin: Spacing.lg, padding: Spacing.xl, borderRadius: BorderRadius.xl, elevation: 1 },
  sectionTitle: { fontSize: FontSizes.md, fontWeight: 'bold', marginBottom: Spacing.xl },
  performanceRow: { marginBottom: Spacing.lg },
  barInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  barLabel: { fontSize: FontSizes.sm, fontWeight: '500' },
  barPercent: { fontSize: FontSizes.sm, fontWeight: 'bold' },
  barBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  quickLinks: { paddingHorizontal: Spacing.lg },
  linkBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: BorderRadius.xl, marginBottom: Spacing.md },
  linkBtnText: { color: '#fff', fontSize: FontSizes.md, fontWeight: 'bold', marginLeft: 10 },
});
