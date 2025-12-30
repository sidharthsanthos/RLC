import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CMain from './CMain';
import ConsumerDetails from './ConsumerDetails';
import AddSale from './AddSale';
import CPayment from './CPayment';
import EditConsumer from './EditConsumer';
import OrderDetails from './OrderDetails';
import EditOrder from './EditOrder';
import AddConsumer from './AddConsumer';

const Stack = createStackNavigator();

const ConsumerList = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='ConsumerMain' component={CMain} />
      <Stack.Screen name='ConsumerDetails' component={ConsumerDetails} />
      <Stack.Screen name='ConsumerOrder' component={AddSale} />
      <Stack.Screen name='ConsumerPayment' component={CPayment} />
      <Stack.Screen name='EditConsumer' component={EditConsumer} />
      <Stack.Screen name='OrderDetails' component={OrderDetails} />
      <Stack.Screen name='EditOrder' component={EditOrder} />
      <Stack.Screen name='AddConsumer' component={AddConsumer} />
    </Stack.Navigator>
  );
};

export default ConsumerList;
