import React from 'react';
import { Text, TouchableOpacity, ViewStyle, StyleSheet, ActivityIndicator, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  title: string;
  onPress: () => void;
  gradient: string[];
  style?: ViewStyle;
  icon?: string;       // NEW: Optional Icon name
  isLoading?: boolean; // NEW: Show spinner while saving
  disabled?: boolean;
}

const GradientButton: React.FC<Props> = ({
  title,
  onPress,
  gradient,
  style,
  icon,
  isLoading = false,
  disabled = false
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || isLoading}
      style={[styles.container, style]}
    >
      <LinearGradient
        colors={disabled ? ['#ccc', '#999'] : gradient} // Gray out if disabled
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <View style={styles.content}>
            {icon && <Icon name={icon} size={22} color="white" style={styles.icon} />}
            <Text style={styles.text}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 8,
  },
});

export default GradientButton;