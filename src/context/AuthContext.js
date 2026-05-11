import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DB from '../services/DatabaseService';

export const AuthContext = createContext();

const CURRENT_USER_KEY = '@ai_solutions_current_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Initialize database
        await DB.initDatabase();

        // Seed default admin if no users exist
        const users = await DB.getUsers();
        if (users.length === 0) {
          await DB.createUser({
            name: 'Super Admin',
            email: 'aisol@admin.org',
            password: 'Admin@ai',
            role: 'admin',
            is_verified: 1,
          });
          // Seed a test sales rep
          await DB.createUser({
            name: 'Sales Rep',
            email: 'sales@sale.org',
            password: 'sales',
            role: 'sales',
            is_verified: 1,
          });
        }

        // Restore session
        const storedUser = await AsyncStorage.getItem(CURRENT_USER_KEY);
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          // Refresh from DB in case profile was updated
          const fresh = await DB.getUserByEmail(parsed.email);
          if (fresh) {
            setUser(fresh);
            await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(fresh));
          }
        }
      } catch (e) {
        console.error('Auth init error:', e);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const existing = await DB.getUserByEmail(email);
    if (!existing) return { success: false, message: 'Invalid credentials' };
    if (existing.password !== password) return { success: false, message: 'Invalid credentials' };
    if (existing.is_verified === 0) return { success: false, message: 'Your account is pending Admin verification.' };

    await DB.logLogin(email, existing.name);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(existing));
    setUser(existing);
    return { success: true };
  };

  const registerCustomer = async (details) => {
    const result = await DB.createUser({
      ...details,
      role: 'customer',
      is_verified: 1,
    });
    if (!result.success) return result;
    return { success: true, pendingVerification: false };
  };

  const registerSalesRep = async (details) => {
    const result = await DB.createUser({
      ...details,
      role: 'sales',
      is_verified: 0,
    });
    if (!result.success) return result;
    return { success: true, pendingVerification: true };
  };

  const updateProfile = async (fields) => {
    if (!user) return;
    await DB.updateUser(user.email, fields);
    const updated = await DB.getUserByEmail(user.email);
    setUser(updated);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
  };

  const logout = async () => {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, registerCustomer, registerSalesRep, updateProfile, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
