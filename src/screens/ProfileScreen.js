import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateProfile } = useContext(AuthContext);
  const { colors, isDark } = useTheme();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    company: user?.company || '',
    country: user?.country || '',
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      await updateProfile({ profile_image: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    await updateProfile(form);
    setEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const InfoRow = ({ icon, label, value, keyName }) => (
    <View style={[styles.infoRow, { borderBottomColor: colors.borderLight }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.glow }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
        {editing ? (
          <TextInput 
            style={[styles.input, { color: colors.text, borderBottomColor: colors.primary }]} 
            value={form[keyName]} 
            onChangeText={(t) => setForm({...form, [keyName]: t})} 
          />
        ) : (
          <Text style={[styles.infoValue, { color: colors.text }]}>{value || 'Not set'}</Text>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={editing ? handleSave : () => setEditing(true)}>
            <Text style={styles.editBtnText}>{editing ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileBox}>
          <TouchableOpacity style={styles.imageWrapper} onPress={pickImage}>
            {user?.profile_image ? (
              <Image source={{ uri: user.profile_image }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={[styles.cameraBtn, { backgroundColor: colors.surface }]}>
              <Ionicons name="camera" size={16} color={colors.primary} />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <InfoRow icon="person-outline" label="Full Name" value={user?.name} keyName="name" />
          <InfoRow icon="call-outline" label="Phone Number" value={user?.phone} keyName="phone" />
          <InfoRow icon="business-outline" label="Organization" value={user?.company} keyName="company" />
          <InfoRow icon="globe-outline" label="Country" value={user?.country} keyName="country" />
        </View>

        <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.danger }]} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.xl, paddingTop: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, paddingBottom: 40 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  editBtnText: { color: '#fff', fontSize: FontSizes.md, fontWeight: 'bold' },
  profileBox: { alignItems: 'center' },
  imageWrapper: { width: 110, height: 110, marginBottom: Spacing.lg },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: '#fff' },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  userName: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  userEmail: { color: 'rgba(255,255,255,0.7)', fontSize: FontSizes.md, marginTop: 4 },
  content: { padding: Spacing.xl, marginTop: -20 },
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: 'bold', marginBottom: Spacing.md, marginLeft: 4 },
  card: { borderRadius: BorderRadius.xl, padding: Spacing.md, elevation: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: FontSizes.xs, marginBottom: 2 },
  infoValue: { fontSize: FontSizes.md, fontWeight: '600' },
  input: { fontSize: FontSizes.md, fontWeight: '600', paddingVertical: 2, borderBottomWidth: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xxl, padding: 16, borderRadius: BorderRadius.xl, borderWidth: 1 },
  logoutText: { fontSize: FontSizes.md, fontWeight: 'bold', marginLeft: Spacing.md },
});
