import React, { useState, useEffect } from 'react';
import { 
  View, Text, Switch, TouchableOpacity, Alert, ScrollView, 
  StyleSheet, Modal, TextInput, FlatList 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Contexts
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { useCurrency, CurrencyCode } from '../context/CurrencyContext';

// Services & Utils
import { exportData } from '../utils/exportUtils';
import { isBiometricAvailable, authenticateBiometric } from '../services/biometricService';

// --- YOUR CUSTOM CATEGORIES ---
interface Category {
  name: string;
  icon: string;
  color: string;
}

const CATEGORIES: Category[] = [
  { name: "Food", icon: "🍔", color: "#FFD700" },
  { name: "Bills/Utilities", icon: "💡", color: "#FFA07A" },
  { name: "Family", icon: "👨‍👩‍👧‍👦", color: "#90EE90" },
  { name: "Healthcare", icon: "🏥", color: "#FF7F7F" },
  { name: "Fuel", icon: "⛽", color: "#FF8C00" },
  { name: "Phone/Internet", icon: "📱", color: "#87CEEB" },
  { name: "Education", icon: "📚", color: "#9370DB" },
  { name: "Entertainment", icon: "🎬", color: "#E6E6FA" },
  { name: "Shopping", icon: "🛍️", color: "#FF69B4" },
  { name: "Travel", icon: "✈️", color: "#00CED1" },
  { name: "Socializing", icon: "🍻", color: "#CD853F" },
  { name: "Withdrawal", icon: "🏧", color: "#D3D3D3" },
  { name: "Transfer", icon: "💸", color: "#32CD32" },
  { name: "Transportation", icon: "🚗", color: "#FFA500" },
  { name: "Housing", icon: "🏠", color: "#ADD8E6" },
  { name: "Miscellaneous", icon: "📦", color: "#808080" },
];

// --- HELPER COMPONENT PROPS ---
interface SettingItemProps {
  icon: string;
  color: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isDestructive?: boolean;
}

// --- HELPER COMPONENTS ---
const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
  const { theme } = useTheme();
  return (
    <Text style={[styles.sectionHeader, { color: theme.colors.text.tertiary }]}>
        {title}
    </Text>
  );
};

const SettingItem: React.FC<SettingItemProps> = ({ 
  icon, color, label, value, rightElement, onPress, isDestructive 
}) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity 
        onPress={onPress} 
        disabled={!onPress}
        activeOpacity={0.7}
        style={[
            styles.settingItem,
            { 
                backgroundColor: theme.colors.background.primary,
                borderColor: theme.colors.border
            }
        ]}
    >
        <View style={styles.settingLeft}>
            <View style={[
                styles.iconBox,
                { backgroundColor: isDestructive ? '#fee2e2' : (theme.isDark ? 'rgba(255,255,255,0.1)' : color + '15') }
            ]}>
                <Icon name={icon} size={20} color={isDestructive ? '#ef4444' : color} />
            </View>
            <Text style={[
                styles.settingLabel,
                { color: isDestructive ? '#ef4444' : theme.colors.text.primary }
            ]}>
                {label}
            </Text>
        </View>
        
        <View style={styles.settingRight}>
            {value && (
                <Text style={[styles.settingValue, { color: theme.colors.text.secondary }]}>
                    {value}
                </Text>
            )}
            {rightElement ? rightElement : (onPress && <Icon name="chevron-right" size={24} color={theme.colors.text.tertiary} />)}
        </View>
    </TouchableOpacity>
  );
};

// --- MAIN COMPONENT ---
const Settings: React.FC = () => {
 const { theme, toggleTheme } = useTheme();
 const { expenses, clearAll, monthlyBudget, setMonthlyBudget } = useExpenses();
 
 const { baseCurrency, changeBaseCurrency, currencies, formatAmount } = useCurrency();
 const currencySymbol = currencies[baseCurrency].symbol;

 const [biometricEnabled, setBiometricEnabled] = useState(false);
 
 // Modals State
 const [isCurrencyModalVisible, setCurrencyModalVisible] = useState(false);
 const [isBudgetModalVisible, setBudgetModalVisible] = useState(false);
 const [isCatLimitModalVisible, setCatLimitModalVisible] = useState(false);

 const [tempBudget, setTempBudget] = useState('');
 
 // Category Limit States
 const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>({});
 const [newCatName, setNewCatName] = useState(''); 
 const [newCatLimit, setNewCatLimit] = useState('');

 useEffect(() => {
   // Load Biometric
   AsyncStorage.getItem('biometricEnabled').then(v => {
     if (v === 'true') setBiometricEnabled(true);
   });

   // Load Category Limits
   loadCategoryLimits();
 }, []);

 const loadCategoryLimits = async () => {
    try {
        const stored = await AsyncStorage.getItem('category_limits');
        if (stored) setCategoryLimits(JSON.parse(stored));
    } catch (e) { console.error(e); }
 };

 const toggleBiometric = async (value: boolean) => {
   if (value) {
     const available = await isBiometricAvailable();
     if (!available) {
       Alert.alert('Not Supported', 'Biometric sensor not available');
       return;
     }
     const success = await authenticateBiometric();
     if (!success) {
       Alert.alert('Failed', 'Authentication failed');
       return;
     }
   }
   setBiometricEnabled(value);
   await AsyncStorage.setItem('biometricEnabled', value.toString());
 };

 const handleClearAll = () => {
   Alert.alert(
     'Delete All Data',
     'This will permanently wipe all your expense history. This action cannot be undone.',
     [
       { text: 'Cancel', style: 'cancel' },
       {
         text: 'Delete',
         style: 'destructive',
         onPress: async () => {
           await clearAll();
           Alert.alert('Success', 'All data has been reset.');
         },
       },
     ]
   );
 };

 const saveBudget = async () => { 
      const amount = Number(tempBudget);
      if (!isNaN(amount) && amount > 0) {
          await AsyncStorage.setItem('monthly_budget', amount.toString());
          setMonthlyBudget(amount);
          setBudgetModalVisible(false);
      } else {
          Alert.alert("Invalid Amount", "Please enter a valid number.");
      }
 };

 const openBudgetModal = () => {
      setTempBudget(monthlyBudget.toString());
      setBudgetModalVisible(true);
 };

 // Save Category Limit
 const saveCategoryLimit = async () => {
    if (!newCatName || !newCatLimit) {
        Alert.alert("Error", "Please select a category and enter a limit.");
        return;
    }
    const amount = parseFloat(newCatLimit);
    if (isNaN(amount) || amount <= 0) {
        Alert.alert("Error", "Please enter a valid amount");
        return;
    }

    const updatedLimits = { ...categoryLimits, [newCatName]: amount };
    setCategoryLimits(updatedLimits);
    await AsyncStorage.setItem('category_limits', JSON.stringify(updatedLimits));
    
    setNewCatName('');
    setNewCatLimit('');
 };

 // Delete Category Limit
 const deleteCategoryLimit = async (name: string) => {
    const newLimits = { ...categoryLimits };
    delete newLimits[name];
    setCategoryLimits(newLimits);
    await AsyncStorage.setItem('category_limits', JSON.stringify(newLimits));
 };

 return (
   <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
     
     {/* Header */}
     <View style={styles.header}>
       <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Settings</Text>
       <Text style={[styles.headerSubtitle, { color: theme.colors.text.tertiary }]}>Preferences & Data Control</Text>
     </View>

     <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
       
       {/* GENERAL SECTION */}
       <SectionHeader title="General" />
       <View style={styles.sectionContainer}>
           <SettingItem 
               icon="dark-mode" color="#6366f1" label="Dark Mode"
               rightElement={
                   <Switch
                       value={theme.mode === 'dark'}
                       onValueChange={toggleTheme}
                       trackColor={{ false: '#e2e8f0', true: theme.colors.primary.start }}
                       thumbColor={'#fff'} 
                   />
               } 
           />
           <SettingItem 
               icon="fingerprint" color="#8b5cf6" label="Biometric Lock"
               rightElement={
                   <Switch
                       value={biometricEnabled}
                       onValueChange={toggleBiometric}
                       trackColor={{ false: '#e2e8f0', true: theme.colors.primary.start }}
                       thumbColor={'#fff'} 
                   />
               } 
           />
       </View>

       {/* FINANCIAL SECTION */}
       <SectionHeader title="Financial" />
       <View style={styles.sectionContainer}>
             <SettingItem 
               icon="attach-money" color="#10b981" label="Currency"
               value={baseCurrency}
               onPress={() => setCurrencyModalVisible(true)}
           />
           <SettingItem 
               icon="account-balance-wallet" color="#f59e0b" label="Monthly Budget"
               value={formatAmount(monthlyBudget)}
               onPress={openBudgetModal}
           />
           <SettingItem 
               icon="pie-chart" color="#ec4899" label="Category Alerts"
               value={Object.keys(categoryLimits).length + " Active"}
               onPress={() => setCatLimitModalVisible(true)}
           />
       </View>

       {/* DATA SECTION */}
       <SectionHeader title="Data Management" />
       <View style={styles.sectionContainer}>
           <SettingItem 
               icon="table-view" color="#10b981" label="Export as CSV"
               onPress={() => exportData(expenses, 'csv', currencySymbol)} 
           />
           <SettingItem 
               icon="picture-as-pdf" color="#ef4444" label="Export as PDF"
               onPress={() => exportData(expenses, 'pdf', currencySymbol)} 
           />
       </View>

       {/* DANGER SECTION */}
       <SectionHeader title="Danger Zone" />
       <View style={[styles.sectionContainer, styles.dangerContainer]}>
             <SettingItem 
               icon="delete-forever" color="#ef4444" label="Erase All Data"
               isDestructive
               onPress={handleClearAll} 
           />
       </View>

       <View style={styles.footer}>
           <Text style={[styles.footerText, { color: theme.colors.text.tertiary }]}>Version 1.0.0</Text>
       </View>

     </ScrollView>

     {/* --- CURRENCY MODAL --- */}
     <Modal visible={isCurrencyModalVisible} animationType="slide" transparent>
         <View style={styles.modalOverlay}>
             <View style={[styles.modalContent, { backgroundColor: theme.colors.background.primary }]}>
                 <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Select Currency</Text>
                 <FlatList 
                     data={Object.entries(currencies)}
                     keyExtractor={([code]) => code}
                     renderItem={({ item: [code, info] }) => (
                         <TouchableOpacity 
                           style={[styles.currencyItem, { backgroundColor: baseCurrency === code ? theme.colors.background.tertiary : 'transparent' }]}
                           onPress={() => { changeBaseCurrency(code as CurrencyCode); setCurrencyModalVisible(false); }}
                         >
                             <Text style={{ fontSize: 24, marginRight: 16 }}>{info.symbol}</Text>
                             <Text style={[styles.currencyName, { color: theme.colors.text.primary }]}>{info.name} ({code})</Text>
                             {baseCurrency === code && <Icon name="check" size={20} color={theme.colors.primary.start} />}
                         </TouchableOpacity>
                     )}
                 />
                 <TouchableOpacity onPress={() => setCurrencyModalVisible(false)} style={styles.modalCloseBtn}>
                     <Text style={{ color: theme.colors.text.secondary }}>Close</Text>
                 </TouchableOpacity>
             </View>
         </View>
     </Modal>

     {/* --- BUDGET MODAL --- */}
     <Modal visible={isBudgetModalVisible} animationType="fade" transparent>
         <View style={styles.modalOverlay}>
             <View style={[styles.budgetModalContent, { backgroundColor: theme.colors.background.primary }]}>
                 <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Set Monthly Budget</Text>
                 <View style={[styles.inputWrapper, { backgroundColor: theme.colors.background.tertiary }]}>
                     <Text style={{ fontSize: 20, color: theme.colors.text.primary, marginRight: 8 }}>{currencies[baseCurrency].symbol}</Text>
                     <TextInput value={tempBudget} onChangeText={setTempBudget} keyboardType="numeric" style={[styles.budgetInput, { color: theme.colors.text.primary }]} autoFocus />
                 </View>
                 <View style={styles.modalButtons}>
                     <TouchableOpacity onPress={() => setBudgetModalVisible(false)} style={styles.cancelBtn}><Text style={{ color: theme.colors.text.secondary }}>Cancel</Text></TouchableOpacity>
                     <TouchableOpacity onPress={saveBudget} style={[styles.saveBtn, { backgroundColor: theme.colors.primary.start }]}><Text style={{ color: 'white', fontWeight: 'bold' }}>Save</Text></TouchableOpacity>
                 </View>
             </View>
         </View>
     </Modal>

    {/* --- NEW CATEGORY LIMIT MODAL (UPDATED) --- */}
    <Modal visible={isCatLimitModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.background.primary }]}>
                <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>Category Alerts</Text>
                
                {/* 1. List of Active Limits */}
                <View style={{ height: 120, marginBottom: 10 }}>
                    {Object.keys(categoryLimits).length === 0 ? (
                        <Text style={{ color: theme.colors.text.tertiary, fontStyle: 'italic', textAlign: 'center', marginTop: 20 }}>
                            No active alerts. Add one below.
                        </Text>
                    ) : (
                        <FlatList 
                            data={Object.entries(categoryLimits)}
                            keyExtractor={([name]) => name}
                            renderItem={({ item: [name, limit] }) => {
                                // Find icon for display from your list
                                const catIcon = CATEGORIES.find(c => c.name === name)?.icon || '🏷️';
                                return (
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: theme.colors.border }}>
                                        <Text style={{ color: theme.colors.text.primary, fontWeight: 'bold', fontSize: 16 }}>{catIcon} {name}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={{ color: theme.colors.text.secondary, marginRight: 12, fontWeight: '500' }}>
                                                {formatAmount(Number(limit))}
                                            </Text>
                                            <TouchableOpacity onPress={() => deleteCategoryLimit(name)}>
                                                <Icon name="delete" size={20} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            }}
                        />
                    )}
                </View>

                <View style={{ height: 1, backgroundColor: theme.colors.border, marginVertical: 10 }} />

                {/* 2. Select Category (Horizontal List) */}
                <Text style={{ color: theme.colors.text.tertiary, marginBottom: 8, fontSize: 12, fontWeight: 'bold' }}>
                    1. SELECT CATEGORY
                </Text>
                <View style={{ marginBottom: 16 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {CATEGORIES.map((cat) => {
                            const isSelected = newCatName === cat.name;
                            return (
                                <TouchableOpacity 
                                    key={cat.name}
                                    onPress={() => setNewCatName(cat.name)}
                                    style={{
                                        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
                                        backgroundColor: isSelected ? cat.color : theme.colors.background.tertiary,
                                        borderWidth: 1, 
                                        borderColor: isSelected ? 'transparent' : theme.colors.border
                                    }}
                                >
                                    <Text style={{ 
                                        fontSize: 14, 
                                        fontWeight: 'bold', 
                                        color: isSelected ? 'white' : theme.colors.text.primary 
                                    }}>
                                        {cat.icon} {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* 3. Enter Amount */}
                <Text style={{ color: theme.colors.text.tertiary, marginBottom: 8, fontSize: 12, fontWeight: 'bold' }}>
                    2. SET LIMIT FOR "{newCatName || '...'}"
                </Text>
                <TextInput 
                    placeholder="e.g. 5000" 
                    placeholderTextColor={theme.colors.text.tertiary}
                    value={newCatLimit} 
                    onChangeText={setNewCatLimit} 
                    keyboardType="numeric" 
                    style={[styles.inputWrapper, { backgroundColor: theme.colors.background.tertiary, color: theme.colors.text.primary, marginBottom: 0, height: 50 }]} 
                />

                <View style={[styles.modalButtons, { marginTop: 24 }]}>
                    <TouchableOpacity onPress={() => setCatLimitModalVisible(false)} style={styles.cancelBtn}>
                        <Text style={{ color: theme.colors.text.secondary }}>Done</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={saveCategoryLimit} 
                        style={[
                            styles.saveBtn, 
                            { 
                                backgroundColor: newCatName 
                                    ? (CATEGORIES.find(c => c.name === newCatName)?.color || theme.colors.primary.start) 
                                    : theme.colors.border 
                            }
                        ]}
                        disabled={!newCatName}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Alert</Text>
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
 header: { padding: 24 },
 headerTitle: { fontSize: 32, fontWeight: 'bold' },
 headerSubtitle: { fontSize: 16, marginTop: 4 },
 scrollContent: { paddingBottom: 40 },
 sectionHeader: {
   paddingHorizontal: 24, marginBottom: 8, marginTop: 24, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7,
 },
 sectionContainer: { overflow: 'hidden' },
 settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
 settingLeft: { flexDirection: 'row', alignItems: 'center' },
 iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
 settingLabel: { fontSize: 16, fontWeight: '500' },
 settingRight: { flexDirection: 'row', alignItems: 'center' },
 settingValue: { marginRight: 8, fontSize: 14 },
 dangerContainer: { marginBottom: 20 },
 footer: { alignItems: 'center', marginTop: 20 },
 footerText: { fontSize: 14 },
 
 // Modal
 modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
 modalContent: { width: '90%', maxHeight: '85%', borderRadius: 24, padding: 24 },
 budgetModalContent: { width: '85%', borderRadius: 24, padding: 24 },
 modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
 currencyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, borderRadius: 12 },
 currencyName: { flex: 1, fontSize: 16, fontWeight: '500' },
 modalCloseBtn: { alignItems: 'center', padding: 16, marginTop: 8 },
 inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 4, marginBottom: 24 },
 budgetInput: { flex: 1, fontSize: 24, fontWeight: 'bold', height: 50 },
 modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
 cancelBtn: { padding: 12 },
 saveBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
});

export default Settings;