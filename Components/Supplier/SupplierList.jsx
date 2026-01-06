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
import PendingList from './PendingList';
import PTM from '../SupplierDashboard/PTM';
import TotalSuppliers from '../SupplierDashboard/TotalSuppliers';
import StockValue from '../SupplierDashboard/StockValue';
import AddSupplier from './AddSupplier';
import AddOrder from './AddOrder';
import AddPayment from './AddPayment';
import AddOrder from './AddOrder';
import AddPayment from './AddPayment';

const Stack=createStackNavigator();

const SupplierList = () => {
  return (
    <Stack.Navigator initialRouteName='SupplierMain' screenOptions={{headerShown:false}}>
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
      <Stack.Screen name='StockValue' component={StockValue}/>
      <Stack.Screen name='AddSupplier' component={AddSupplier}/>
      <Stack.Screen name='AddOrder' component={AddOrder}/>
      <Stack.Screen name='AddPayment' component={AddPayment}/>
    </Stack.Navigator>
  )
}

export default SupplierList