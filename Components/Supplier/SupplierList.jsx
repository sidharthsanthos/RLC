import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import SMain from './SMain';
import SupplierDetails from './SupplierDetails';
import SOrder from './SOrder';
import SPayment from './SPayment';

const Stack=createStackNavigator();

const SupplierList = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Screen name='SupplierMain' component={SMain}/>
      <Stack.Screen name='SupplierDetails' component={SupplierDetails}/>
      <Stack.Screen name='SupplierOrder' component={SOrder}/>
      <Stack.Screen name='SupplierPayment' component={SPayment}/>
    </Stack.Navigator>
  )
}

export default SupplierList

const styles = StyleSheet.create({})