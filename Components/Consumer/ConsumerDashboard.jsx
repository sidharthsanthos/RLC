import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import ConsumerDashboardMain from './ConsumerDashboardMain'
import PendingConsumersList from '../ConsumerDashboard/PendingConsumersList'
import CTM from '../ConsumerDashboard/CTM'
import TotalConsumers from '../ConsumerDashboard/TotalConsumers'
import ConsumerDetails from './ConsumerDetails'
import AddConsumer from './AddConsumer'

const Stack = createStackNavigator()

const ConsumerDashboard = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='ConsumerDashboardMain' component={ConsumerDashboardMain} />
      <Stack.Screen name='PendingConsumersList' component={PendingConsumersList} />
      <Stack.Screen name='SalesThisMonth' component={CTM} />
      <Stack.Screen name='PaymentsThisMonth' component={CTM} />
      <Stack.Screen name='TotalConsumers' component={TotalConsumers} />
      <Stack.Screen name='ConsumerDetails' component={ConsumerDetails} />
      <Stack.Screen name='AddConsumer' component={AddConsumer} />
    </Stack.Navigator>
  )
}

export default ConsumerDashboard
