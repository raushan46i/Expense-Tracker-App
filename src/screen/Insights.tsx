import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Animated, Easing,
  LayoutAnimation, Platform, UIManager, StyleSheet
} from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

// Contexts
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext'; // Added
import { getFilteredExpenses, processDataForPieChart, Period } from '../utils/helper';

// Components
import PremiumCard from '../components/PremiumCard';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- INTERFACES ---
interface ChartItem {
  value: number;
  color: string;
  text: string;
  name: string;
  focused?: boolean;
}

interface ProcessedData {
  amount: number;
  color: string;
  value: number; // percentage
  name: string;
}

interface InsightsProps {
  navigation: any;
}

// --- COMPONENT ---
const Insights: React.FC<InsightsProps> = ({ navigation }) => {
  const { expenses } = useExpenses();
  const { theme } = useTheme();
  const { formatAmount } = useCurrency(); // Use Dynamic Currency

  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // --- Animation Refs ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // --- Data Processing ---
  const filteredExpenses = useMemo(() => getFilteredExpenses(expenses, selectedPeriod), [expenses, selectedPeriod]);

  const pieDataRaw: ProcessedData[] = useMemo(() => processDataForPieChart(filteredExpenses), [filteredExpenses]);

  const totalSpending = filteredExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);

  // Format data for Gifted Charts
  const chartData: ChartItem[] = pieDataRaw.map((item) => ({
    value: item.amount,
    color: item.color || theme.colors.primary.start,
    text: `${item.value}%`,
    name: item.name,
    focused: false,
  }));

  const topCategory = chartData.sort((a, b) => b.value - a.value)[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.exp), useNativeDriver: true })
    ]).start();
  }, [selectedPeriod]);

  const toggleCategory = (categoryName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory(prev => prev === categoryName ? null : categoryName);
  };

  const getExpensesForCategory = (categoryName: string) => {
    return filteredExpenses
      .filter(e => {
        const eCatName =
          typeof e.category === 'object' && e.category !== null
            ? (e.category as any).name || 'General'
            : e.category || 'General';

        return eCatName === categoryName;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // --- Render Functions ---

  const renderPeriodSelector = () => (
    <View style={[styles.periodSelector, {
      backgroundColor: theme.colors.background.primary,
      borderColor: theme.colors.border
    }]}>
      {(['day', 'week', 'month', 'year'] as Period[]).map((period) => {
        const isActive = selectedPeriod === period;
        return (
          <TouchableOpacity
            key={period}
            onPress={() => {
              setSelectedPeriod(period);
              setExpandedCategory(null);
            }}
            style={[
              styles.periodButton,
              isActive && {
                backgroundColor: theme.colors.background.secondary,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2
              }
            ]}
          >
            <Text style={[
              styles.periodText,
              { color: isActive ? theme.colors.text.primary : theme.colors.text.tertiary }
            ]}>
              {period}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderChartCenter = () => (
    <View style={styles.chartCenter}>
      <Text style={[styles.chartLabel, { color: theme.colors.text.secondary }]}>Total</Text>
      <Text style={[styles.chartTotal, { color: theme.colors.text.primary }]}>
        {formatAmount(totalSpending).replace(/(\.\d*)|(\,00)/g, '')} {/* Compact format */}
      </Text>
    </View>
  );

  const renderCategoryItem = (item: ChartItem, index: number) => {
    const isExpanded = expandedCategory === item.name;
    const categoryExpenses = isExpanded ? getExpensesForCategory(item.name) : [];

    return (
      <View key={index} style={[styles.categoryContainer, { borderColor: theme.colors.border }]}>
        {/* Header Row */}
        <TouchableOpacity
          onPress={() => toggleCategory(item.name)}
          activeOpacity={0.7}
          style={styles.categoryHeader}
        >
          {/* Left: Icon & Name */}
          <View style={styles.categoryLeft}>
            <View style={[styles.colorBar, { backgroundColor: item.color }]} />
            <View>
              <Text style={[styles.categoryName, { color: theme.colors.text.primary }]}>{item.name}</Text>
              <Text style={[styles.categoryPercent, { color: theme.colors.text.tertiary }]}>{item.text} of total</Text>
            </View>
          </View>

          {/* Right: Amount & Chevron */}
          <View style={styles.categoryRight}>
            <Text style={[styles.categoryAmount, { color: theme.colors.text.primary }]}>
              {formatAmount(item.value)}
            </Text>
            <Icon
              name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={20}
              color={theme.colors.text.tertiary}
            />
          </View>
        </TouchableOpacity>

        {/* Expanded List */}
        {isExpanded && (
          <View style={[styles.expandedList, { backgroundColor: theme.colors.background.primary }]}>
            {categoryExpenses.map((expense: any) => (
              <View key={expense.id} style={[styles.expenseItem, { borderColor: theme.colors.border }]}>
                <View style={styles.expenseInfo}>
                  <Text style={[styles.expenseTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
                    {expense.title}
                  </Text>
                  <Text style={[styles.expenseDate, { color: theme.colors.text.tertiary }]}>
                    {expense.date}
                  </Text>
                </View>
                <Text style={[styles.expenseAmount, { color: theme.colors.text.secondary }]}>
                  {formatAmount(expense.amount)}
                </Text>
              </View>
            ))}
            {categoryExpenses.length === 0 && (
              <Text style={[styles.noItemsText, { color: theme.colors.text.tertiary }]}>
                No specific items found.
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>

      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Analytics</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.text.tertiary }]}>Breakdown of your finances</Text>
      </View>

      {/* 2. Main Content */}
      <ScrollView showsVerticalScrollIndicator={false}>

        {renderPeriodSelector()}

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* 3. The Big Chart Card */}
          <View style={styles.chartCardWrapper}>
            <PremiumCard style={styles.chartCard}>
              {chartData.length > 0 ? (
                <PieChart
                  key={theme.isDark ? 'dark' : 'light'}
                  data={chartData}
                  donut
                  showGradient
                  sectionAutoFocus
                  radius={100}
                  innerRadius={75}
                  innerCircleColor={theme.colors.background.card} // Match Card BG
                  centerLabelComponent={renderChartCenter}
                />
              ) : (
                <View style={styles.emptyChart}>
                  <Icon name="donut-small" size={48} color={theme.colors.text.tertiary} />
                  <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>No expenses this {selectedPeriod}</Text>
                </View>
              )}
            </PremiumCard>
          </View>

          {/* 4. Top Spender Insight */}
          {topCategory && (
            <View style={styles.insightWrapper}>
              <LinearGradient
                colors={[theme.colors.primary.start, theme.colors.primary.end]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.insightGradient}
              >
                <View>
                  <Text style={styles.insightLabel}>Top Spending Category</Text>
                  <Text style={styles.insightValue}>{topCategory.name}</Text>
                </View>
                <View style={styles.insightBadge}>
                  <Text style={styles.insightBadgeText}>{topCategory.text}</Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* 5. Detailed List */}
          <View style={[
            styles.detailsContainer,
            { backgroundColor: theme.colors.background.primary }
          ]}>
            <Text style={[styles.detailsHeader, { color: theme.colors.text.primary }]}>Details</Text>
            {chartData.map((item, index) => renderCategoryItem(item, index))}
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 4,
    borderRadius: 16,
    marginBottom: 24,
    marginHorizontal: 24,
    borderWidth: 1,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  periodText: {
    textTransform: 'capitalize',
    fontWeight: '600',
    fontSize: 14,
  },
  chartCardWrapper: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  chartCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  chartCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  chartTotal: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyChart: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 8,
  },
  insightWrapper: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  insightGradient: {
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  insightLabel: {
    color: '#dbeafe', // Blue-100
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  insightValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  insightBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  insightBadgeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingTop: 24,
    paddingBottom: 80,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  detailsHeader: {
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoryContainer: {
    borderBottomWidth: 1,
    marginHorizontal: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryPercent: {
    fontSize: 12,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  expandedList: {
    paddingBottom: 16,
    paddingLeft: 28, // Indent content
    paddingRight: 8,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderLeftWidth: 2,
    paddingLeft: 12,
    marginLeft: 4,
  },
  expenseInfo: {
    flex: 1,
    marginRight: 8,
  },
  expenseTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  expenseDate: {
    fontSize: 12,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  noItemsText: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 8,
  },
});

export default Insights;