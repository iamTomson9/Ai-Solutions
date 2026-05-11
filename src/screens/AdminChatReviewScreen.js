import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../services/DatabaseService';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function AdminChatReviewScreen({ route }) {
  const { userEmail } = route.params;
  const [messages, setMessages] = useState([]);

  useEffect(() => { load(); }, []);
  const load = async () => { setMessages(await DB.getChatHistory(userEmail)); };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    const isSales = item.sender === 'sales';
    return (
      <View style={[styles.bubble, isUser ? styles.userBubble : isSales ? styles.salesBubble : styles.aiBubble]}>
        <Text style={styles.senderTag}>{isUser ? 'Client' : isSales ? 'Sales Rep' : 'AI'}</Text>
        <Text style={[styles.msgText, isUser && { color: '#fff' }]}>{item.message}</Text>
        <Text style={[styles.time, isUser && { color: 'rgba(255,255,255,0.7)' }]}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="mail-outline" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
        <Text style={styles.headerText}>{userEmail}</Text>
      </View>
      <FlatList data={messages} keyExtractor={(item, i) => (item.id || i).toString()} renderItem={renderMessage}
        contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>No chat history.</Text>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerText: { fontSize: FontSizes.md, color: Colors.text, fontWeight: '500' },
  list: { padding: Spacing.lg },
  bubble: { maxWidth: '80%', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
  userBubble: { backgroundColor: Colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: Colors.surface, alignSelf: 'flex-start', borderWidth: 1, borderColor: Colors.border, borderBottomLeftRadius: 4 },
  salesBubble: { backgroundColor: Colors.successLight, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#C8E6C9', borderBottomLeftRadius: 4 },
  senderTag: { fontSize: FontSizes.xs, fontWeight: 'bold', color: Colors.textMuted, marginBottom: 2 },
  msgText: { fontSize: FontSizes.md, color: Colors.text },
  time: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 4, textAlign: 'right' },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
});
