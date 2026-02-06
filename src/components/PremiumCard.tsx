import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface PremiumCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const PremiumCard: React.FC<PremiumCardProps> = ({ children, style }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background.card, // Pops against the page bg
          borderColor: theme.colors.border, // Subtle border defined in theme
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24, // Matches 'rounded-3xl'
    padding: 20,      // Matches 'p-5'
    borderWidth: 1,

    // Premium Shadow (iOS)
    shadowColor: '#6366f1', // Slight indigo tint in shadow
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,

    // Android Elevation
    elevation: 4,
  },
});

export default PremiumCard;