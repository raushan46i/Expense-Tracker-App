import React, { useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useExpenses, Expense } from '../context/ExpenseContext'; // Use exported Expense type
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext'; // IMPORT ADDED
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface ExpenseItemCardProps {
  item?: Expense;
  expense?: Expense;
}

const ExpenseItemCard: React.FC<ExpenseItemCardProps> = (props) => {
  const { deleteExpense } = useExpenses();
  const { theme } = useTheme();
  const { formatAmount } = useCurrency(); // HOOK ADDED
  const navigation = useNavigation<any>();

  const expense = props.expense || props.item;
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  if (!expense) return null;

  // Handle category name safely
  const categoryName = (expense.category as any)?.name || 'General';
  const icon = expense.icon || (expense.category as any)?.icon || '💰';

  return (
    <>
      <View style={[styles.card, { backgroundColor: theme.colors.background.card, borderColor: theme.colors.border }]}>

        {/* Left Side: Icon & Details */}
        <View style={styles.leftSection}>
          {/* Icon Box */}
          <View style={[styles.iconBox, { backgroundColor: theme.isDark ? '#334155' : '#E0F2FE' }]}>
            <Text style={{ fontSize: 22 }}>{icon}</Text>
          </View>

          {/* Text Details */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              {expense.title || 'Expense'}
            </Text>

            <View style={styles.metaRow}>
              {/* Category Badge */}
              <View style={[styles.badge, { backgroundColor: expense.color ? expense.color + '20' : theme.colors.background.tertiary }]}>
                <Text style={[styles.badgeText, { color: expense.color || theme.colors.text.secondary }]}>
                  {categoryName}
                </Text>
              </View>
              {/* Time */}
              <Text style={[styles.timeText, { color: theme.colors.text.tertiary }]}>
                {expense.time || expense.date || ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Right Side: Amount & Actions */}
        <View style={styles.rightSection}>
          {/* Dynamic Currency Formatting */}
          <Text style={[styles.amount, { color: theme.colors.text.primary }]}>
            {formatAmount(expense.amount)}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            {/* EDIT BUTTON */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Create', { expense })}
              style={[styles.actionBtn, { backgroundColor: theme.isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE' }]}
            >
              <Icon name="edit" size={16} color="#3B82F6" />
            </TouchableOpacity>

            {/* DELETE BUTTON */}
            <TouchableOpacity
              onPress={() => setDeleteModalVisible(true)}
              style={[styles.actionBtn, { backgroundColor: theme.isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2', marginLeft: 8 }]}
            >
              <Icon name="delete-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ConfirmDeleteModal
        visible={isDeleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={() => deleteExpense(expense.id)}
        title="Remove Transaction?"
        message={`Are you sure you want to delete "${expense.title}"?`}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    // Soft Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  timeText: {
    fontSize: 12,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  actionRow: {
    flexDirection: 'row',
  },
  actionBtn: {
    padding: 6,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExpenseItemCard;