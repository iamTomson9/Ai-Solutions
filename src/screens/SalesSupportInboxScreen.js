import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as DB from '../services/DatabaseService';
import GlobalHeader from '../components/GlobalHeader';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function SalesSupportInboxScreen({ navigation }) {
  const { colors } = useTheme();
  const [escalations, setEscalations] = useState([]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation]);

  const loadData = async () => {
    const data = await DB.getEscalatedChats();
    setEscalations(data);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('SalesChatReply', { inquiry: item })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.userIcon}>
          <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userEmail, { color: colors.text }]}>{item.user_email}</Text>
          <Text style={[styles.status, { color: colors.warning }]}>Urgent Support Requested</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlobalHeader navigation={navigation} title="Support Inbox" />
      <FlatList
        data={escalations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="mail-open-outline" size={60} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>The support inbox is clear.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Spacing.lg, paddingBottom: 100 },
  card: { padding: Spacing.lg, borderRadius: BorderRadius.xl, marginBottom: Spacing.md, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  userIcon: { marginRight: Spacing.md },
  userInfo: { flex: 1 },
  userEmail: { fontSize: FontSizes.md, fontWeight: 'bold' },
  status: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 12, fontSize: FontSizes.md },
});
