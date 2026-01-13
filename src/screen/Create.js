import { StyleSheet, ScrollView, Text, View, TextInput, Pressable, Alert } from 'react-native'
import React from 'react'
import tailwind from 'twrnc'
import { useState } from 'react'
import { useExpenses } from '../context/ExpenseContext'
import { SafeAreaView } from 'react-native-safe-area-context'




const Create = ({ navigation, route }) => {

  const {addExpense} = useExpenses();
  const [amount, setAmount] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState({
    name:"Food",
    icon : "🍔"
  });

  React.useEffect(() => {
    if (route.params?.category) {
      setCategory(route.params.category);
    }
  }, [route.params?.category])


  const handleAddExpense = () => {
    if (!amount || !title || !category) {

      Alert.alert('All fields are required');
      return;
    }
    // Logic to handle adding the expense
    
    addExpense({
      amount,
      title,
      category,
    });
    setAmount(null);
    setTitle('');
    setCategory(
      {name:"Food",
      icon : "🍔"
    } 
    );

    navigation.goBack();
  }


  const handleCategoryInput = () => {
    navigation.navigate('Category');
  }


  return (
    <SafeAreaView>
    <ScrollView style={tailwind`p-6`}>

      {/* Header section */}
      <Text style={tailwind`text-3xl text-black font-bold`}>
        Add new expense
      </Text>
      <Text style={tailwind`text-base text-gray-600 mt-2 mb-8`}>
        Enter the details of your expense to help you track your spending.
      </Text>

      {/* Expense form section */}
      <View style={tailwind`mb-5`}>

        {/* First text input field */}
        <Text style={tailwind`text-lg font-semibold text-gray-600 mb-2`}>Enter amount</Text>
        <TextInput
          style={tailwind`border border-gray-300 rounded-xl p-4 text-lg`}
          placeholder="$0.00"
          value={amount}
          onChangeText={setAmount}
        />
      </View>



      {/* Second text input field */}
      <View style={tailwind`mb-5`}>
        <Text style={tailwind`text-lg font-semibold text-gray-600 mb-2`}>Title</Text>
        <TextInput
          style={tailwind`border border-gray-300 rounded-xl p-4 text-lg`}
          placeholder="What was this for ?"
          value={title}
          onChangeText={setTitle}
        />
      </View>


      {/* third input category field */}
      <View style={tailwind`mb-5`}>
        <Text style={tailwind`text-lg font-semibold text-gray-600 mb-2`}>Category</Text>

        <Pressable
          style={tailwind`border border-gray-400 rounded-xl p-4 flex-row justify-between items-center`}
          onPress={handleCategoryInput}
        >
          <View style={tailwind`flex-row justify-between items-center `}>
            <Text style={tailwind`text-2xl mr-3`}>{category.icon}</Text>
            <Text style={tailwind`text-lg`}>{category.name  }</Text>
          </View>
          <Text style={tailwind`text-2xl`}>&gt;</Text>
        </Pressable>
      </View>



      {/* footer section */}
      <Pressable style={tailwind`bg-black rounded-lg p-6 mt-8 items-center shadow-lg`}
        onPress={handleAddExpense}>
        <Text style={tailwind` text-white text-center text-lg font-bold`}>Add Expense</Text>
      </Pressable>

    </ScrollView>
    </SafeAreaView>
  )
}

export default Create

const styles = StyleSheet.create({})