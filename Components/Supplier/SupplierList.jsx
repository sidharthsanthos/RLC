import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import SMain from './SMain';
import SupplierDetails from './SupplierDetails';
import SOrder from './SOrder';
import SPayment from './SPayment';
import EditSupplier from './EditSupplier';
import OrderDetails from './OrderDetails';
import EditOrder from './EditOrder';
import PaymentDetails from './PaymentDetails';
import EditPayment from './EditPayment';
import PendingList from '../Dashboard/PendingList';
import PTM from '../Dashboard/PTM';
import TotalSuppliers from '../Dashboard/TotalSuppliers';

const Stack=createStackNavigator();

const SupplierList = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Screen name='SupplierMain' component={SMain}/>
      <Stack.Screen name='SupplierDetails' component={SupplierDetails}/>
      <Stack.Screen name='SupplierOrder' component={SOrder}/>
      <Stack.Screen name='SupplierPayment' component={SPayment}/>
      <Stack.Screen name='SupplierEdit' component={EditSupplier}/>
      <Stack.Screen name='OrderDetails' component={OrderDetails}/>
      <Stack.Screen name='EditOrder' component={EditOrder}/>
      <Stack.Screen name='PaymentDetails' component={PaymentDetails}/>
      <Stack.Screen name='EditPayment' component={EditPayment}/>
      <Stack.Screen name='PendingSuppliers' component={PendingList}/>
      <Stack.Screen name='PaymentsThisMonth' component={PTM}/>
      <Stack.Screen name='TotalSuppliers' component={TotalSuppliers}/>
    </Stack.Navigator>
  )
}

export default SupplierList

const styles = StyleSheet.create({})