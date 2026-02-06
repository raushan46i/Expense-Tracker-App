import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';

type AppHeaderProps = {
  title: string;
  showBack?: boolean;
  rightIcon?: string; // Optional icon name (e.g., "filter-list")
  onRightPress?: () => void;
};

const AppHeader = ({
  title,
  showBack = false,
  rightIcon,
  onRightPress
}: AppHeaderProps) => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>

      {/* Left Section: Back Button or Spacer */}
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.iconButton, { backgroundColor: theme.colors.background.tertiary }]}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} /> // Empty spacer to keep title centered
        )}
      </View>

      {/* Center Section: Title */}
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        {title}
      </Text>

      {/* Right Section: Optional Action Button */}
      <View style={styles.rightContainer}>
        {rightIcon ? (
          <TouchableOpacity
            onPress={onRightPress}
            style={[styles.iconButton, { backgroundColor: theme.colors.background.tertiary }]}
          >
            <Icon name={rightIcon} size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} /> // Spacer
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    // Add subtle shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    zIndex: 10,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20, // Circular button
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppHeader;