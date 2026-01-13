import { FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { PieChart } from 'react-native-gifted-charts'
import tailwind from 'twrnc'
import { useExpenses } from '../context/ExpenseContext'
import { processDataForPieChart } from '../helper'
import { SafeAreaView } from 'react-native-safe-area-context'

const Insights = () => {

  const { expenses } = useExpenses();
  const renderListItem = (item) => {
    return (
      <View style={tailwind`flex-row items-center justify-between p-4 border-b border-gray-200`}>
        <View style={tailwind`flex-row items-center`}>
          <View style={[tailwind`w-4 h-4 rounded-full mr-3`, { backgroundColor: item.item.color }]} />

          <Text style={tailwind`text-lg`}>{item.item.name}</Text>

        </View>
        <View style={tailwind`items-end`}>
          <Text style={tailwind`text-base font-bold text-gray-800`}>${item.item.amount.toFixed(2)}</Text>
          <Text style={tailwind`text-sm text-gray-500`}>{item.item.value}%</Text>
        </View>

      </View>
    )

  }

  const PieChartData = processDataForPieChart(expenses);
return (
  <SafeAreaView style={tailwind`flex-1`}>

    <FlatList
      data={PieChartData}
      keyExtractor={(item) => item.name}
      renderItem={renderListItem}
      ListHeaderComponent={
        <>
          <Text style={tailwind`text-3xl font-bold text-center my-6 text-gray-600`}>
            Spending Summary
          </Text>

          <View style={tailwind`items-center mb-6`}>
            <PieChart
              donut
              data={PieChartData}
              showText
              textColor="white"
              innerRadius={50}
            />
          </View>
        </>
      }
      contentContainerStyle={tailwind`pb-10`}
    />

  </SafeAreaView>
);

}

export default Insights

const styles = StyleSheet.create({})