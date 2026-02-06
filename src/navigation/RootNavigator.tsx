import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabs from './BottomTabs';
import Category from '../screen/Category';
import Create from '../screen/Create'; // IMPORT ADDED

export type RootStackParamList = {
  BottomTabs: undefined;
  Category: undefined;
  Create: undefined; // TYPE ADDED
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main App with Bottom Tabs */}
      <Stack.Screen name="BottomTabs" component={BottomTabs} />

      {/* Screens that should open as Modals (cover the tabs) */}
      <Stack.Screen
        name="Category"
        component={Category}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      <Stack.Screen
        name="Create"
        component={Create}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;