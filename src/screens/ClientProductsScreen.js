import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as DB from '../services/DatabaseService';
import GlobalHeader from '../components/GlobalHeader';
import { Spacing, FontSizes, BorderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - (Spacing.xl * 3)) / 2;

export default function ClientProductsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { colors, isDark } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await DB.getProducts();
    setItems(data);
    setLoading(false);
  };

  const handleQuickAdd = async (item) => {
    // Quick interest from gallery
    const res = await DB.addBooking(user.email, item.id, 'products', 'Quick Interest from Gallery');
    if (res.success) {
      Alert.alert('Perfect!', 'We have recorded your interest. A representative will contact you.');
    } else {
      Alert.alert('Notice', res.message);
    }
  };

  const renderProduct = ({ item, index }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      style={[
        styles.productCard, 
        { backgroundColor: colors.surface, marginTop: index % 2 === 0 ? 0 : 30 },
        isDark && styles.cardGlow
      ]}
      onPress={() => navigation.navigate('ProductDetails', { id: item.id, table: 'products' })}
    >
      <Image source={item.image_uri ? { uri: item.image_uri } : { uri: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop' }} style={styles.cardImg} />
      
      <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.cardOverlay}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardPrice, { color: colors.primary }]}>P{item.price || '0'}</Text>
          <Ionicons name="sparkles" size={14} color={colors.primary} />
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.cardCategory, { color: colors.textMuted }]}>{item.category || 'Software'}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>4.9</Text>
          </View>
          <TouchableOpacity 
            style={[styles.plusBtn, { backgroundColor: colors.primary }]}
            onPress={() => handleQuickAdd(item)}
          >
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GlobalHeader navigation={navigation} title="Digital Store" />
      
      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={
          <View style={styles.pageHeader}>
            <Text style={[styles.pageSubtitle, { color: colors.primary }]}>Premium Solutions</Text>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Next-Gen{'\n'}Innovation</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Spacing.xl, paddingBottom: 100 },
  columnWrapper: { justifyContent: 'space-between' },
  pageHeader: { marginBottom: Spacing.xxl, marginTop: Spacing.md },
  pageSubtitle: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  pageTitle: { fontSize: 36, fontWeight: 'bold', lineHeight: 42 },
  productCard: { width: COLUMN_WIDTH, borderRadius: 24, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 12 },
  cardGlow: { shadowColor: '#3B82F6', shadowOpacity: 0.2, shadowRadius: 20 },
  cardImg: { width: '100%', height: 180, resizeMode: 'cover' },
  cardOverlay: { padding: 14, paddingTop: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardPrice: { fontSize: 16, fontWeight: 'bold' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  cardCategory: { fontSize: 12, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 4, fontSize: 12, fontWeight: '600' },
  plusBtn: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
});
