import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import SupplierTabs from '../Supplier/SupplierTabs'
import { createStackNavigator } from '@react-navigation/stack'
import Index from '../Index';

const Stack=createStackNavigator();

const Supplier = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
        <Stack.Screen name='SupplierTabs' component={SupplierTabs}/>
        <Stack.Screen name='Index' component={Index}/>
    </Stack.Navigator>
  )
}

export default Supplier

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});