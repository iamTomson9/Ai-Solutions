import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function CustomerOnboardingScreen({ navigation }) {
  const { registerCustomer, login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', country: '' });

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { alert('Full Name, Email, and Password are required!'); return; }
    const res = await registerCustomer({ ...form, email: form.email.trim().toLowerCase() });
    if (!res.success) { alert(res.message); return; }
    // Auto-login after registration
    await login(form.email.trim().toLowerCase(), form.password);
  };

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.avatarIcon}>
            <Ionicons name="person-add" size={28} color="#fff" />
          </View>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} placeholder="Enter your full name" placeholderTextColor={Colors.textMuted} value={form.name} onChangeText={(t) => update('name', t)} />

          <Text style={styles.label}>Email Address</Text>
          <TextInput style={styles.input} placeholder="Enter your email address" placeholderTextColor={Colors.textMuted} value={form.email} onChangeText={(t) => update('email', t)} autoCapitalize="none" keyboardType="email-address" />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput style={styles.passwordInput} placeholder="Create a password" placeholderTextColor={Colors.textMuted} value={form.password} onChangeText={(t) => update('password', t)} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} placeholder="Enter your phone number" placeholderTextColor={Colors.textMuted} value={form.phone} onChangeText={(t) => update('phone', t)} keyboardType="phone-pad" />

          <Text style={styles.label}>Country</Text>
          <TextInput style={styles.input} placeholder="Enter your country" placeholderTextColor={Colors.textMuted} value={form.country} onChangeText={(t) => update('country', t)} />

          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
            <Text style={styles.registerText}>Register</Text>
          </TouchableOpacity>

          <View style={styles.linkRow}>
            <Text style={styles.linkLabel}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.linkText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>AI-Solutions</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, padding: Spacing.xl },
  backBtn: { marginBottom: Spacing.lg, padding: 4 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  avatarIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: Spacing.lg,
  },
  title: { fontSize: FontSizes.xxl, fontWeight: 'bold', color: Colors.text, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xxl },
  label: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: 14, fontSize: FontSizes.md, color: Colors.text,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg,
  },
  passwordContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg,
  },
  passwordInput: { flex: 1, padding: 14, fontSize: FontSizes.md, color: Colors.text },
  eyeBtn: { padding: 14 },
  registerBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.xxl, padding: 16, alignItems: 'center', marginBottom: Spacing.lg, marginTop: Spacing.sm },
  registerText: { color: '#fff', fontSize: FontSizes.lg, fontWeight: 'bold' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.sm },
  linkLabel: { color: Colors.textSecondary, fontSize: FontSizes.md },
  linkText: { color: Colors.primary, fontSize: FontSizes.md, fontWeight: '600' },
  footer: { alignItems: 'center', marginTop: Spacing.xxl },
  footerBrand: { fontSize: FontSizes.lg, fontWeight: 'bold', color: Colors.text },
});
