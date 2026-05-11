import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../services/DatabaseService';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function AdminLoginHistoryScreen() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => { setHistory(await DB.getLoginHistory()); };

  const filtered = history.filter(h =>
    h.user_email.toLowerCase().includes(search.toLowerCase()) ||
    (h.user_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.email}>{item.user_email}</Text>
          <Text style={styles.name}>{item.user_name}</Text>
        </View>
        <Text style={styles.time}>{new Date(item.logged_in_at).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
        <TextInput style={styles.searchInput} placeholder="Search by email..." placeholderTextColor={Colors.textMuted} value={search} onChangeText={setSearch} />
      </View>
      <FlatList data={filtered} keyExtractor={(item, i) => i.toString()} renderItem={renderItem}
        contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>No login history.</Text>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, margin: Spacing.lg, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, marginLeft: Spacing.sm, fontSize: FontSizes.md, color: Colors.text },
  list: { padding: Spacing.lg, paddingTop: 0 },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.sm, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  email: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.text },
  name: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  time: { fontSize: FontSizes.xs, color: Colors.textMuted },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
});
