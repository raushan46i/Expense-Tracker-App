import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView, Text, View, TextInput, Pressable, Alert, Animated, TouchableOpacity,
  ActivityIndicator, StyleSheet, Keyboard, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Contexts
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';

// Components
import PremiumCard from '../components/PremiumCard';

interface Category { name: string; icon: string; color: string; }
interface CreateProps { navigation: any; route: any; }

// --- 1. UPGRADED AI CATEGORY LOGIC ---
const detectCategory = (text: string): string => {
  const t = text.toLowerCase();

  // Specific Checks (Order matters! Check specific before general)
  if (t.includes('petrol') || t.includes('diesel') || t.includes('cng') || t.includes('fuel') || t.includes('gas station')) return 'Fuel';

  if (t.includes('uber') || t.includes('ola') || t.includes('rapido') || t.includes('taxi') || t.includes('cab') || t.includes('bus') || t.includes('metro') || t.includes('train') || t.includes('auto')) return 'Transportation';

  if (t.includes('flight') || t.includes('hotel') || t.includes('airbnb') || t.includes('trip') || t.includes('vacation') || t.includes('booking')) return 'Travel';

  if (t.includes('recharge') || t.includes('data') || t.includes('wifi') || t.includes('broadband') || t.includes('jio') || t.includes('airtel') || t.includes('mobile')) return 'Phone/Internet';

  if (t.includes('food') || t.includes('burger') || t.includes('pizza') || t.includes('coffee') || t.includes('cafe') || t.includes('tea') || t.includes('starbucks') || t.includes('swiggy') || t.includes('zomato') || t.includes('restaurant') || t.includes('lunch') || t.includes('dinner')) return 'Food';

  if (t.includes('grocery') || t.includes('vegetable') || t.includes('milk') || t.includes('fruit') || t.includes('supermarket') || t.includes('mart')) return 'Housing'; // or Miscellaneous

  if (t.includes('movie') || t.includes('netflix') || t.includes('prime') || t.includes('cinema') || t.includes('subscription') || t.includes('game')) return 'Entertainment';

  if (t.includes('electricity') || t.includes('water') || t.includes('bill') || t.includes('rent') || t.includes('maintenance')) return 'Bills/Utilities';

  if (t.includes('medicine') || t.includes('doctor') || t.includes('pharmacy') || t.includes('hospital') || t.includes('checkup')) return 'Healthcare';

  if (t.includes('fee') || t.includes('course') || t.includes('book') || t.includes('school') || t.includes('college') || t.includes('tuition')) return 'Education';

  if (t.includes('shirt') || t.includes('pant') || t.includes('cloth') || t.includes('shoe') || t.includes('jeans') || t.includes('amazon') || t.includes('flipkart') || t.includes('myntra') || t.includes('shop')) return 'Shopping';

  if (t.includes('party') || t.includes('drink') || t.includes('beer') || t.includes('alcohol') || t.includes('bar') || t.includes('gift')) return 'Socializing';

  return 'General'; // Default
};

// --- 2. FULL CATEGORY MAP (Matches your Settings) ---
const getCategoryDetails = (name: string) => {
  const map: Record<string, Category> = {
    'Food': { name: 'Food', icon: '🍔', color: '#FFD700' },
    'Bills/Utilities': { name: 'Bills/Utilities', icon: '💡', color: '#FFA07A' },
    'Family': { name: 'Family', icon: '👨‍👩‍👧‍👦', color: '#90EE90' },
    'Healthcare': { name: 'Healthcare', icon: '🏥', color: '#FF7F7F' },
    'Fuel': { name: 'Fuel', icon: '⛽', color: '#FF8C00' },
    'Phone/Internet': { name: 'Phone/Internet', icon: '📱', color: '#87CEEB' },
    'Education': { name: 'Education', icon: '📚', color: '#9370DB' },
    'Entertainment': { name: 'Entertainment', icon: '🎬', color: '#E6E6FA' },
    'Shopping': { name: 'Shopping', icon: '🛍️', color: '#FF69B4' },
    'Travel': { name: 'Travel', icon: '✈️', color: '#00CED1' },
    'Socializing': { name: 'Socializing', icon: '🍻', color: '#CD853F' },
    'Transportation': { name: 'Transportation', icon: '🚗', color: '#FFA500' },
    'Housing': { name: 'Housing', icon: '🏠', color: '#ADD8E6' },
    'General': { name: 'General', icon: '🧾', color: '#94a3b8' },
  };
  return map[name] || map['General'];
};

const Create: React.FC<CreateProps> = ({ navigation, route }) => {
  const { addExpense, updateExpense } = useExpenses();
  const { theme } = useTheme();
  const { currencies, baseCurrency } = useCurrency();

  const currencySymbol = currencies[baseCurrency].symbol;
  const isDark = theme.isDark;

  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // AI Modal State
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [category, setCategory] = useState<Category>({
    name: 'General', icon: '🧾', color: '#94a3b8',
  });

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (route.params?.selectedCategory) {
      setCategory(route.params.selectedCategory);
    }
    if (route.params?.expense && !isEditing) {
      const { expense } = route.params;
      setTitle(expense.title);
      setAmount(expense.amount.toString());
      if (!route.params?.selectedCategory) {
        setCategory(expense.category);
      }
      setIsEditing(true);
    }
  }, [route.params]);

  useEffect(() => {
    Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.spring(buttonScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
  }, []);

  const processAIInput = () => {
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    Keyboard.dismiss();

    setTimeout(() => {
      // 1. Extract Amount (Looks for numbers)
      const amountMatch = aiPrompt.match(/[\d,]+(\.\d+)?/);
      const detectedAmount = amountMatch ? amountMatch[0].replace(/,/g, '') : '';

      // 2. Detect Category (Improved Logic)
      const detectedCatName = detectCategory(aiPrompt);
      const detectedCatObj = getCategoryDetails(detectedCatName);

      // 3. Extract Title
      const cleanTitle = aiPrompt
        .replace(amountMatch ? amountMatch[0] : '', '')
        .replace(currencies[baseCurrency].symbol, '')
        .replace(/ for /i, ' ')
        .replace(/ in /i, ' ')
        .replace(/ at /i, ' ')
        .trim();

      // Apply Values
      if (detectedAmount) setAmount(detectedAmount);
      if (cleanTitle) setTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1));
      setCategory(detectedCatObj);

      setAiLoading(false);
      setAiModalVisible(false);
      setAiPrompt('');
    }, 1000); // 1 second "thinking" time
  };

  const handleSave = async () => {
    if (!amount && !title) {
      Alert.alert('Missing Info', 'Please enter an amount and a title.');
      return;
    }

    const finalAmount = parseFloat(amount);
    if (isNaN(finalAmount)) {
      Alert.alert("Invalid Amount", "Please enter a valid number");
      return;
    }
    const finalTitle = title || 'Untitled Expense';

    try {
      if (isEditing && route.params?.expense) {
        await updateExpense({
          ...route.params.expense,
          title: finalTitle,
          amount: finalAmount,
          category,
        });
      } else {
        await addExpense({
          title: finalTitle,
          amount: finalAmount,
          category: category
        });
      }
      setAmount('');
      setTitle('');
      Keyboard.dismiss();
      navigation.getParent()?.navigate('BottomTabs', { screen: 'Home' });

    } catch (error) {
      console.error("Save failed", error);
      Alert.alert("Error", "Could not save expense.");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>

      <View style={styles.bgGradientContainer}>
        <LinearGradient
          colors={[theme.colors.primary.start + '40', 'transparent']}
          style={styles.flex1}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={28} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            {isEditing ? "Edit Expense" : "New Expense"}
          </Text>
        </Animated.View>

        <View style={styles.formContainer}>
          <PremiumCard style={styles.cardSpacing}>

            {/* Category Button */}
            <View>
              <Text style={[styles.label, { color: theme.colors.text.tertiary }]}>Category</Text>
              <Pressable
                style={[styles.inputContainer, { backgroundColor: theme.colors.background.tertiary, borderColor: theme.colors.border }]}
                onPress={() => {
                  navigation.navigate('Category', {
                    returnCategory: (newCat: Category) => setCategory(newCat)
                  });
                }}
              >
                <View style={styles.row}>
                  <View style={[styles.categoryIcon, { backgroundColor: isDark ? '#334155' : 'white' }]}>
                    <Text style={{ fontSize: 24 }}>{category.icon}</Text>
                  </View>
                  <View>
                    <Text style={[styles.inputText, { color: theme.colors.text.primary }]}>{category.name}</Text>
                    <Text style={[styles.subText, { color: category.color }]}>Tap to change</Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={24} color={theme.colors.text.tertiary} />
              </Pressable>
            </View>

            {/* Title Input */}
            <View style={styles.sectionSpacing}>
              <Text style={[styles.label, { color: theme.colors.text.tertiary }]}>Title</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.tertiary, borderColor: theme.colors.border }]}>
                <View style={[styles.iconCircle, { backgroundColor: theme.colors.accent.start + '20' }]}>
                  <Icon name="edit" size={20} color={theme.colors.accent.start} />
                </View>
                <TextInput
                  style={[styles.textInput, { color: theme.colors.text.primary }]}
                  placeholder="e.g. Coffee"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            {/* Amount Input */}
            <View>
              <Text style={[styles.label, { color: theme.colors.text.tertiary }]}>Amount</Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.tertiary, borderColor: theme.colors.border }]}>
                <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary.start + '20' }]}>
                  <Text style={[styles.currencySymbol, { color: theme.colors.primary.start }]}>{currencySymbol}</Text>
                </View>
                <TextInput
                  style={[styles.amountInput, { color: theme.colors.text.primary }]}
                  placeholder="0"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* AI Button */}
            {!isEditing && (
              <TouchableOpacity onPress={() => setAiModalVisible(true)} style={styles.aiButton}>
                <LinearGradient
                  colors={isDark ? ['#334155', '#1e293b'] : ['#f0f9ff', '#e0f2fe']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[styles.aiGradient, { borderColor: theme.colors.primary.start + '30' }]}
                >
                  <Icon name="auto-awesome" size={18} color={theme.colors.primary.start} style={{ marginRight: 8 }} />
                  <Text style={[styles.aiText, { color: theme.colors.primary.start }]}>
                    AI Auto-Fill
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </PremiumCard>
        </View>

        {/* Save Button */}
        <Animated.View style={[styles.saveButtonContainer, { transform: [{ scale: buttonScale }] }]}>
          <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
            <LinearGradient
              colors={[theme.colors.primary.start, theme.colors.primary.end]}
              style={[styles.saveButton, { shadowColor: theme.colors.primary.start }]}
            >
              <Text style={styles.saveButtonText}>{isEditing ? "Update" : "Save"}</Text>
              <Icon name="check" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* --- AI INPUT MODAL --- */}
      <Modal visible={aiModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background.primary }]}>
            <View style={styles.modalHeader}>
              <Icon name="auto-awesome" size={24} color={theme.colors.primary.start} />
              <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>AI Assistant</Text>
            </View>

            <Text style={{ color: theme.colors.text.tertiary, marginBottom: 12 }}>
              Type something like "Petrol 500" or "Uber 250"
            </Text>

            <View style={[styles.aiInputWrapper, { backgroundColor: theme.colors.background.tertiary }]}>
              <TextInput
                value={aiPrompt}
                onChangeText={setAiPrompt}
                placeholder="e.g. Petrol 500..."
                placeholderTextColor={theme.colors.text.tertiary}
                style={[styles.aiInput, { color: theme.colors.text.primary }]}
                autoFocus
                onSubmitEditing={processAIInput}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setAiModalVisible(false)} disabled={aiLoading} style={styles.cancelBtn}>
                <Text style={{ color: theme.colors.text.secondary }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={processAIInput}
                disabled={!aiPrompt || aiLoading}
                style={[styles.magicBtn, { backgroundColor: theme.colors.primary.start, opacity: !aiPrompt ? 0.5 : 1 }]}
              >
                {aiLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Text style={{ color: 'white', fontWeight: 'bold', marginRight: 4 }}>Auto-Fill</Text>
                    <Icon name="bolt" size={20} color="white" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex1: { flex: 1 },
  bgGradientContainer: { position: 'absolute', top: 0, width: '100%', height: 250, opacity: 0.5 },
  scrollContent: { paddingBottom: 40 },
  header: { padding: 24 },
  backButton: { marginBottom: 16, alignSelf: 'flex-start' },
  headerTitle: { fontSize: 32, fontWeight: 'bold' },
  formContainer: { paddingHorizontal: 24 },
  cardSpacing: { marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.7, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  categoryIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16, elevation: 2 },
  inputText: { fontSize: 18, fontWeight: 'bold' },
  subText: { fontSize: 12 },
  sectionSpacing: { marginVertical: 24 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  textInput: { flex: 1, fontSize: 18, fontWeight: '500' },
  currencySymbol: { fontSize: 18, fontWeight: 'bold' },
  amountInput: { flex: 1, fontSize: 24, fontWeight: 'bold' },

  // AI Button Styles
  aiButton: { marginTop: 24, marginBottom: 8 },
  aiGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  aiText: { fontWeight: 'bold', fontSize: 14 },

  saveButtonContainer: { paddingHorizontal: 24, marginTop: 8 },
  saveButton: { borderRadius: 20, paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18, marginRight: 8 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', borderRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
  aiInputWrapper: { borderRadius: 12, padding: 12, marginBottom: 24 },
  aiInput: { fontSize: 18, fontWeight: '500' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 16 },
  cancelBtn: { padding: 8 },
  magicBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
});

export default Create;