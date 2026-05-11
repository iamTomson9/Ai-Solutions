import 'react-native-gesture-handler';
import React, { useContext } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import CustomerOnboardingScreen from './src/screens/CustomerOnboardingScreen';
import SalesOnboardingScreen from './src/screens/SalesOnboardingScreen';

import ClientDrawer from './src/navigation/ClientDrawer';
import SalesDrawer from './src/navigation/SalesDrawer';
import AdminDrawer from './src/navigation/AdminDrawer';

import ProductDetails from './src/screens/ProductDetails';
import CustomerChat from './src/screens/CustomerChat';
import AdminChatReviewScreen from './src/screens/AdminChatReviewScreen';
import SalesChatReply from './src/screens/SalesChatReply';
import CreateItemScreen from './src/screens/CreateItemScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <SplashScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="CustomerOnboarding" component={CustomerOnboardingScreen} />
          <Stack.Screen name="SalesOnboarding" component={SalesOnboardingScreen} />
        </>
      ) : (
        <>
          {user.role === 'customer' && <Stack.Screen name="CustomerRoot" component={ClientDrawer} />}
          {user.role === 'sales' && <Stack.Screen name="SalesRoot" component={SalesDrawer} />}
          {user.role === 'admin' && <Stack.Screen name="AdminRoot" component={AdminDrawer} />}
          
          <Stack.Screen name="ProductDetails" component={ProductDetails} />
          <Stack.Screen name="Chat" component={CustomerChat} />
          <Stack.Screen name="AdminChatReview" component={AdminChatReviewScreen} />
          <Stack.Screen name="SalesChatReply" component={SalesChatReply} />
          <Stack.Screen name="CreateItem" component={CreateItemScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
