import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  SectionList,
  TouchableOpacity,
  Text,
  View,
  SectionListRenderItem,
  DefaultSectionT,
  StyleSheet
} from 'react-native';
import { groupExpensesByDate, getFilteredExpenses, Expense, Period } from '../utils/helper';
import ExpenseItemCard from './ExpenseItemCard';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SectionData extends DefaultSectionT {
  title: string;
  data: Expense[];
}

interface HistoryModalProps {
  visible: boolean;
  onClose: () => void;
  expenses: Expense[];
}

const HistoryModal: React.FC<HistoryModalProps> = ({ visible, onClose, expenses }) => {
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // 1. Filter Data
  const filteredExpenses = useMemo(() => {
    return selectedPeriod === 'all'
      ? expenses
      : getFilteredExpenses(expenses, selectedPeriod);
  }, [expenses, selectedPeriod]);

  // 2. Group Data
  const sections = useMemo(() => {
    return groupExpensesByDate(filteredExpenses) as unknown as SectionData[];
  }, [filteredExpenses]);

  // 3. Auto-expand all sections initially
  useEffect(() => {
    setExpandedSections(new Set(sections.map((s) => s.title)));
  }, [sections]);

  // 4. Handle Collapse/Expand Logic
  const displaySections: SectionData[] = useMemo(() => {
    return sections.map((section) => ({
      ...section,
      data: expandedSections.has(section.title) ? section.data : [],
    }));
  }, [sections, expandedSections]);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const renderItem: SectionListRenderItem<Expense, SectionData> = ({ item }) => (
    <View style={styles.itemContainer}>
      <ExpenseItemCard item={item} />
    </View>
  );

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <TouchableOpacity
      onPress={() => toggleSection(section.title)}
      activeOpacity={0.7}
      style={[
        styles.sectionHeader,
        {
          backgroundColor: theme.colors.background.secondary, // Must be opaque for sticky effect
          borderColor: theme.colors.border,
          borderBottomWidth: 1,
          borderTopWidth: 1
        }
      ]}
    >
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          {section.title}
        </Text>
        <Icon
          name={expandedSections.has(section.title) ? "expand-less" : "expand-more"}
          size={24}
          color={theme.colors.text.tertiary}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background.primary }]}>

          {/* Header */}
          <View style={[styles.header, { borderColor: theme.colors.border }]}>
            <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
              Transaction History
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Filter Pills */}
          <View style={styles.filterContainer}>
            {(['All', 'Day', 'Week', 'Month', 'Year'] as const).map((label) => {
              const value = label.toLowerCase() as Period;
              const isActive = selectedPeriod === value;
              return (
                <TouchableOpacity
                  key={label}
                  onPress={() => setSelectedPeriod(value)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: isActive ? theme.colors.primary.start : 'transparent',
                      borderColor: isActive ? theme.colors.primary.start : theme.colors.border
                    }
                  ]}
                >
                  <Text
                    style={{
                      color: isActive ? '#fff' : theme.colors.text.secondary,
                      fontWeight: isActive ? '700' : '500',
                      fontSize: 13
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* List */}
          <SectionList<Expense, SectionData>
            sections={displaySections}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={true}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  itemContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
});

export default HistoryModal;