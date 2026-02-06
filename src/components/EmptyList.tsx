import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface EmptyListProps {
  title?: string;
  message?: string;
}

const EmptyList: React.FC<EmptyListProps> = ({
  title = "No expenses yet",
  message = "Add a new expense to get started",
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📝</Text>

      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        {title}
      </Text>

      <Text style={[styles.message, { color: theme.colors.text.secondary }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60, // Push it down a bit so it doesn't hug the header
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default EmptyList;