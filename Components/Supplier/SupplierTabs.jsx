import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import SupplierList from './SupplierList';
import AddSupplier from './AddSupplier';
import AddOrder from './AddOrder';
import SupplierReports from './SupplierReports';
import { useIsFocused } from '@react-navigation/native';
import AddPayment from './AddPayment';

const Tab = createBottomTabNavigator();

function BackToScreen({navigation}){
  const isFocused=useIsFocused();

  useEffect(()=>{
    if(isFocused){
      navigation.navigate('Index')
    }
  },[isFocused]);

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
        }}
      />

      <Tab.Screen
        name="AddSupplier"
        component={AddSupplier}
        options={{
          tabBarLabel: "Add Supplier",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-add-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="AddOrder"
        component={AddOrder}
        options={{
          tabBarLabel: "Add Order",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="AddPayment"
        component={AddPayment}
        options={{
          tabBarLabel: "Add Payment",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="SupplierReports"
        component={SupplierReports}
        options={{
          tabBarLabel: "Reports",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
