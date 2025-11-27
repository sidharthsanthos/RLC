import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import SMain from './SMain';
import SupplierDetails from './SupplierDetails';

const Stack=createStackNavigator();

const SupplierList = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Screen name='SupplierMain' component={SMain}/>
      <Stack.Screen name='SupplierDetails' component={SupplierDetails}/>
    </Stack.Navigator>
  )
}

export default SupplierList

const styles = StyleSheet.create({})