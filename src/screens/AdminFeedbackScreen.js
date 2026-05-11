import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../services/DatabaseService';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function AdminFeedbackScreen() {
  const [feedback, setFeedback] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => { load(); }, []);
  const load = async () => { setFeedback(await DB.getAllFeedback()); };

  const filtered = feedback
    .filter(f => (f.user_name || '').toLowerCase().includes(search.toLowerCase()) || (f.comment || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sort === 'highest') return b.rating - a.rating;
      if (sort === 'lowest') return a.rating - b.rating;
      return 0;
    });

  const sorts = [
    { key: 'newest', label: 'Newest' },
    { key: 'oldest', label: 'Oldest' },
    { key: 'highest', label: 'Highest' },
    { key: 'lowest', label: 'Lowest' },
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons key={i} name={i < rating ? 'star' : 'star-outline'} size={16} color={i < rating ? Colors.star : Colors.starEmpty} />
    ));
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(item.user_name || 'U').charAt(0).toUpperCase()}</Text></View>
          <View>
            <Text style={styles.name}>{item.user_name || item.user_email}</Text>
            <View style={styles.starsRow}>{renderStars(item.rating)}</View>
          </View>
        </View>
        <Text style={styles.time}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      {item.comment ? <Text style={styles.comment}>{item.comment}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
        <TextInput style={styles.searchInput} placeholder="Search feedbacks..." placeholderTextColor={Colors.textMuted} value={search} onChangeText={setSearch} />
      </View>
      <View style={styles.sortRow}>
        {sorts.map(s => (
          <TouchableOpacity key={s.key} style={[styles.sortTab, sort === s.key && styles.sortActive]} onPress={() => setSort(s.key)}>
            <Text style={[styles.sortLabel, sort === s.key && styles.sortLabelActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList data={filtered} keyExtractor={item => item.id.toString()} renderItem={renderItem}
        contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>No feedback yet.</Text>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, margin: Spacing.lg, marginBottom: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, marginLeft: Spacing.sm, fontSize: FontSizes.md, color: Colors.text },
  sortRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  sortTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.xxl, marginRight: Spacing.sm, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  sortActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sortLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '500' },
  sortLabelActive: { color: '#fff' },
  list: { padding: Spacing.lg, paddingTop: 0 },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  name: { fontSize: FontSizes.md, fontWeight: 'bold', color: Colors.text, marginBottom: 2 },
  starsRow: { flexDirection: 'row' },
  time: { fontSize: FontSizes.xs, color: Colors.textMuted },
  comment: { fontSize: FontSizes.md, color: Colors.text, marginTop: Spacing.md, lineHeight: 20 },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
});
