import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Switch, Animated, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { GeminiService } from '../services/GeminiService';
import { LocalAIService } from '../services/LocalAIService';
import * as DB from '../services/DatabaseService';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function CustomerChat({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMode, setChatMode] = useState('AI');
  const [escalation, setEscalation] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(true);
  const [chatSession, setChatSession] = useState(null);
  
  const { user } = useContext(AuthContext);
  const { colors, isDark } = useContext(ThemeContext);
  const flatListRef = useRef();

  useEffect(() => { 
    if (!isOfflineMode) initChat(); 
  }, [isOfflineMode]);

  useEffect(() => { 
    loadHistory();
    const interval = setInterval(syncStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const syncStatus = async () => {
    try {
      const esc = await DB.isEscalated(user.email);
      setEscalation(esc);
      if (esc?.sales_unread > 0) {
        const history = await DB.getChatHistory(user.email);
        setMessages(history);
        await DB.updateUnread(user.email, 'sales', true);
      }
    } catch (e) {}
  };

  const initChat = async () => {
    try {
      const session = await GeminiService.getChatSession(user.email);
      setChatSession(session);
    } catch (e) { setIsOfflineMode(true); }
  };

  const loadHistory = async () => {
    try {
      const history = await DB.getChatHistory(user.email);
      if (history.length > 0) {
        setMessages(history);
      } else {
        startFreshChat();
      }
    } catch (e) {}
  };

  const startFreshChat = async () => {
    const welcome = `Hello ${user.name}! I am your AI concierge. How can I help you today?`;
    const msg = { id: Date.now(), message: welcome, sender: 'ai', created_at: new Date().toISOString() };
    setMessages([msg]);
    await DB.saveChatMessage(user.email, 'ai', welcome);
  };

  const handleSend = async (textOverride) => {
    const userText = textOverride || input.trim();
    if (!userText) return;
    
    setInput('');
    const userMsg = { id: Date.now(), message: userText, sender: 'user', created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    await DB.saveChatMessage(user.email, 'user', userText);
    
    if (chatMode === 'HUMAN') {
      await DB.updateUnread(user.email, 'customer');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      let responseText = await LocalAIService.processMessage(userText, messages);
      if (!isOfflineMode && chatSession) {
        const result = await chatSession.sendMessage(userText);
        responseText = await result.response.text();
      }
      setMessages(prev => [...prev, { id: Date.now() + 1, message: responseText, sender: 'ai', created_at: new Date().toISOString() }]);
      await DB.saveChatMessage(user.email, 'ai', responseText);
    } catch (e) {
      const fallback = await LocalAIService.processMessage(userText, messages);
      setMessages(prev => [...prev, { id: Date.now() + 1, message: fallback, sender: 'ai', created_at: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const requestHuman = async () => {
    await DB.createSupportTicket(user.email, user.name);
    const msg = "I've opened a human support ticket for you. Tap 'Human' above to wait for a rep!";
    setMessages(prev => [...prev, { id: Date.now(), message: msg, sender: 'ai', created_at: new Date().toISOString() }]);
    setChatMode('HUMAN');
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    const isSales = item.sender === 'sales';
    const isAI = item.sender === 'ai';

    return (
      <View style={[styles.msgRow, isUser && styles.msgRowRight]}>
        <View style={[
          styles.bubble, 
          isUser ? { backgroundColor: colors.primary } : 
          isSales ? { backgroundColor: isDark ? '#065F46' : '#ECFDF5', borderColor: colors.success, borderWidth: 1 } : 
          { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }
        ]}>
          <Text style={[styles.msgText, { color: isUser ? '#fff' : colors.text }]}>{item.message}</Text>
          {(isSales || isAI) && <Text style={[styles.senderTag, { color: colors.textMuted }]}>{isSales ? 'Human Rep' : 'AI'}</Text>}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <BlurView intensity={isDark ? 40 : 90} tint={isDark ? "dark" : "light"} style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        
        <View style={[styles.tabContainer, { backgroundColor: colors.input }]}>
          <TouchableOpacity onPress={() => setChatMode('AI')} style={[styles.tab, chatMode === 'AI' && { backgroundColor: colors.surface, elevation: 2 }]}>
            <Text style={[styles.tabText, { color: chatMode === 'AI' ? colors.primary : colors.textSecondary }]}>AI</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setChatMode('HUMAN')} style={[styles.tab, chatMode === 'HUMAN' && { backgroundColor: colors.surface, elevation: 2 }]}>
            <Text style={[styles.tabText, { color: chatMode === 'HUMAN' ? colors.primary : colors.textSecondary }]}>Human</Text>
            {escalation?.sales_unread > 0 && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setMessages([])} style={styles.resetBtn}>
          <Ionicons name="refresh-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </BlurView>

      <FlatList 
        ref={flatListRef} 
        data={messages} 
        keyExtractor={(item, i) => (item.id || i).toString()} 
        renderItem={renderMessage}
        ListFooterComponent={loading ? <View style={styles.typing}><Text style={[styles.typingText, { color: colors.primary }]}>Thinking...</Text></View> : null}
        contentContainerStyle={styles.chatList} 
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View style={[styles.inputArea, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          {messages.length < 3 && chatMode === 'AI' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActions}>
              <TouchableOpacity onPress={() => handleSend('Show me Demos')} style={[styles.actionChip, { borderColor: colors.border, backgroundColor: colors.background }]}><Text style={[styles.actionText, { color: colors.textSecondary }]}>Demos</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleSend('Pricing info')} style={[styles.actionChip, { borderColor: colors.border, backgroundColor: colors.background }]}><Text style={[styles.actionText, { color: colors.textSecondary }]}>Pricing</Text></TouchableOpacity>
              <TouchableOpacity onPress={requestHuman} style={[styles.actionChip, { borderColor: colors.primary, backgroundColor: colors.background }]}><Text style={[styles.actionText, { color: colors.primary }]}>Live Agent</Text></TouchableOpacity>
            </ScrollView>
          )}

          <View style={styles.inputRow}>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.input, color: colors.text }]} 
              placeholder={chatMode === 'AI' ? "Ask the AI..." : "Message Agent..."} 
              placeholderTextColor={colors.textMuted}
              value={input} 
              onChangeText={setInput} 
            />
            <TouchableOpacity style={[styles.sendBtn, { backgroundColor: colors.primary }]} onPress={() => handleSend()}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1 },
  backBtn: { width: 40 },
  tabContainer: { flex: 1, flexDirection: 'row', borderRadius: 20, padding: 3, marginHorizontal: 10 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 18 },
  tabText: { fontSize: 12, fontWeight: 'bold' },
  unreadDot: { position: 'absolute', top: 6, right: 12, width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
  resetBtn: { width: 40, alignItems: 'flex-end' },
  chatList: { padding: 20, paddingBottom: 40 },
  msgRow: { flexDirection: 'row', marginBottom: 15 },
  msgRowRight: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 18 },
  senderTag: { fontSize: 8, marginTop: 4, textAlign: 'right', opacity: 0.7 },
  msgText: { fontSize: 14 },
  typing: { padding: 10 },
  typingText: { fontSize: 10, fontWeight: 'bold' },
  inputArea: { padding: 15, borderTopWidth: 1 },
  quickActions: { flexDirection: 'row', marginBottom: 12 },
  actionChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 10 },
  actionText: { fontSize: 12, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, height: 45, borderRadius: 22, paddingHorizontal: 15, fontSize: 14 },
  sendBtn: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});
