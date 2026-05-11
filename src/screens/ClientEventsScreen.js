import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import * as DB from '../services/DatabaseService';
import GlobalHeader from '../components/GlobalHeader';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function ClientEventsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await DB.getEvents();
    setItems(data);
    setLoading(false);
  };

  const renderEvent = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      style={styles.eventCard}
      onPress={() => navigation.navigate('ProductDetails', { id: item.id, table: 'events' })}
    >
      <ImageBackground 
        source={item.image_uri ? { uri: item.image_uri } : { uri: 'https://images.unsplash.com/photo-1540575861501-7ad060e39fe5?q=80&w=1000&auto=format&fit=crop' }} 
        style={styles.bgImg}
        imageStyle={{ borderRadius: 32 }}
      >
        <View style={styles.overlay}>
          <BlurView intensity={30} tint="dark" style={styles.dateTag}>
            <Text style={styles.dateDay}>{item.date_time?.split(' ')[0] || '24'}</Text>
            <Text style={styles.dateMonth}>{item.date_time?.split(' ')[1]?.substring(0,3) || 'MAY'}</Text>
          </BlurView>

          <View style={styles.bottomInfo}>
            <BlurView intensity={60} tint="dark" style={styles.glassInfo}>
              <Text style={styles.eventTitle} numberOfLines={1}>{item.name}</Text>
              <View style={styles.metaRow}>
                <View style={styles.meta}>
                  <Ionicons name="location" size={14} color="#fff" />
                  <Text style={styles.metaText}>{item.location || 'Botswana'}</Text>
                </View>
                <View style={[styles.meta, { marginLeft: 16 }]}>
                  <Ionicons name="ticket" size={14} color="#fff" />
                  <Text style={styles.metaText}>P{item.price || '0'}</Text>
                </View>
              </View>
            </BlurView>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlobalHeader navigation={navigation} title="Innovation Summits" />
      
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEvent}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <Text style={[styles.heading, { color: colors.text }]}>Featured{'\n'}Summits</Text>
            <View style={[styles.badge, { backgroundColor: colors.glow }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>2025/2026 SEASON</Text>
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Spacing.xl, paddingBottom: 100 },
  pageHeader: { marginBottom: Spacing.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heading: { fontSize: 32, fontWeight: 'bold', lineHeight: 38 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  eventCard: { width: '100%', height: 400, marginBottom: Spacing.xl },
  bgImg: { width: '100%', height: '100%' },
  overlay: { flex: 1, padding: 24, justifyContent: 'space-between' },
  dateTag: { width: 60, height: 70, borderRadius: 18, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  dateDay: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  dateMonth: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 'bold' },
  bottomInfo: { },
  glassInfo: { padding: 20, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  eventTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  meta: { flexDirection: 'row', alignItems: 'center' },
  metaText: { color: '#fff', fontSize: 12, marginLeft: 6, fontWeight: '500' },
});
