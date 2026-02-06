import React, { useState } from 'react';
import { FlatList, Pressable, Text, View, TextInput, StatusBar, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES } from '../constant';

interface CategoryItem {
  name: string;
  icon: string;
  color: string;
}

const Category = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories based on search
  const filteredCategories = CATEGORIES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- THE FIX IS HERE ---
  const handleSelectedCategory = (category: CategoryItem) => {
    // 1. Check if Create screen gave us a "returnCategory" function
    if (route.params?.returnCategory) {
      // 2. Call it to update the Create screen
      route.params.returnCategory(category);
    }

    // 3. Close this screen (Go Back)
    // This removes 'Category' from the stack, revealing 'Create' underneath
    navigation.goBack();
  };

  const renderItem = ({ item }: { item: CategoryItem }) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.background.primary,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.8 : 1,
        }
      ]}
      onPress={() => handleSelectedCategory(item)}
    >
      {/* Decorative Background Accent */}
      <View style={[
        styles.cardDecoration,
        { backgroundColor: item.color || theme.colors.primary.start }
      ]} />

      <View style={[
        styles.iconCircle,
        { backgroundColor: theme.isDark ? '#1e293b' : '#f8fafc' }
      ]}>
        <Text style={{ fontSize: 30 }}>{item.icon}</Text>
      </View>

      <Text style={[
        styles.categoryName,
        { color: theme.colors.text.primary }
      ]}>
        {item.name}
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

      {/* Header Section */}
      <View style={[
        styles.headerContainer,
        {
          paddingTop: insets.top,
          backgroundColor: theme.colors.background.primary,
          shadowColor: "#000",
        }
      ]}>
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: theme.colors.background.secondary }]}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Category</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Professional Search Bar */}
        <View style={styles.searchWrapper}>
          <View style={[
            styles.searchContainer,
            {
              backgroundColor: theme.colors.background.secondary,
              borderColor: theme.colors.border
            }
          ]}>
            <Icon name="search" size={20} color={theme.colors.text.tertiary} style={styles.searchIcon} />
            <TextInput
              placeholder="Search categories..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: theme.colors.text.primary }]}
            />
          </View>
        </View>
      </View>

      {/* Grid Section */}
      <FlatList
        data={filteredCategories}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="sentiment-dissatisfied" size={50} color={theme.colors.text.tertiary} />
            <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>No category found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    zIndex: 10,
  },
  navRow: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    flex: 1,
    margin: 8,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    height: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardDecoration: {
    position: 'absolute',
    right: -8,
    top: -8,
    width: 64,
    height: 64,
    borderRadius: 32,
    opacity: 0.1,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
  },
});

export default Category;