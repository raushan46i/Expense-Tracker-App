import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import tailwind from 'twrnc'
import { useExpenses } from '../context/ExpenseContext'


const ExpenseItemCard = ({ item }) => {
    const { deleteExpense } = useExpenses();

    return (
        <View style={tailwind`bg-white rounded-2xl p-4 mb-3 mx-5 items-center justify-between flex-row shadow-sm`}>

            <View style={tailwind`flex-row items-center`}>

                <View style={tailwind`w-12 h-12 rounded-xl bg-gray-100 justify-center items-center mr-4`}>
                    <Text>{item.icon}</Text>
                </View>

                <View>
                    <Text style={tailwind`text-base text-gray-800 font-bold`}>
                        {item.title}
                    </Text>

                    <View style={[tailwind`mt-1 px-2 py-1 rounded-lg self-start`, { backgroundColor: item.color }]}>
                        <Text style={tailwind`text-xs font-bold text-gray-700`}>
                            {item.category}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={tailwind`items-center`}>
                <Text style={tailwind`text-base font-bold text-black`}>${item.amount}</Text>
                <Text style={tailwind`text-xs text-gray-500 mt-1`}>{item.date}</Text>
            </View>

            <TouchableOpacity onPress={() => deleteExpense(item.id)} style={tailwind`ml-3`}>
                <Text style={tailwind`text-red-500 text-xl`}>🗑️</Text>
            </TouchableOpacity>

        </View>
    )
}

export default ExpenseItemCard


