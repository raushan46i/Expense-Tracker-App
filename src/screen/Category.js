// Modal Screen for Category Selection

import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import tailwind from 'twrnc'
import { CATEGORIES } from '../constant'


const Category = ({ navigation }) => {
const handleSelectedCategory = (category) => {
    navigation.popTo("BottomTabs",{
        screen: "Create", 
        params:  {category} 
    }
    );

    // you are going back to a screen that,s why pop or goBack is used -popTo()
    // The screen in inside the nested navigator - params  
  }

    const renderItems = ({ item }) => (
        <Pressable style={tailwind`flex-1 bg-white m-2 p-4 shadow-sm rounded-xl items-center m-2 justify-center border border-gray-200`}
            onPress={() => handleSelectedCategory(item)}>
            <Text style={tailwind`text-4xl`}>{item.icon}</Text>
            <Text style={tailwind`mt-2 text-center text-gray-700 font-medium font-bold text-sm`}>
                {item.name}
            </Text>
        </Pressable>
    );
    return (
        <View style={tailwind`flex-1 `}>
            <View style={tailwind`p-5`}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Text style={tailwind`font-bold text-2xl`}>
                        X
                    </Text>
                </Pressable>
                <Text style={tailwind`font-bold text-black mt-4 text-3xl`}>Select Category</Text>
                <Text style={tailwind`font-bold text-gray-500 mt-4 mb-4 text-base`}>Select a Category that best describe what you spent money on </Text>
            </View>

            <FlatList
                data={CATEGORIES}
                renderItem={renderItems}
                keyExtractor={(item) => item.name}
                numColumns={2}
                contentContainerStyle={tailwind`p-4`}
            />
        </View>
    )
}

export default Category

const styles = StyleSheet.create({})