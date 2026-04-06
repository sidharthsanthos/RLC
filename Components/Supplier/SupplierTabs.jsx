import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import SupplierList from './SupplierList';
import SupplierReports from './SupplierReports';
import SOrder from './SOrder';
import { useIsFocused } from '@react-navigation/native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Separate stack for Reports tab
const ReportsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name='ReportsScreen' component={SupplierReports} />
  </Stack.Navigator>
);

function BackToScreen({navigation}){
  const isFocused=useIsFocused();

  useEffect(()=>{
    if(isFocused && navigation){
      const timer = setTimeout(() => {
        navigation.navigate('Index');
      }, 100);
      return () => clearTimeout(timer);
    }
  },[isFocused, navigation]);

  return null;
}

export default function SupplierTabs() {
  return (
    <Tab.Navigator
      initialRouteName='SupplierList'
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0a84ff',
        tabBarInactiveTintColor: '#8e8e93',
      }}
    >

      <Tab.Screen
        name='HomeRedirect'
        component={BackToScreen}
        options={{
          tabBarLabel:"Home",
          tabBarIcon:({color,size})=>(
            <Ionicons name='arrow-back-circle-outline' size={size} color={color}/>
          )
        }}
      />
      
      <Tab.Screen
        name="SupplierList"
        component={SupplierList}
        options={{
          tabBarLabel: "Suppliers",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
          unmountOnBlur: true
        }}
      />

      <Tab.Screen
        name="AddOrder"
        component={SOrder}
        options={{
          tabBarLabel: "Add Order",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
          unmountOnBlur: true
        }}
      />

      <Tab.Screen
        name="SupplierReports"
        component={ReportsStack}
        options={{
          tabBarLabel: "Reports",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
          unmountOnBlur: true
        }}
      />
    </Tab.Navigator>
  );
}
