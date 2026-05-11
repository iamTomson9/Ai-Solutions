import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import * as DB from '../services/DatabaseService';
import GlobalHeader from '../components/GlobalHeader';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function ClientDemosScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await DB.getDemos();
    setItems(data);
    setLoading(false);
  };

  const renderDemo = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      style={[styles.demoCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
      onPress={() => navigation.navigate('ProductDetails', { id: item.id, table: 'demos' })}
    >
      <View style={styles.timeSection}>
        <Text style={[styles.timeText, { color: colors.primary }]}>{item.date_time?.split(',')[1] || 'TBD'}</Text>
        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        <View style={[styles.line, { backgroundColor: colors.borderLight }]} />
      </View>

      <View style={styles.contentSection}>
        <View style={styles.imgContainer}>
          <Image source={item.image_uri ? { uri: item.image_uri } : { uri: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop' }} style={styles.demoImg} />
          <BlurView intensity={30} tint="dark" style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </BlurView>
        </View>

        <View style={styles.info}>
          <Text style={[styles.demoTitle, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
          <View style={styles.locRow}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.locText, { color: colors.textMuted }]}>{item.location || 'Virtual'}</Text>
          </View>
          
          <View style={styles.footer}>
            <Text style={[styles.price, { color: colors.primary }]}>P{item.price || '0'}</Text>
            <TouchableOpacity style={[styles.bookBtn, { backgroundColor: colors.glow }]}>
              <Text style={[styles.bookBtnText, { color: colors.primary }]}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlobalHeader navigation={navigation} title="Live Demos" />
      
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDemo}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <BlurView intensity={isDark ? 40 : 20} tint={isDark ? 'dark' : 'light'} style={styles.heroBox}>
              <Ionicons name="videocam" size={32} color={colors.primary} />
              <Text style={[styles.heroTitle, { color: colors.text }]}>Experience the{'\n'}Future Today</Text>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>Interactive walkthroughs with our experts.</Text>
            </BlurView>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Spacing.xl, paddingBottom: 100 },
  pageHeader: { marginBottom: Spacing.xl },
  heroBox: { padding: 30, borderRadius: 32, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  heroTitle: { fontSize: 28, fontWeight: 'bold', marginTop: 16, lineHeight: 34 },
  heroSubtitle: { fontSize: 14, marginTop: 8, lineHeight: 20 },
  demoCard: { flexDirection: 'row', marginBottom: Spacing.xl, paddingVertical: 10 },
  timeSection: { width: 60, alignItems: 'center' },
  timeText: { fontSize: 14, fontWeight: 'bold' },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 10, marginBottom: 10 },
  line: { width: 2, flex: 1, borderRadius: 1 },
  contentSection: { flex: 1, flexDirection: 'row', padding: 12, borderRadius: 24, borderWidth: 1, borderColor: 'transparent' },
  imgContainer: { width: 90, height: 90, borderRadius: 20, overflow: 'hidden' },
  demoImg: { width: '100%', height: '100%' },
  liveTag: { position: 'absolute', top: 6, left: 6, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444', marginRight: 4 },
  liveText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
  info: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  demoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  locRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  locText: { fontSize: 12, marginLeft: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: 'bold' },
  bookBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
  bookBtnText: { fontSize: 12, fontWeight: 'bold' },
});
