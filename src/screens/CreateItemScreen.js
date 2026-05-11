import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as DB from '../services/DatabaseService';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

export default function CreateItemScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const editItem = route.params?.editItem;
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '0',
    category: 'Product',
    image_uri: '',
    location: '',
    date_time: '',
  });

  const [selectedDays, setSelectedDays] = useState({});
  const [timePicker, setTimePicker] = useState({ visible: false, day: null, type: null, h: '09', m: '00' });

  // Explicitly populate form when editItem changes or is passed
  useEffect(() => {
    if (editItem) {
      setForm({
        title: editItem.title || editItem.name || '',
        description: editItem.description || '',
        price: editItem.price?.toString() || '0',
        category: editItem.category || (editItem.demo_type ? 'Demo' : editItem.event_type ? 'Event' : 'Product'),
        image_uri: editItem.image_uri || '',
        location: editItem.location || '',
        date_time: editItem.date_time || '',
      });
      
      if (editItem.testing_slots) {
        try {
          setSelectedDays(JSON.parse(editItem.testing_slots));
        } catch (e) {
          console.log('Failed to parse slots', e);
        }
      }
    }
  }, [editItem]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
    if (!result.canceled) setForm({ ...form, image_uri: result.assets[0].uri });
  };

  const toggleDay = (day) => {
    const newDays = { ...selectedDays };
    if (newDays[day]) delete newDays[day];
    else newDays[day] = { start: '09:00', end: '17:00' };
    setSelectedDays(newDays);
  };

  const saveTime = () => {
    const { day, type, h, m } = timePicker;
    const time = `${h}:${m}`;
    setSelectedDays({
      ...selectedDays,
      [day]: { ...selectedDays[day], [type]: time }
    });
    setTimePicker({ ...timePicker, visible: false });
  };

  const handleSave = async () => {
    if (!form.title || !form.description) {
      Alert.alert('Error', 'Title and Description are required.');
      return;
    }

    setLoading(true);
    try {
      const scheduleData = JSON.stringify(selectedDays);
      const itemData = { 
        ...form, 
        price: parseFloat(form.price) || 0,
        testing_slots: scheduleData,
        viewing_slots: scheduleData,
        created_by: user.email 
      };
      
      if (editItem) {
        if (form.category === 'Product' || form.category === 'Software') {
          await DB.updateProduct(editItem.id, itemData);
        } else if (form.category === 'Demo') {
          await DB.updateDemo(editItem.id, { 
            name: form.title, description: form.description, price: itemData.price, 
            demo_type: 'Demo', image_uri: form.image_uri, location: form.location, date_time: form.date_time 
          });
        } else if (form.category === 'Event') {
          await DB.updateEvent(editItem.id, { 
            name: form.title, description: form.description, price: itemData.price, 
            event_type: 'Event', image_uri: form.image_uri, location: form.location, date_time: form.date_time 
          });
        }
        Alert.alert('Success', 'Innovation updated successfully!');
      } else {
        if (form.category === 'Product' || form.category === 'Software') {
          await DB.createProduct(itemData);
        } else if (form.category === 'Demo') {
          await DB.createDemo({ 
            name: form.title, demo_type: 'Demo', date_time: form.date_time || new Date().toISOString(), 
            price: itemData.price, description: form.description, image_uri: form.image_uri, location: form.location, created_by: user.email 
          });
        } else if (form.category === 'Event') {
          await DB.createEvent({ 
            name: form.title, event_type: 'Event', date_time: form.date_time || new Date().toISOString(), 
            price: itemData.price, description: form.description, image_uri: form.image_uri, location: form.location, created_by: user.email 
          });
        }
        Alert.alert('Success', 'Innovation published successfully!');
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (key, val) => setForm({ ...form, [key]: val });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>{editItem ? 'Edit' : 'New'} {form.category}</Text>
          </View>

          {!editItem && (
            <View style={styles.categoryRow}>
              {['Product', 'Software', 'Demo', 'Event'].map(cat => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.catChip, form.category === cat && { backgroundColor: colors.primary, borderColor: colors.primary }, { borderColor: colors.border, backgroundColor: colors.surface }]}
                  onPress={() => update('category', cat)}
                >
                  <Text style={[styles.catText, form.category === cat ? { color: '#fff' } : { color: colors.textSecondary }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={[styles.imageBox, { backgroundColor: colors.surface, borderColor: colors.borderLight }]} onPress={pickImage}>
            {form.image_uri ? (
              <Image source={{ uri: form.image_uri }} style={styles.preview} />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="camera-outline" size={40} color={colors.primary} />
                <Text style={{ color: colors.textMuted, marginTop: 8 }}>Add Cover Image</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={[styles.label, { color: colors.text }]}>Basic Details</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.borderLight }]} value={form.title} onChangeText={t => update('title', t)} placeholder="Name of your solution" placeholderTextColor={colors.textMuted} />
          <TextInput style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.borderLight }]} value={form.description} onChangeText={t => update('description', t)} multiline numberOfLines={4} placeholder="Describe the problem it solves..." placeholderTextColor={colors.textMuted} />
          
          <Text style={[styles.label, { color: colors.text, marginTop: 10 }]}>Pricing (Pula)</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.borderLight }]} value={form.price} onChangeText={t => update('price', t)} keyboardType="numeric" placeholder="e.g. 1500.00 (0 for free)" placeholderTextColor={colors.textMuted} />

          {(form.category === 'Product' || form.category === 'Software') && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Operating Schedule</Text>
              <View style={styles.daysRow}>
                {DAYS.map(day => (
                  <TouchableOpacity 
                    key={day} 
                    style={[styles.dayCircle, selectedDays[day] && { backgroundColor: colors.primary, borderColor: colors.primary }, { borderColor: colors.border, backgroundColor: colors.surface }]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[styles.dayText, selectedDays[day] ? { color: '#fff' } : { color: colors.textSecondary }]}>{day[0]}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {Object.keys(selectedDays).map(day => (
                <View key={day} style={[styles.timeRow, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                  <Text style={[styles.dayName, { color: colors.text }]}>{day}</Text>
                  <View style={styles.timePickers}>
                    <TouchableOpacity style={[styles.timeBtn, { backgroundColor: colors.glow }]} onPress={() => setTimePicker({ visible: true, day, type: 'start', h: selectedDays[day].start.split(':')[0], m: selectedDays[day].start.split(':')[1] })}>
                      <Text style={[styles.timeBtnText, { color: colors.primary }]}>{selectedDays[day].start}</Text>
                    </TouchableOpacity>
                    <Text style={{ color: colors.textMuted }}>→</Text>
                    <TouchableOpacity style={[styles.timeBtn, { backgroundColor: colors.glow }]} onPress={() => setTimePicker({ visible: true, day, type: 'end', h: selectedDays[day].end.split(':')[0], m: selectedDays[day].end.split(':')[1] })}>
                      <Text style={[styles.timeBtnText, { color: colors.primary }]}>{selectedDays[day].end}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {(form.category === 'Demo' || form.category === 'Event') && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Event Details</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.borderLight }]} value={form.location} onChangeText={t => update('location', t)} placeholder="Location or Link" placeholderTextColor={colors.textMuted} />
              <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.borderLight }]} value={form.date_time} onChangeText={t => update('date_time', t)} placeholder="Date & Time (e.g. 24 May, 2 PM)" placeholderTextColor={colors.textMuted} />
            </View>
          )}

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={loading}>
            <Text style={styles.saveText}>{loading ? 'Saving...' : (editItem ? 'Save Changes' : 'Publish Innovation')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={timePicker.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Set {timePicker.type} Time for {timePicker.day}</Text>
            <View style={styles.wheelRow}>
              <ScrollView style={styles.wheel} showsVerticalScrollIndicator={false}>
                {HOURS.map(h => (
                  <TouchableOpacity key={h} onPress={() => setTimePicker({ ...timePicker, h })} style={[styles.wheelItem, timePicker.h === h && { backgroundColor: colors.glow }]}>
                    <Text style={[styles.wheelText, { color: timePicker.h === h ? colors.primary : colors.textSecondary }]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={[styles.separator, { color: colors.text }]}>:</Text>
              <ScrollView style={styles.wheel} showsVerticalScrollIndicator={false}>
                {MINUTES.map(m => (
                  <TouchableOpacity key={m} onPress={() => setTimePicker({ ...timePicker, m })} style={[styles.wheelItem, timePicker.m === m && { backgroundColor: colors.glow }]}>
                    <Text style={[styles.wheelText, { color: timePicker.m === m ? colors.primary : colors.textSecondary }]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setTimePicker({ ...timePicker, visible: false })} style={[styles.modalBtn, { backgroundColor: colors.borderLight }]}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveTime} style={[styles.modalBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Set Time</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
  backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.lg, elevation: 2 },
  title: { fontSize: 24, fontWeight: 'bold' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.lg },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.xxl, borderWidth: 1, marginRight: Spacing.sm, marginBottom: 8 },
  catText: { fontSize: FontSizes.sm, fontWeight: '600' },
  imageBox: { height: 180, borderRadius: BorderRadius.xl, borderStyle: 'dashed', borderWidth: 2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xl },
  preview: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center' },
  input: { padding: 16, borderRadius: BorderRadius.xl, borderWidth: 1, fontSize: FontSizes.md, marginBottom: Spacing.md },
  textArea: { height: 100, textAlignVertical: 'top' },
  section: { marginTop: Spacing.md },
  label: { fontSize: FontSizes.md, fontWeight: 'bold', marginBottom: Spacing.md },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xl },
  dayCircle: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  dayText: { fontSize: FontSizes.md, fontWeight: 'bold' },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: BorderRadius.xl, marginBottom: 10, borderWidth: 1 },
  dayName: { fontSize: FontSizes.md, fontWeight: 'bold', width: 60 },
  timePickers: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timeBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  timeBtnText: { fontWeight: 'bold', fontSize: FontSizes.md },
  saveBtn: { marginTop: Spacing.xl, padding: 18, borderRadius: BorderRadius.xxl, alignItems: 'center', elevation: 4 },
  saveText: { color: '#fff', fontSize: FontSizes.lg, fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxl },
  modalCard: { width: '100%', borderRadius: 25, padding: Spacing.xl, elevation: 20 },
  modalTitle: { fontSize: FontSizes.md, fontWeight: 'bold', textAlign: 'center', marginBottom: Spacing.xl },
  wheelRow: { flexDirection: 'row', height: 150, alignItems: 'center', justifyContent: 'center' },
  wheel: { flex: 1 },
  wheelItem: { paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  wheelText: { fontSize: 20, fontWeight: 'bold' },
  separator: { fontSize: 24, fontWeight: 'bold', marginHorizontal: 10 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: Spacing.xl },
  modalBtn: { flex: 1, padding: 14, borderRadius: BorderRadius.lg, alignItems: 'center' },
});
