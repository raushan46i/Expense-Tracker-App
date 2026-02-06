import React, { useState, useCallback } from 'react';
import { FlatList, Text, View, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import tailwind from 'twrnc';
import EmptyList from '../components/EmptyList';
import { useExpenses } from '../context/ExpenseContext';
import ExpenseItemCard from '../components/ExpenseItemCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import HistoryModal from '../components/HistoryModal';
import { getDate } from '../utils/helper';
import LinearGradient from 'react-native-linear-gradient';
import { useBudgetAlerts } from '../hooks/useBudgetAlerts';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext'; // <--- IMPORT THIS
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Define Interface for Navigation
interface HomeProps {
  navigation: any;
}

// Define minimal Expense interface
interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: any;
  time?: string;
}

const Home: React.FC<HomeProps> = ({ navigation }) => {
  const { expenses } = useExpenses();
  const { theme } = useTheme();

  // --- 1. GET CURRENCY FROM CONTEXT ---
  const { baseCurrency, currencies } = useCurrency();
  const currencySymbol = currencies[baseCurrency].symbol;

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // State for Budgets
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [customBudgets, setCustomBudgets] = useState({});

  // Load ALL Budget Data from Storage when screen focuses
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          // A. Load Monthly Budget
          const storedBudget = await AsyncStorage.getItem('monthly_budget');
          if (storedBudget) {
            setMonthlyBudget(parseFloat(storedBudget));
          }

          // B. Load Category Limits (From Settings)
          const storedLimits = await AsyncStorage.getItem('category_limits');
          if (storedLimits) {
            setCustomBudgets(JSON.parse(storedLimits));
          } else {
            setCustomBudgets({}); // Reset if empty
          }

        } catch (error) {
          console.error('Failed to load home data', error);
        }
      };
      loadData();
    }, [])
  );

  // Calculate Total Expenses for the CURRENT MONTH
  const getMonthlyTotal = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return expenses.reduce((sum: number, item: Expense) => {
      const expenseDate = new Date(item.date);
      // Check if expense is in current month and year
      if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
        return sum + Number(item.amount);
      }
      return sum;
    }, 0);
  };

  const monthlyTotal = getMonthlyTotal();

  // Budget Progress Logic
  const progress = monthlyBudget > 0 ? Math.min(monthlyTotal / monthlyBudget, 1) : 0;
  const remaining = monthlyBudget - monthlyTotal;
  const isOverBudget = remaining < 0;

  // Budget Alerts
  useBudgetAlerts(customBudgets, expenses);

  const today = getDate();

  // Sort Today's expenses for the list
  const todaysExpenses: Expense[] = expenses
    .filter((e: Expense) => e.date === today)
    .sort((a, b) => Number(b.id) - Number(a.id));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.secondary }}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

      {/* 1. Header */}
      <View style={tailwind`px-6 pt-2 pb-4 flex-row justify-between items-end`}>
        <View>
          <Text style={[tailwind`text-sm font-semibold uppercase tracking-wider mb-1`, { color: theme.colors.text.tertiary }]}>
            {new Date().toDateString().slice(0, 10)}
          </Text>
          <Text style={[tailwind`text-3xl font-bold`, { color: theme.colors.text.primary }]}>
            Overview
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[tailwind`p-2 rounded-full border`, { borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}
        >
          <Icon name="history" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* 2. Gradient Card */}
      <View style={tailwind`px-6 mb-6 shadow-xl`}>
        <LinearGradient
          colors={isOverBudget ? ['#FF416C', '#FF4B2B'] : [theme.colors.primary.start, theme.colors.primary.end]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[tailwind`rounded-3xl p-6 relative overflow-hidden`, { elevation: 10 }]}
        >
          <View style={[tailwind`absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20`, { backgroundColor: 'white' }]} />

          <View style={tailwind`flex-row justify-between items-start`}>
            <View>
              <Text style={tailwind`text-white opacity-90 font-medium mb-1`}>
                Total Spent (This Month)
              </Text>
              {/* --- 2. UPDATED CURRENCY DISPLAY --- */}
              <Text style={tailwind`text-4xl text-white font-bold tracking-tight`}>
                {currencySymbol}{monthlyTotal.toLocaleString('en-US')}
              </Text>
            </View>
            <View style={tailwind`bg-white/20 px-3 py-1 rounded-full`}>
              <Text style={tailwind`text-white text-xs font-bold`}>
                {new Date().toLocaleString('default', { month: 'short' })}
              </Text>
            </View>
          </View>

          <View style={tailwind`mt-6`}>
            <View style={tailwind`flex-row justify-between mb-2`}>
              <Text style={tailwind`text-white text-xs opacity-90`}>
                {monthlyBudget > 0
                  /* --- 3. UPDATED BUDGET DISPLAY --- */
                  ? `Budget: ${currencySymbol}${monthlyBudget.toLocaleString('en-US')}`
                  : 'No Budget Set'}
              </Text>
              <Text style={tailwind`text-white text-xs font-bold`}>
                {monthlyBudget > 0 ? `${Math.round(progress * 100)}% Used` : '0%'}
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={tailwind`h-2 bg-black/20 rounded-full w-full overflow-hidden`}>
              <View style={[
                tailwind`h-full rounded-full`,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: isOverBudget ? '#fff' : 'rgba(255,255,255,0.9)'
                }
              ]} />
            </View>

            <View style={tailwind`mt-2 flex-row justify-between`}>
              <Text style={tailwind`text-white text-xs opacity-80`}>
                {isOverBudget ? 'Over Budget by:' : 'Remaining:'}
              </Text>
              {/* --- 4. UPDATED REMAINING DISPLAY --- */}
              <Text style={tailwind`text-white text-sm font-bold`}>
                {currencySymbol}{Math.abs(remaining).toLocaleString('en-US')}
              </Text>
            </View>

          </View>
        </LinearGradient>
      </View>

      {/* 3. List Section */}
      <View style={[tailwind`flex-1 px-6 pt-6 rounded-t-3xl shadow-lg`, { backgroundColor: theme.colors.background.primary }]}>
        <View style={tailwind`flex-row justify-between items-center mb-4`}>
          <Text style={[tailwind`text-lg font-bold`, { color: theme.colors.text.primary }]}>
            Today's Activity
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Create')}>
            <Text style={{ color: theme.colors.primary.start, fontWeight: '600' }}>+ Add New</Text>
          </TouchableOpacity>
        </View>

        <FlatList<Expense>
          data={todaysExpenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ExpenseItemCard item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tailwind`pb-24`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary.start}
            />
          }
          ListEmptyComponent={
            <View style={tailwind`mt-10 items-center`}>
              <EmptyList />
              <Text style={[tailwind`text-center mt-4 text-base font-medium`, { color: theme.colors.text.secondary }]}>
                No spending yet today. {"\n"} Keep it up! 🚀
              </Text>
            </View>
          }
        />
      </View>

      {/* 4. FAB */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Create')}
        style={[
          tailwind`absolute bottom-6 right-6 w-14 h-14 rounded-full justify-center items-center shadow-lg`,
          {
            backgroundColor: theme.colors.text.primary,
            shadowColor: "#000",
            elevation: 8
          }
        ]}
      >
        <Icon name="add" size={32} color={theme.colors.background.primary} />
      </TouchableOpacity>

      <HistoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        expenses={expenses}
      />
    </SafeAreaView>
  );
};

export default Home;