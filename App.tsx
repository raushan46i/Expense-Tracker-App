import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ExpenseProvider } from './src/context/ExpenseContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { CurrencyProvider } from './src/context/CurrencyContext';

import BottomTabs from './src/navigation/BottomTabs'; 
import Create from './src/screen/Create'; 
import Category from './src/screen/Category'; // <--- 1. ADD THIS IMPORT

const Stack = createNativeStackNavigator();

const ThemedStatusBar = () => {
  const { theme } = useTheme();
  return (
    <StatusBar 
      barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
      backgroundColor="transparent" 
      translucent 
    />
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <ExpenseProvider>
            <NavigationContainer>
              <ThemedStatusBar />
              
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Root" component={BottomTabs} />
                
                <Stack.Screen 
                  name="Create" 
                  component={Create} 
                  options={{ 
                    presentation: 'modal', 
                    animation: 'slide_from_bottom' 
                  }}
                />

                {/* --- 2. ADD THIS SCREEN REGISTRATION --- */}
                <Stack.Screen 
                  name="Category" 
                  component={Category} 
                  options={{ 
                    animation: 'slide_from_right' 
                  }}
                />
              </Stack.Navigator>

            </NavigationContainer>
          </ExpenseProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;