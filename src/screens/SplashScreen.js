import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="hardware-chip-outline" size={60} color="#fff" />
        </View>
        <Text style={styles.title}>AI-Solutions</Text>
        <Text style={styles.tagline}>Intelligent Assistance. Human Connection.</Text>
      </View>

      <Text style={styles.footer}>Developed by Autobots Dev</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  circle1: { width: 200, height: 200, top: -50, left: -50 },
  circle2: { width: 150, height: 150, top: 100, right: -30 },
  circle3: { width: 120, height: 120, bottom: 100, left: -20 },
  content: { alignItems: 'center' },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
});
