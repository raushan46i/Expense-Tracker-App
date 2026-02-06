import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface GlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          // Dark Mode: 10% White (Subtle)
          // Light Mode: 80% White (Frosted look against light gray backgrounds)
          backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',

          // Border to define edges
          borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 1)',
        },
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    overflow: 'hidden', // Ensures content respects border radius
  },
});

export default GlassCard;