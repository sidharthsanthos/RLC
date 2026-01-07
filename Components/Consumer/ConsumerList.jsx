import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CMain from './CMain';
import ConsumerDetails from './ConsumerDetails';
import CPayment from './CPayment';
import EditConsumer from './EditConsumer';
import OrderDetails from './OrderDetails';
import EditOrder from './EditOrder';
import AddOrder from './AddOrder';
import AddPayment from './AddPayment';
import PendingConsumers from '../ConsumerDashboard/PendingConsumers';
import ConsumerDashboard from './ConsumerDashboard';
import RecentTransactions from './RecentTransactions';

const Stack = createStackNavigator();

const ConsumerList = () => {
  return (
    <Stack.Navigator initialRouteName='Dashboard' screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Dashboard' component={ConsumerDashboard} />
      <Stack.Screen name='ConsumerMain' component={CMain} />
      <Stack.Screen name='ConsumerDetails' component={ConsumerDetails} />
      <Stack.Screen name='ConsumerOrder' component={AddOrder} />
      <Stack.Screen name='ConsumerPayment' component={CPayment} />
      <Stack.Screen name='EditConsumer' component={EditConsumer} />
      <Stack.Screen name='OrderDetails' component={OrderDetails} />
      <Stack.Screen name='RecentTransactions' component={RecentTransactions} />
      <Stack.Screen name='EditOrder' component={EditOrder} />
      <Stack.Screen name='AddOrder' component={AddOrder} />
      <Stack.Screen name='AddPayment' component={AddPayment} />
      <Stack.Screen name='PendingConsumers' component={PendingConsumers} />
    </Stack.Navigator>
  );
};

export default ConsumerList;
