import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as DB from '../services/DatabaseService';
import GlobalHeader from '../components/GlobalHeader';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function SalesInquiriesScreen({ navigation }) {
  const { colors } = useTheme();
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation]);

  const loadData = async () => {
    const data = await DB.getInquiries();
    setInquiries(data);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('SalesChatReply', { userEmail: item.user_email })}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.userName, { color: colors.text }]}>{item.user_name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'open' ? colors.success + '20' : colors.textMuted + '20' }]}>
          <Text style={[styles.statusText, { color: item.status === 'open' ? colors.success : colors.textSecondary }]}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>{item.message}</Text>
      <View style={styles.footer}>
        <Ionicons name="time-outline" size={14} color={colors.textMuted} />
        <Text style={[styles.date, { color: colors.textMuted }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlobalHeader navigation={navigation} title="Client Inquiries" />
      <FlatList
        data={inquiries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={[styles.empty, { color: colors.textMuted }]}>No inquiries at the moment.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Spacing.lg, paddingBottom: 100 },
  card: { padding: Spacing.lg, borderRadius: BorderRadius.xl, marginBottom: Spacing.md, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  userName: { fontSize: FontSizes.md, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  message: { fontSize: FontSizes.sm, lineHeight: 20 },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md },
  date: { fontSize: 10, marginLeft: 4 },
  empty: { textAlign: 'center', marginTop: 100, opacity: 0.5 },
});
