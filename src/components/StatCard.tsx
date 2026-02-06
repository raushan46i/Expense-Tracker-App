import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCurrency } from '../context/CurrencyContext';

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: string;
  gradient: string[];
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, gradient }) => {
  const { formatAmount } = useCurrency();

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Header: Icon + Title */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Icon name={icon} size={20} color={gradient[0]} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Value */}
      <Text style={styles.amount}>
        {formatAmount(value)}
      </Text>

      {/* Subtitle */}
      {subtitle && (
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 150, // Ensures it looks good even with short text
    flex: 1,       // Allows it to grow if placed in a row
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // White circle for contrast
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.9,
  },
  amount: {
    color: 'white',
    fontSize: 24, // Large and readable
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default StatCard;