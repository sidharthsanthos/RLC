import { StyleSheet } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

const Stack=createStackNavigator();

const Supplier = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Screen name="SupplierTabs">
        {props => {
          const SupplierTabs = require('../Supplier/SupplierTabs').default
          return <SupplierTabs {...props} />
        }}
      </Stack.Screen>
      <Stack.Screen name="Index">
        {props => {
          const Index = require('../Index').default
          return <Index {...props} />
        }}
      </Stack.Screen>
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