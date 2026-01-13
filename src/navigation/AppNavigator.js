import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Category from "../screen/Category";
import AntDesign from 'react-native-vector-icons/AntDesign';




import Home from "../screen/Home";
import Create from "../screen/Create";
import Insights from "../screen/Insights";


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MyTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={Home} 
      options={{
        tabBarIcon: ({ color, size, focused }) => {
          return <AntDesign name="home" size={24} color={color} />
        }

      }} />
      <Tab.Screen name="Create" component={Create} 
      options={{
        tabBarIcon: ({ color, size, focused }) => {
          return <AntDesign name="pluscircle" size={24} color={color}/>
        }

      }}
      />
      <Tab.Screen name="Insights" component={Insights} 
      options={{
        tabBarIcon: ({ color, size, focused }) => {
          return <AntDesign name="piechart" size={24} color={color} />
        }

      }}/>

    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="BottomTabs"
        component={MyTabs}
      />
      <Stack.Screen
        name="Category"
        component={Category}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          headerShown: false,
        }}

      />

    </Stack.Navigator>
  );
}
