import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as DB from '../services/DatabaseService';
import GlobalHeader from '../components/GlobalHeader';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function CustomerDashboard({ navigation }) {
  const { user } = useContext(AuthContext);
  const { colors, isDark } = useTheme();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = navigation.addListener('focus', loadData);
    loadData();
    return unsub;
  }, [navigation, search, filter]);

  const loadData = async () => {
    setLoading(true);
    // Use searchItems which handles unified filtering correctly
    const data = await DB.searchItems(search, filter);
    setItems(data);
    setLoading(false);
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
        <TextInput 
          style={[styles.searchInput, { color: colors.text }]} 
          placeholder="Search AI innovations..." 
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {['All', 'Product', 'Software', 'Demo', 'Event'].map(f => (
          <TouchableOpacity 
            key={f} 
            style={[styles.filterChip, filter === f && { backgroundColor: colors.primary, borderColor: colors.primary }, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f ? { color: '#fff' } : { color: colors.textSecondary }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const getTagColor = (tag) => {
    switch(tag?.toLowerCase()) {
      case 'product': return '#3B82F6';
      case 'software': return '#8B5CF6';
      case 'demo': return '#10B981';
      case 'event': return '#F59E0B';
      default: return colors.primary;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      key={`${item.source_table}_${item.id}`} 
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('ProductDetails', { id: item.id, table: item.source_table })}
    >
      <Image source={item.image_uri ? { uri: item.image_uri } : { uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop' }} style={styles.cardImg} />
      <View style={styles.cardOverlay}>
        <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={styles.glassTag}>
          <View style={[styles.dot, { backgroundColor: getTagColor(item.category) }]} />
          <Text style={[styles.tagText, { color: '#fff' }]}>{item.category || 'Innovation'}</Text>
        </BlurView>
        
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: '#fff' }]} numberOfLines={1}>{item.title}</Text>
          <Text style={[styles.cardDesc, { color: 'rgba(255,255,255,0.9)' }]} numberOfLines={2}>{item.description}</Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.dateRow}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <Text style={[styles.priceTag, { color: '#fff' }]}>
              {item.price > 0 ? `P${item.price}` : 'Free'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlobalHeader navigation={navigation} title="Discovery" />
      
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.source_table}_${item.id}`}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color={colors.textMuted} />
            <Text style={[styles.empty, { color: colors.textMuted }]}>No matches found for "{search}"</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        onPress={() => navigation.navigate('Chat')}
      >
        <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 140 },
  headerContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
  searchBar: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: BorderRadius.xl, borderWidth: 1, marginBottom: Spacing.lg },
  searchInput: { flex: 1, marginLeft: Spacing.sm, fontSize: FontSizes.md },
  filterBtn: { padding: 4 },
  filterRow: { flexDirection: 'row', marginBottom: Spacing.xl },
  filterContent: { paddingRight: Spacing.xl },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.xxl, borderWidth: 1, marginRight: Spacing.sm },
  filterText: { fontSize: FontSizes.sm, fontWeight: '600' },
  card: { marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xxl, height: 280, marginBottom: Spacing.xl, overflow: 'hidden', elevation: 4 },
  cardImg: { width: '100%', height: '100%' },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'space-between', padding: Spacing.xl },
  glassTag: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.md, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  tagText: { fontSize: FontSizes.xs, fontWeight: 'bold' },
  cardContent: { },
  cardTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  cardDesc: { fontSize: FontSizes.sm, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.lg },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginLeft: 6 },
  priceTag: { fontSize: 16, fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 110, right: 25, width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  empty: { textAlign: 'center', marginTop: 12, fontSize: FontSizes.md },
});
