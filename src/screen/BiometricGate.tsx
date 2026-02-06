import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import tailwind from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authenticateBiometric } from '../services/biometricService';

const BiometricGate = ({ children }: any) => {
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const enabled = await AsyncStorage.getItem('biometricEnabled');
      if (enabled !== 'true') {
        setUnlocked(true);
        setLoading(false);
        return;
      }

      const success = await authenticateBiometric();
      if (!success) {
        Alert.alert('Authentication Failed', 'App locked');
      } else {
        setUnlocked(true);
      }
      setLoading(false);
    };

    check();
  }, []);

  if (loading) {
    return (
      <View style={tailwind`flex-1 items-center justify-center bg-black`}>
        <ActivityIndicator size="large" color="white" />
        <Text style={tailwind`text-white mt-3`}>Authenticating...</Text>
      </View>
    );
  }

  return unlocked ? children : null;
};

export default BiometricGate;
