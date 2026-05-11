import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as DB from '../services/DatabaseService';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function ProductDetails({ route, navigation }) {
  const { id, table } = route.params; // 'table' is now mandatory for precision
  const { user } = useContext(AuthContext);
  const { colors, isDark } = useTheme();
  const [item, setItem] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const isSalesOrAdmin = user.role === 'sales' || user.role === 'admin';

  useEffect(() => {
    loadData();
  }, [id, table]);

  const loadData = async () => {
    let found = null;
    let targetTable = table || 'products'; // Fallback if missing

    if (targetTable === 'products') {
      const data = await DB.getProducts();
      found = data.find(p => p.id === id);
    } else if (targetTable === 'demos') {
      const data = await DB.getDemos();
      found = data.find(d => d.id === id);
    } else if (targetTable === 'events') {
      const data = await DB.getEvents();
      found = data.find(e => e.id === id);
    }

    if (found) {
      setItem({ ...found, source_table: targetTable });
      const liked = await DB.isLikedByUser(user.email, id, targetTable);
      const lCount = await DB.getLikesCount(id, targetTable);
      const bCount = await DB.getBookingsCountForItem(id, targetTable);
      setIsLiked(liked);
      setLikesCount(lCount);
      setBookingsCount(bCount);
    } else {
      Alert.alert('Error', 'Item not found');
      navigation.goBack();
    }
  };

  const handleLike = async () => {
    if (isSalesOrAdmin) return;
    const status = await DB.toggleLike(user.email, id, item.source_table);
    setIsLiked(status);
    setLikesCount(prev => status ? prev + 1 : prev - 1);
  };

  const handleBooking = async () => {
    if (!isSalesOrAdmin && (item.source_table === 'products' || item.source_table === 'software') && !selectedSlot) {
      Alert.alert('Selection Required', 'Please select a viewing slot before confirming interest.');
      return;
    }

    const slotInfo = selectedSlot ? `${selectedSlot.day}: ${selectedSlot.time}` : 'Direct RSVP';
    const res = await DB.addBooking(user.email, id, item.source_table, slotInfo);
    
    if (res.success) {
      Alert.alert('Success', res.message);
      loadData(); 
    } else {
      Alert.alert('Notice', res.message);
    }
  };

  const renderSchedule = (slotsJson) => {
    try {
      const schedule = JSON.parse(slotsJson);
      const days = Object.keys(schedule);
      if (days.length === 0) return <Text style={{ color: colors.textMuted }}>Contact sales for availability</Text>;
      
      return days.map(day => (
        <TouchableOpacity 
          key={day} 
          disabled={isSalesOrAdmin}
          style={[
            styles.scheduleRow, 
            selectedSlot?.day === day && { backgroundColor: colors.glow, borderColor: colors.primary, borderWidth: 1 }
          ]}
          onPress={() => setSelectedSlot({ day, time: `${schedule[day].start} - ${schedule[day].end}` })}
        >
          <Text style={[styles.dayLabel, { color: colors.text }]}>{day}</Text>
          <Text style={[styles.timeVal, { color: colors.textSecondary }]}>{schedule[day].start} - {schedule[day].end}</Text>
          {!isSalesOrAdmin && <Ionicons name={selectedSlot?.day === day ? "radio-button-on" : "radio-button-off"} size={18} color={colors.primary} />}
        </TouchableOpacity>
      ));
    } catch (e) {
      return <Text style={[styles.slotVal, { color: colors.text }]}>{slotsJson || 'Available by appointment'}</Text>;
    }
  };

  if (!item) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.imageContainer}>
          <Image source={item.image_uri ? { uri: item.image_uri } : { uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop' }} style={styles.heroImg} />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.glassCircle}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </BlurView>
          </TouchableOpacity>
        </View>

        <View style={[styles.details, { backgroundColor: colors.background }]}>
          <View style={styles.headerRow}>
            <View style={[styles.tag, { backgroundColor: colors.glow }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>{item.category || item.source_table}</Text>
            </View>
            <View style={styles.metricStats}>
              <TouchableOpacity onPress={handleLike} disabled={isSalesOrAdmin} style={styles.metricItem}>
                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={22} color={isLiked ? colors.danger : colors.textMuted} />
                <Text style={[styles.metricText, { color: colors.text }]}>{likesCount}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{item.title || item.name}</Text>
          <Text style={[styles.priceTag, { color: colors.primary }]}>{item.price > 0 ? `P${item.price}` : 'Complimentary'}</Text>
          
          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>

          {(item.testing_slots || item.viewing_slots) && (
            <View style={[styles.slotsCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <Text style={[styles.slotsTitle, { color: colors.text }]}>Availability</Text>
              {renderSchedule(item.testing_slots || item.viewing_slots)}
            </View>
          )}

          {item.location && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{item.location}</Text>
            </View>
          )}
          
          {isSalesOrAdmin && item.created_by === user.email && (
            <TouchableOpacity 
              style={[styles.editBtn, { borderColor: colors.primary }]}
              onPress={() => navigation.navigate('CreateItem', { editItem: item })}
            >
              <Ionicons name="create-outline" size={20} color={colors.primary} />
              <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit Details</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
        {!isSalesOrAdmin ? (
          <TouchableOpacity style={[styles.bookBtn, { backgroundColor: colors.primary }]} onPress={handleBooking}>
            <Text style={styles.bookBtnText}>
              {item.source_table === 'events' ? 'Reserve My Spot' : 'Confirm Interest'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.salesFooter}>
            <View style={styles.salesMetric}>
              <Text style={[styles.salesMetricVal, { color: colors.text }]}>{likesCount}</Text>
              <Text style={[styles.salesMetricLabel, { color: colors.textSecondary }]}>Engagement</Text>
            </View>
            <View style={[styles.salesMetric, { borderLeftWidth: 1, borderLeftColor: colors.borderLight }]}>
              <Text style={[styles.salesMetricVal, { color: colors.text }]}>{bookingsCount}</Text>
              <Text style={[styles.salesMetricLabel, { color: colors.textSecondary }]}>Leads</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 140 },
  imageContainer: { width: width, height: 350 },
  heroImg: { width: '100%', height: '100%' },
  backBtn: { position: 'absolute', top: 60, left: 20 },
  glassCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  details: { marginTop: -30, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: Spacing.xl, minHeight: 500 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.md },
  tagText: { fontSize: FontSizes.xs, fontWeight: 'bold', textTransform: 'uppercase' },
  metricStats: { flexDirection: 'row', alignItems: 'center' },
  metricItem: { flexDirection: 'row', alignItems: 'center' },
  metricText: { marginLeft: 6, fontWeight: 'bold', fontSize: FontSizes.md },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  priceTag: { fontSize: 20, fontWeight: 'bold', marginBottom: Spacing.lg },
  divider: { height: 1, marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: 'bold', marginBottom: Spacing.md },
  description: { fontSize: FontSizes.md, lineHeight: 26, marginBottom: Spacing.xl },
  slotsCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.xl },
  slotsTitle: { fontSize: FontSizes.md, fontWeight: 'bold', marginBottom: Spacing.md },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: 12, borderRadius: 10 },
  dayLabel: { fontSize: FontSizes.sm, fontWeight: 'bold' },
  timeVal: { fontSize: FontSizes.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoText: { marginLeft: 10, fontSize: FontSizes.md },
  editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: BorderRadius.xl, borderWidth: 1, marginTop: Spacing.md },
  editBtnText: { marginLeft: 10, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg, borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  bookBtn: { width: '100%', height: 56, borderRadius: BorderRadius.xl, justifyContent: 'center', alignItems: 'center' },
  bookBtnText: { color: '#fff', fontSize: FontSizes.md, fontWeight: 'bold' },
  salesFooter: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  salesMetric: { flex: 1, alignItems: 'center' },
  salesMetricVal: { fontSize: 20, fontWeight: 'bold' },
  salesMetricLabel: { fontSize: 10, textTransform: 'uppercase', marginTop: 2 },
});
