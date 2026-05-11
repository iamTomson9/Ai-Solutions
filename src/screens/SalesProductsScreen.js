import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as DB from '../services/DatabaseService';
import GlobalHeader from '../components/GlobalHeader';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function SalesProductsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = navigation.addListener('focus', loadData);
    return unsub;
  }, [navigation]);

  const loadData = async () => {
    setLoading(true);
    const data = await DB.getAllItemsBySalesrep(user.email);
    setItems(data);
    setLoading(false);
  };

  const handleDelete = (item) => {
    Alert.alert('Delete Item', `Are you sure you want to delete this ${item.category}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          if (item.type === 'product') await DB.deleteProduct(item.id);
          else if (item.type === 'demo') await DB.deleteDemo(item.id);
          else if (item.type === 'event') await DB.deleteEvent(item.id);
          loadData();
      }}
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Image 
        source={item.image_uri ? { uri: item.image_uri } : { uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop' }} 
        style={styles.cardImg} 
      />
      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <View style={[styles.tag, { backgroundColor: colors.glow }]}>
            <Text style={[styles.tagText, { color: colors.primary }]}>{item.category || 'Innovation'}</Text>
          </View>
          <Text style={[styles.price, { color: colors.primary }]}>P{item.price}</Text>
        </View>
        
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.glow }]}
            onPress={() => navigation.navigate('ProductDetails', { id: item.id })}
          >
            <Ionicons name="eye-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.primary + '15' }]}
            onPress={() => navigation.navigate('CreateItem', { editItem: item })}
          >
            <Ionicons name="create-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.danger + '15' }]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlobalHeader navigation={navigation} title="Inventory" />
      
      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={60} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>You haven't created any innovations yet.</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        onPress={() => navigation.navigate('CreateItem')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Spacing.lg, paddingBottom: 140 },
  card: { borderRadius: BorderRadius.xl, marginBottom: Spacing.xl, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  cardImg: { width: '100%', height: 160 },
  cardInfo: { padding: Spacing.lg },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  price: { fontWeight: 'bold', fontSize: FontSizes.md },
  title: { fontSize: FontSizes.lg, fontWeight: 'bold', marginBottom: 4 },
  desc: { fontSize: FontSizes.sm, lineHeight: 18, marginBottom: Spacing.lg },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', bottom: 110, right: 25, width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  empty: { alignItems: 'center', marginTop: 100, padding: Spacing.xxl },
  emptyText: { textAlign: 'center', marginTop: Spacing.lg, fontSize: FontSizes.md, lineHeight: 22 },
});
