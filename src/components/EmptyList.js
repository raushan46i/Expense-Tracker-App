import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import tailwind from 'twrnc'

const EmptyList = ({ title = "No expenses yet",
  message = "Add a new expense to see in your list" }) => {
  return (
    <View style={tailwind`flex-1 p-8 items-center justify-center mt-10`}>
      <Text style={tailwind`text-6xl mb-2`}>📝</Text>
      <Text style={tailwind`text-xl font-bold text-gray-800 mb-2`}>{title}</Text>
      <Text style={tailwind`text-gray-600 text-base text-center`}>{message}</Text>
    </View>
  )
}

export default EmptyList

const styles = StyleSheet.create({})