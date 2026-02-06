import React from 'react';
import { View } from 'react-native'; // Import View for the dummy component
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AntDesign from 'react-native-vector-icons/AntDesign';

// Screens
import Home from '../screen/Home';
import Create from '../screen/Create';
import Insights from '../screen/Insights';
import AI from '../screen/AI';
import Category from '../screen/Category';
import Settings from '../screen/Settings';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 1. Define Bottom Tabs (Without the actual Create Screen)
function BottomTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={24} color={color} />
          ),
        }}
      />

      {/* 2. The "Fake" Create Tab (Just a button) */}
      <Tab.Screen
        name="CreateTab"
        component={View} // Dummy component
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault(); // Stop default tab switch
            navigation.navigate('Create'); // Open the Modal instead
          },
        })}
        options={{
          tabBarLabel: 'Create',
          tabBarIcon: ({ color }) => (
            <AntDesign name="pluscircle" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Insights"
        component={Insights}
        options={{
          tabBarIcon: ({ color }) => (
            <AntDesign name="piechart" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="AI"
        component={AI}
        options={{
          tabBarIcon: ({ color }) => (
            <AntDesign name="bulb1" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarIcon: ({ color }) => (
            <AntDesign name="setting" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// 3. Root Stack (Where the real Modals live)
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* The Main App (Tabs) */}
      <Stack.Screen name="BottomTabs" component={BottomTabs} />

      {/* Create Screen (Now a Modal) */}
      <Stack.Screen
        name="Create"
        component={Create}
        options={{
          presentation: 'modal', // This makes it slide up!
          animation: 'slide_from_bottom',
        }}
      />

      {/* Category Screen (Also a Modal) */}
      <Stack.Screen
        name="Category"
        component={Category}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}