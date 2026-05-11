import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../services/DatabaseService';
import { AuthContext } from '../context/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function FeedbackScreen() {
  const { user } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Please select a rating'); return; }
    await DB.submitFeedback({
      user_email: user.email,
      user_name: user.name,
      rating,
      comment,
    });
    setShowSuccess(true);
  };

  const resetForm = () => {
    setRating(0);
    setComment('');
    setShowSuccess(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Rate Your Experience</Text>
      <Text style={styles.subtitle}>How was your experience?</Text>

      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={40}
              color={star <= rating ? Colors.star : Colors.starEmpty}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Share your feedback</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={5}
        placeholder="What do you like or what can we improve?"
        placeholderTextColor={Colors.textMuted}
        value={comment}
        onChangeText={setComment}
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Feedback</Text>
      </TouchableOpacity>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={60} color={Colors.success} />
            </View>
            <Text style={styles.successTitle}>Thanks for your feedback!</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={resetForm}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl },
  title: { fontSize: FontSizes.xxl, fontWeight: 'bold', color: Colors.text, textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xxl },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.xxl },
  starBtn: { marginHorizontal: 6 },
  sectionLabel: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  textArea: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, fontSize: FontSizes.md, color: Colors.text,
    minHeight: 120, marginBottom: Spacing.xl,
  },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.xxl, padding: 16, alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: FontSizes.lg, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center' },
  successCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.xxxl,
    alignItems: 'center', width: '80%',
  },
  successIcon: { marginBottom: Spacing.lg },
  successTitle: { fontSize: FontSizes.xl, fontWeight: 'bold', color: Colors.text, textAlign: 'center', marginBottom: Spacing.xl },
  closeBtn: { backgroundColor: Colors.success, borderRadius: BorderRadius.xxl, paddingHorizontal: 40, paddingVertical: 12 },
  closeText: { color: '#fff', fontWeight: 'bold', fontSize: FontSizes.md },
});
