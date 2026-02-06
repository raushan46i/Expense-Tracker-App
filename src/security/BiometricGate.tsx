import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, AppState, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { authenticateBiometric } from '../services/biometricService';
import { useTheme } from '../context/ThemeContext'; // Integrated Theme

const BiometricGate = ({ children }: { children: React.ReactNode }) => {
  const [isLocked, setIsLocked] = useState(true); 
  const [isAuthenticating, setIsAuthenticating] = useState(true); 
  const { theme } = useTheme();

  const checkLock = useCallback(async () => {
    setIsAuthenticating(true);
    try {
      const enabled = await AsyncStorage.getItem('biometricEnabled');
      
      if (enabled === 'true') {
        const success = await authenticateBiometric();
        if (success) {
            setIsLocked(false);
        } else {
            // User failed auth: Stay locked, stop loading
            setIsLocked(true); 
        }
      } else {
        // Biometrics disabled: Unlock immediately
        setIsLocked(false);
      }
    } catch (error) {
      console.error("Biometric Check Failed", error);
      setIsLocked(true);
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  useEffect(() => {
    checkLock();

    // Re-lock when app goes to background
    const sub = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        setIsLocked(true); 
        checkLock();
      }
    });

    return () => sub.remove();
  }, [checkLock]);

  // UNLOCKED STATE: Render App
  if (!isLocked) {
    return <>{children}</>;
  }

  // LOCKED STATE: Render Lock Screen
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      {isAuthenticating ? (
        <ActivityIndicator size="large" color={theme.colors.primary.start} />
      ) : (
        <View style={styles.content}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.primary.start + '20' }]}>
                <Icon name="lock" size={64} color={theme.colors.primary.start} />
            </View>
            
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>App Locked</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
                Authentication required to access your expenses.
            </Text>
            
            <TouchableOpacity 
                onPress={checkLock}
                style={[styles.button, { backgroundColor: theme.colors.primary.start }]}
            >
                <Text style={styles.buttonText}>Tap to Unlock</Text>
            </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 30,
    width: '100%',
  },
  iconBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default BiometricGate;