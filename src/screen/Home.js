import { Button, FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import tailwind from 'twrnc'
import EmptyList from '../components/EmptyList'
import { useExpenses } from '../context/ExpenseContext'
import ExpenseItemCard from '../components/ExpenseItemCard'
import { SafeAreaView } from 'react-native-safe-area-context'

export const expensesData = [
  {
    id: "1",
    icon: "🛒",
    title: "Grocery Shopping",
    category: "Food",
    amount: 250.0,
    date: "2025-09-06",
    color: "#FFD700", // Yellow
  },
  {
    id: "2",
    icon: "🚗",
    title: "Uber to Airport",
    category: "Transportation",
    amount: 200.0,
    date: "2025-09-06",
    color: "#FFA07A", // Light Salmon
  },
  {
    id: "3",
    icon: "🍔",
    title: "Burger & Fries",
    category: "Food",
    amount: 180.0,
    date: "2025-09-07",
    color: "#FF6F61", // Coral
  },
  {
    id: "4",
    icon: "🎬",
    title: "Movie Night",
    category: "Entertainment",
    amount: 300.0,
    date: "2025-09-07",
    color: "#6A5ACD", // Slate Blue
  },
  {
    id: "5",
    icon: "💡",
    title: "Electricity Bill",
    category: "Utilities",
    amount: 520.0,
    date: "2025-09-08",
    color: "#F4D03F", // Soft Yellow
  },
  {
    id: "6",
    icon: "📱",
    title: "Mobile Recharge",
    category: "Utilities",
    amount: 199.0,
    date: "2025-09-08",
    color: "#2ECC71", // Green
  },
  {
    id: "7",
    icon: "👕",
    title: "Clothes Shopping",
    category: "Shopping",
    amount: 1200.0,
    date: "2025-09-09",
    color: "#EC7063", // Pink Red
  },
  {
    id: "8",
    icon: "⛽",
    title: "Petrol",
    category: "Transportation",
    amount: 600.0,
    date: "2025-09-09",
    color: "#5DADE2", // Sky Blue
  },
  {
    id: "9",
    icon: "☕",
    title: "Coffee with Friends",
    category: "Food",
    amount: 150.0,
    date: "2025-09-10",
    color: "#A569BD", // Purple
  },
  {
    id: "10",
    icon: "📚",
    title: "Books Purchase",
    category: "Education",
    amount: 450.0,
    date: "2025-09-10",
    color: "#48C9B0", // Teal
  },
];



const Home = ({ navigation }) => {
  const {expenses} = useExpenses();

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  return (
    <SafeAreaView style={tailwind`flex-1`}>
      <View style={tailwind`px-5 pt-5 pb-3`}>
  <Text style={tailwind`text-4xl font-bold text-black`}>Hello 👋</Text>
  <Text style={tailwind`text-base text-gray-500 mt-1`}>Start tracking your expenses daily</Text>
</View>

      <View style={tailwind`bg-black rounded-3xl p-6 mx-5 my-5 items-center shadow-lg`}>
        <Text style={tailwind`text-base text-gray-400`}>Spent so far</Text>
        <Text style={tailwind`text-base text-white text-4xl mt-2 font-bold`}>$ {totalSpent.toFixed()}</Text>
      </View>

      <FlatList
        data={expenses}

        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExpenseItemCard item={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<EmptyList />}
      />

    </SafeAreaView>

  )
}

export default Home

const styles = StyleSheet.create({})