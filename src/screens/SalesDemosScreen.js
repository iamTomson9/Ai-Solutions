import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../services/DatabaseService';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function SalesDemosScreen({ navigation }) {
  const [demos, setDemos] = useState([]);
  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation]);
  const load = async () => { setDemos(await DB.getDemos()); };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Are you sure you want to delete this demo?', [
      { text: 'CANCEL', style: 'cancel' },
      { text: 'DELETE', style: 'destructive', onPress: async () => { await DB.deleteDemo(id); Alert.alert('Success', 'Demo deleted successfully'); load(); } },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.meta}>{item.date_time} • {item.location}</Text>
      <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('CreateDemo', { demo: item })}><Text style={styles.btnText}>Edit</Text></TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}><Text style={styles.btnText}>Delete</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList data={demos} keyExtractor={item => item.id.toString()} renderItem={renderItem}
        contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>No demos scheduled. Add one.</Text>} />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateDemo')}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.lg },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  name: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  meta: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: 4 },
  desc: { fontSize: FontSizes.md, color: Colors.textSecondary, marginBottom: Spacing.md },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md },
  editBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: BorderRadius.md, marginRight: Spacing.sm },
  deleteBtn: { backgroundColor: Colors.danger, paddingHorizontal: 20, paddingVertical: 8, borderRadius: BorderRadius.md },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: FontSizes.sm },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: Colors.primary, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
});
