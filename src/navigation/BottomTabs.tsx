import React from 'react';
import { View, Platform, StyleSheet } from 'react-native'; // View added
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import Home from '../screen/Home';
// Note: 'Create' import removed because we navigate to the Modal, not render it here.
import Insights from '../screen/Insights';
import AI from '../screen/AI';
import Settings from '../screen/Settings';

import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

const BottomTabs = ({ navigation }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 70,
          backgroundColor: theme.colors.background.primary,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        }
      }}
    >
      {/* 1. HOME */}
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Icon
                name={focused ? "home" : "home-filled"}
                size={26}
                color={focused ? theme.colors.primary.start : theme.colors.text.tertiary}
              />
              {focused && <View style={[styles.activeDot, { backgroundColor: theme.colors.primary.start }]} />}
            </View>
          ),
        }}
      />

      {/* 2. INSIGHTS */}
      <Tab.Screen
        name="Insights"
        component={Insights}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Icon
                name="pie-chart"
                size={26}
                color={focused ? theme.colors.primary.start : theme.colors.text.tertiary}
              />
              {focused && <View style={[styles.activeDot, { backgroundColor: theme.colors.primary.start }]} />}
            </View>
          ),
        }}
      />

      {/* 3. CREATE (Middle Button - Opens Modal) */}
      <Tab.Screen
        name="Add" // Renamed to "Add" to distinguish from the "Create" screen
        component={View} // Dummy component, never rendered
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault(); // Prevent switching to this tab
            navigation.navigate('Create'); // Open the Modal defined in RootNavigator
          },
        })}
        options={{
          tabBarIcon: () => (
            <View style={[styles.middleButtonWrapper, { backgroundColor: theme.colors.background.primary }]}>
              <LinearGradient
                colors={[theme.colors.primary.start, theme.colors.primary.end]}
                style={styles.middleButtonGradient}
              >
                <Icon name="add" size={32} color="white" />
              </LinearGradient>
            </View>
          ),
        }}
      />

      {/* 4. AI */}
      <Tab.Screen
        name="AI"
        component={AI}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Icon
                name="auto-awesome"
                size={26}
                color={focused ? theme.colors.primary.start : theme.colors.text.tertiary}
              />
              {focused && <View style={[styles.activeDot, { backgroundColor: theme.colors.primary.start }]} />}
            </View>
          ),
        }}
      />

      {/* 5. SETTINGS */}
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Icon
                name="settings"
                size={26}
                color={focused ? theme.colors.primary.start : theme.colors.text.tertiary}
              />
              {focused && <View style={[styles.activeDot, { backgroundColor: theme.colors.primary.start }]} />}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    top: 5,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 5,
  },
  middleButtonWrapper: {
    top: 10, // Adjusted to float higher like a true FAB
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  middleButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  }
});

export default BottomTabs;