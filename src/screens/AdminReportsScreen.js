import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../services/DatabaseService';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function AdminReportsScreen() {
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => {
    const users = await DB.getAllChatHistories();
    setChatUsers(users);
  };

  const viewHistory = async (email) => {
    const history = await DB.getChatHistory(email);
    setSelectedEmail(email);
    setSelectedHistory(history);
  };

  const renderReport = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => viewHistory(item.user_email)}>
      <Ionicons name="document-text-outline" size={24} color={Colors.primary} style={{ marginRight: 14 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.reportTitle}>Client Conversation</Text>
        <Text style={styles.reportSub}>{item.user_email}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Reports</Text>
      </View>
      <FlatList data={chatUsers} keyExtractor={(item, i) => i.toString()} renderItem={renderReport}
        contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>No chat reports yet.</Text>} />

      <Modal visible={!!selectedHistory} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Details</Text>
              <TouchableOpacity onPress={() => setSelectedHistory(null)}><Ionicons name="close" size={24} color={Colors.text} /></TouchableOpacity>
            </View>
            <Text style={styles.reportEmail}>{selectedEmail}</Text>
            <ScrollView style={styles.transcript}>
              {selectedHistory?.map((msg, i) => (
                <View key={i} style={styles.msgRow}>
                  <Text style={styles.msgTime}>{new Date(msg.created_at).toLocaleString()}</Text>
                  <Text style={styles.msgSender}>{msg.sender === 'user' ? 'Client' : msg.sender === 'sales' ? 'Sales Rep' : 'AI'}:</Text>
                  <Text style={styles.msgText}>{msg.message}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.lg },
  title: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.text },
  list: { padding: Spacing.lg, paddingTop: 0 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  reportTitle: { fontSize: FontSizes.md, fontWeight: 'bold', color: Colors.text },
  reportSub: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', padding: Spacing.lg },
  modalCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.xxl, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSizes.xxl, fontWeight: 'bold', color: Colors.text },
  reportEmail: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  transcript: { maxHeight: 400 },
  msgRow: { marginBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingBottom: Spacing.sm },
  msgTime: { fontSize: FontSizes.xs, color: Colors.textMuted },
  msgSender: { fontSize: FontSizes.sm, fontWeight: 'bold', color: Colors.primary },
  msgText: { fontSize: FontSizes.md, color: Colors.text },
});
