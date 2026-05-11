import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as DB from '../services/DatabaseService';
import GlobalHeader from '../components/GlobalHeader';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function SalesDashboard({ navigation }) {
  const { user } = useContext(AuthContext);
  const { colors, isDark } = useTheme();
  const [stats, setStats] = useState({});
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation]);

  const loadData = async () => {
    const s = await DB.getSalesStats();
    const t = await DB.getTrendingItems(user?.email);
    setStats(s);
    setTrending(t);
  };

  const StatCard = ({ label, value, icon, color }) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );

  const renderTrendingItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.trendingCard, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('ProductDetails', { id: item.id })}
    >
      <Image source={item.image_uri ? { uri: item.image_uri } : { uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop' }} style={styles.trendingImg} />
      <View style={styles.trendingContent}>
        <Text style={[styles.trendingTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <View style={styles.engagementRow}>
          <Ionicons name="flame" size={14} color="#F59E0B" />
          <Text style={[styles.engagementText, { color: colors.textSecondary }]}>Rank: #{trending.indexOf(item) + 1}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlobalHeader navigation={navigation} title="Sales Hub" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <StatCard label="Products" value={stats.totalProducts} icon="cube" color={colors.primary} />
          <StatCard label="Demos" value={stats.totalDemos} icon="play-circle" color={colors.success} />
          <StatCard label="Inquiries" value={stats.totalInquiries} icon="chatbubbles" color={colors.warning} />
          <StatCard label="Reserved" value={stats.productsReserved} icon="bookmark" color={colors.danger} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Engagement</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Inventory</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={trending}
            keyExtractor={(item) => `${item.source_table}_${item.id}`}
            renderItem={renderTrendingItem}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingList}
            ListEmptyComponent={<Text style={[styles.empty, { color: colors.textMuted }]}>No creations yet.</Text>}
          />
        </View>

        <View style={styles.performanceSection}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: Spacing.lg, marginBottom: Spacing.lg }]}>Performance Overview</Text>
          <View style={[styles.performanceCard, { backgroundColor: colors.surface }]}>
            <View style={styles.perfRow}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <Text style={[styles.perfText, { color: colors.text }]}>{stats.eventsRSVP} Event RSVPs</Text>
            </View>
            <View style={styles.perfRow}>
              <Ionicons name="time" size={20} color={colors.success} />
              <Text style={[styles.perfText, { color: colors.text }]}>{stats.demosScheduled} Demos Scheduled</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Repositioned FAB to float above tabs */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        onPress={() => navigation.navigate('CreateItem')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scroll: { paddingBottom: 140 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.lg, justifyContent: 'space-between' },
  statCard: { width: (width - 50) / 2, padding: Spacing.xl, borderRadius: BorderRadius.xl, marginBottom: Spacing.md, elevation: 2 },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: FontSizes.xs, marginTop: 4, fontWeight: '600' },
  section: { marginTop: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, paddingHorizontal: Spacing.xl },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: 'bold' },
  seeAll: { fontSize: FontSizes.sm, fontWeight: '600' },
  trendingList: { paddingLeft: Spacing.xl, paddingRight: Spacing.lg },
  trendingCard: { width: 200, marginRight: Spacing.md, borderRadius: BorderRadius.xl, overflow: 'hidden', elevation: 2, marginBottom: 10 },
  trendingImg: { width: '100%', height: 110 },
  trendingContent: { padding: Spacing.md },
  trendingTitle: { fontSize: FontSizes.md, fontWeight: 'bold' },
  engagementRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  engagementText: { fontSize: FontSizes.xs, marginLeft: 4 },
  performanceSection: { marginTop: Spacing.xl },
  performanceCard: { marginHorizontal: Spacing.lg, padding: Spacing.xl, borderRadius: BorderRadius.xl },
  perfRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  perfText: { fontSize: FontSizes.md, fontWeight: '500', marginLeft: Spacing.md },
  fab: { position: 'absolute', bottom: 110, right: 25, width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  empty: { padding: Spacing.xl, textAlign: 'center', width: width - 40 },
});
