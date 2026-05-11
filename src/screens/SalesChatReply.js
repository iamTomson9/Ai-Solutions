import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../services/DatabaseService';
import { ThemeContext } from '../context/ThemeContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function SalesChatReply({ route, navigation }) {
  const { userEmail, inquiry } = route.params;
  const targetEmail = userEmail || inquiry?.user_email;
  const { colors, isDark } = useContext(ThemeContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef();

  useEffect(() => {
    loadChat();
    const interval = setInterval(loadChat, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadChat = async () => {
    const history = await DB.getChatHistory(userEmail);
    setMessages(history);
    await DB.updateUnread(userEmail, 'customer', true); 
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const msgText = input.trim();
    setInput('');
    await DB.saveChatMessage(userEmail, 'sales', msgText);
    await DB.updateUnread(userEmail, 'sales', false);
    loadChat();
  };

  const renderMessage = ({ item }) => {
    const isSales = item.sender === 'sales';
    const isAI = item.sender === 'ai';
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.msgRow, isSales && styles.msgRowRight]}>
        <View style={[
          styles.bubble, 
          isSales ? { backgroundColor: colors.primary } : 
          isAI ? { backgroundColor: colors.surface, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.primary } : 
          { backgroundColor: isDark ? '#334155' : '#E2E8F0' }
        ]}>
          <View style={styles.msgHeader}>
             <Text style={[styles.senderLabel, { color: isSales ? 'rgba(255,255,255,0.7)' : colors.textMuted }]}>
               {isSales ? 'You' : isAI ? 'AI Assistant' : 'Client'}
             </Text>
          </View>
          <Text style={[styles.msgText, { color: isSales ? '#fff' : colors.text }]}>{item.message}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Chat with Client</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>{userEmail}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, i) => i.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80}>
        <View style={[styles.inputArea, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
            placeholder="Type a response..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={[styles.sendBtn, { backgroundColor: colors.primary }]} onPress={handleSend}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1 },
  headerInfo: { alignItems: 'center' },
  headerTitle: { fontSize: 14, fontWeight: 'bold' },
  headerSub: { fontSize: 10 },
  chatList: { padding: 20 },
  msgRow: { flexDirection: 'row', marginBottom: 15 },
  msgRowRight: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 18 },
  msgHeader: { marginBottom: 4 },
  senderLabel: { fontSize: 8, fontWeight: 'bold' },
  msgText: { fontSize: 14 },
  inputArea: { flexDirection: 'row', alignItems: 'center', padding: 15, borderTopWidth: 1 },
  input: { flex: 1, minHeight: 45, maxHeight: 100, borderRadius: 22, paddingHorizontal: 15, paddingTop: 12, paddingBottom: 12 },
  sendBtn: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});
