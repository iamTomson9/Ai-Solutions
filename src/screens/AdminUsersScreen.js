import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../services/DatabaseService';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function AdminUsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, customer, sales, admin
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });

  useEffect(() => { const unsub = navigation.addListener('focus', load); return unsub; }, [navigation]);
  const load = async () => { setUsers(await DB.getUsers()); };

  const filtered = users.filter(u => {
    const matchSearch = (u.name || '').toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || u.role === filter;
    return matchSearch && matchFilter;
  });

  const handleVerify = async (email) => { await DB.verifyUser(email); load(); };

  const handleDelete = (user) => {
    if (user.role === 'admin') { Alert.alert('Error', 'Cannot delete Admin accounts.'); return; }
    Alert.alert('Confirm Deletion', 'Are you sure you want to delete this user?', [
      { text: 'CANCEL', style: 'cancel' },
      { text: 'DELETE', style: 'destructive', onPress: async () => { await DB.deleteUser(user.email); load(); } },
    ]);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditUser(null);
    setForm({ name: '', email: '', password: '', role: 'customer' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { Alert.alert('Error', 'Name and email required'); return; }
    if (editUser) {
      const fields = { name: form.name, role: form.role };
      if (form.password) fields.password = form.password;
      await DB.updateUser(editUser.email, fields);
    } else {
      if (!form.password) { Alert.alert('Error', 'Password required for new users'); return; }
      await DB.createUser({ name: form.name, email: form.email.toLowerCase(), password: form.password, role: form.role, is_verified: 1 });
    }
    setShowModal(false);
    load();
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'customer', label: 'Clients' },
    { key: 'sales', label: 'Sales Reps' },
    { key: 'admin', label: 'Admins' },
  ];

  const getRoleBadgeColor = (role) => {
    if (role === 'admin') return Colors.danger;
    if (role === 'sales') return Colors.primary;
    return Colors.success;
  };

  const renderUser = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: getRoleBadgeColor(item.role) }]}>
            <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase()}</Text>
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{item.name}</Text>
              {item.is_verified ? (
                <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
              ) : (
                <View style={[styles.statusDot, { backgroundColor: Colors.warning }]} />
              )}
            </View>
            <Text style={styles.email}>{item.email}</Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        {!item.is_verified && (
          <TouchableOpacity style={styles.verifyBtn} onPress={() => handleVerify(item.email)}>
            <Text style={styles.verifyText}>Verify</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
          <TextInput style={styles.searchInput} placeholder="Search users..." placeholderTextColor={Colors.textMuted} value={search} onChangeText={setSearch} />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addText}>Add User</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {filters.map(f => (
          <TouchableOpacity key={f.key} style={[styles.filterTab, filter === f.key && styles.filterActive]} onPress={() => setFilter(f.key)}>
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList data={filtered} keyExtractor={item => item.email} renderItem={renderUser}
        contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>} />

      {/* Add/Edit Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editUser ? 'Edit User' : 'Add User'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} color={Colors.text} /></TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>Name</Text>
            <TextInput style={styles.modalInput} value={form.name} onChangeText={(t) => setForm(p => ({ ...p, name: t }))} placeholder="Full Name" placeholderTextColor={Colors.textMuted} />
            {!editUser && (<><Text style={styles.modalLabel}>Email Address</Text>
            <TextInput style={styles.modalInput} value={form.email} onChangeText={(t) => setForm(p => ({ ...p, email: t }))} placeholder="Email Address" placeholderTextColor={Colors.textMuted} autoCapitalize="none" /></>)}
            <Text style={styles.modalLabel}>Password {editUser ? '(leave blank to keep current)' : ''}</Text>
            <TextInput style={styles.modalInput} value={form.password} onChangeText={(t) => setForm(p => ({ ...p, password: t }))} placeholder="Password" placeholderTextColor={Colors.textMuted} secureTextEntry />
            <Text style={styles.modalLabel}>Role</Text>
            <View style={styles.roleRow}>
              {['customer', 'sales', 'admin'].map(r => (
                <TouchableOpacity key={r} style={[styles.roleOption, form.role === r && styles.roleSelected]} onPress={() => setForm(p => ({ ...p, role: r }))}>
                  <Text style={[styles.roleOptionText, form.role === r && { color: '#fff' }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowModal(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveModalBtn} onPress={handleSave}><Text style={styles.saveText}>Save User</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 50, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', padding: Spacing.lg, alignItems: 'center' },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm },
  searchInput: { flex: 1, marginLeft: Spacing.sm, fontSize: FontSizes.md, color: Colors.text },
  addBtn: { flexDirection: 'row', backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: BorderRadius.md, alignItems: 'center' },
  addText: { color: '#fff', fontWeight: 'bold', fontSize: FontSizes.sm, marginLeft: 4 },
  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  filterTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.xxl, marginRight: Spacing.sm, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  filterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '500' },
  filterLabelActive: { color: '#fff' },
  list: { padding: Spacing.lg, paddingTop: 0 },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { marginBottom: Spacing.md },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: FontSizes.lg, fontWeight: 'bold', color: Colors.text, marginRight: 6 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  email: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md },
  verifyBtn: { backgroundColor: Colors.successLight, paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.md, marginRight: Spacing.sm },
  verifyText: { color: Colors.success, fontWeight: 'bold', fontSize: FontSizes.sm },
  editBtn: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.md, marginRight: Spacing.sm },
  editText: { color: '#fff', fontWeight: 'bold', fontSize: FontSizes.sm },
  deleteBtn: { backgroundColor: Colors.danger, paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.md },
  deleteText: { color: '#fff', fontWeight: 'bold', fontSize: FontSizes.sm },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', padding: Spacing.xl },
  modalCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  modalTitle: { fontSize: FontSizes.xxl, fontWeight: 'bold', color: Colors.text },
  modalLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: 6, fontWeight: '500' },
  modalInput: { backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: 12, fontSize: FontSizes.md, color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg },
  roleRow: { flexDirection: 'row', marginBottom: Spacing.xl },
  roleOption: { flex: 1, padding: 10, borderRadius: BorderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, marginRight: 8 },
  roleSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  roleOptionText: { fontWeight: '600', color: Colors.text, textTransform: 'capitalize' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelModalBtn: { paddingHorizontal: 20, paddingVertical: 12, marginRight: Spacing.md },
  cancelText: { color: Colors.textSecondary, fontWeight: '600' },
  saveModalBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: BorderRadius.md },
  saveText: { color: '#fff', fontWeight: 'bold' },
});
