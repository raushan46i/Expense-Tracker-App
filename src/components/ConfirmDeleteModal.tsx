import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import tailwind from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';

interface ConfirmDeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const { height } = Dimensions.get('window');

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title = "Delete Transaction",
  message = "Are you sure you want to remove this expense? This action cannot be undone."
}) => {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Open Animation
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, speed: 14, bounciness: 6, useNativeDriver: true })
      ]).start();
    } else {
      // Close Animation
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      Animated.timing(slideAnim, { toValue: height, duration: 300, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[
          tailwind`flex-1 justify-end bg-black/60`,
          { opacity: fadeAnim }
        ]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                tailwind`rounded-t-3xl p-6 pb-10 shadow-2xl`,
                {
                  transform: [{ translateY: slideAnim }],
                  backgroundColor: theme.colors.background.secondary,
                  borderTopColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  borderTopWidth: 1,
                }
              ]}
            >
              {/* Drag Handle */}
              <View style={tailwind`items-center mb-6`}>
                <View style={[tailwind`w-12 h-1.5 rounded-full`, { backgroundColor: theme.colors.text.tertiary, opacity: 0.3 }]} />
              </View>

              {/* Icon & Content */}
              <View style={tailwind`items-center mb-8`}>
                <View style={[
                  tailwind`w-16 h-16 rounded-full items-center justify-center mb-4 shadow-lg`,
                  { backgroundColor: '#fee2e2' }
                ]}>
                  <Icon name="delete-forever" size={32} color="#ef4444" />
                </View>

                <Text style={[tailwind`text-xl font-bold mb-2 text-center`, { color: theme.colors.text.primary }]}>
                  {title}
                </Text>
                <Text style={[tailwind`text-base text-center px-4 leading-6`, { color: theme.colors.text.secondary }]}>
                  {message}
                </Text>
              </View>

              {/* Buttons */}
              <View style={tailwind`flex-row gap-4`}>
                <TouchableOpacity
                  onPress={onClose}
                  style={[
                    tailwind`flex-1 py-4 rounded-2xl items-center border`,
                    {
                      borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      backgroundColor: theme.colors.background.primary
                    }
                  ]}
                >
                  <Text style={[tailwind`font-bold text-base`, { color: theme.colors.text.primary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => { onConfirm(); onClose(); }}
                  style={[
                    tailwind`flex-1 py-4 rounded-2xl items-center shadow-lg`,
                    { backgroundColor: '#ef4444', shadowColor: '#ef4444', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 }
                  ]}
                >
                  <Text style={tailwind`font-bold text-base text-white`}>Delete</Text>
                </TouchableOpacity>
              </View>

            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ConfirmDeleteModal;